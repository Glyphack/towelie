from __future__ import annotations

import logging
from collections import deque
from pathlib import Path
from typing import TYPE_CHECKING

from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.message import Message
from textual.screen import ModalScreen
from textual.widgets import (
    Button,
    DirectoryTree,
    Header,
    Markdown,
    RichLog,
    Select,
    Static,
    TextArea,
)

from textual_diff_view import DiffView
from textual_diff_view._diff_view import (
    DiffScrollContainer,
    LineAnnotations,
)

from towelie.app import Project, build_initial_file_diffs
from towelie.models import (
    UNCOMMITTED,
    CommentRecord,
    FileDiff,
    ProjectRef,
    Review,
    Selection,
    SelectionState,
    build_review_prompt,
)
from towelie.options import (
    AppOptions,
    DiffSide,
    DiffStyle,
    OptionsStore,
)

if TYPE_CHECKING:
    from collections.abc import Iterable

    from textual import events

logger = logging.getLogger("towelie.tui")


class _TuiLogHandler(logging.Handler):
    """Buffers log records and optionally streams them to a RichLog widget."""

    def __init__(self) -> None:
        super().__init__()
        self._buffer: deque[str] = deque(maxlen=1000)
        self._widget: RichLog | None = None

    def attach(self, widget: RichLog) -> None:
        self._widget = widget
        for msg in self._buffer:
            widget.write(msg)

    def detach(self) -> None:
        self._widget = None

    def emit(self, record: logging.LogRecord) -> None:
        msg = self.format(record)
        self._buffer.append(msg)
        if self._widget is not None:
            import contextlib

            with contextlib.suppress(Exception):
                self._widget.write(msg)


_tui_handler = _TuiLogHandler()
_tui_handler.setFormatter(
    logging.Formatter("[%(asctime)s] %(levelname)s: %(message)s", datefmt="%H:%M:%S")
)
logger.addHandler(_tui_handler)
logger.setLevel(logging.DEBUG)


# Send a click event when annotations are clicked so we know user is selecting.
class AnnotationClicked(Message):
    def __init__(self, annotation_widget: LineAnnotations, y: int) -> None:
        self.annotation_widget = annotation_widget
        self.y = y
        super().__init__()


def annotation_on_click(self: LineAnnotations, event: events.Click) -> None:
    self.post_message(AnnotationClicked(self, event.y))


LineAnnotations.on_click = annotation_on_click  # type: ignore


def _determine_diff_side(widget: LineAnnotations) -> DiffSide:
    """Return OLD or NEW for a clicked LineAnnotations."""
    group = widget.parent
    if group is None:
        return DiffSide.NEW

    la_siblings = [c for c in group.children if isinstance(c, LineAnnotations)]
    try:
        index = la_siblings.index(widget)
    except ValueError:
        return DiffSide.NEW

    is_split = sum(1 for c in group.children if isinstance(c, DiffScrollContainer)) >= 2
    if is_split:
        return DiffSide.OLD if index < len(la_siblings) // 2 else DiffSide.NEW
    else:
        return DiffSide.OLD if index == 0 else DiffSide.NEW


def _safe_id(path: str) -> str:
    """Sanitize file paths for use as Textual widget IDs.

    Textual requires widget IDs to match CSS identifier rules (no slashes,
    dots, or spaces).  This converts an arbitrary file path into a safe
    hyphenated string prefixed with ``dv-``.
    """
    return "dv-" + path.replace("/", "--").replace(".", "-").replace(" ", "-")


class DiffFileTree(DirectoryTree):
    def __init__(self, path: str | Path, diff_paths: list[str], **kwargs) -> None:
        super().__init__(path, **kwargs)
        root = Path(path).resolve()
        self._allowed: set[Path] = set()
        for rel in diff_paths:
            abs_path = (root / rel).resolve()
            self._allowed.add(abs_path)
            for parent in abs_path.parents:
                self._allowed.add(parent)
                if parent == root:
                    break

    def filter_paths(self, paths: Iterable[Path]) -> Iterable[Path]:
        return [p for p in paths if p in self._allowed]

    def _populate_node(self, node, content) -> None:
        super()._populate_node(node, content)
        for child in node.children:
            if child.allow_expand:
                child.expand()


_KEY_DISPLAY = {
    "question_mark": "?",
    "escape": "ESC",
}

_HELP_MD_FOOTER = """\

## Selection

1. Click a **line number** in the gutter to set an anchor.
2. Click a **second line number** (same file & side) to complete the range.
3. Press **c** to comment on the selected range.

## Comments

Comments support **Markdown** formatting.
"""


def _build_help_line(bindings: list[tuple[str, str, str]]) -> str:
    parts = ["Click line numbers to select"]
    for key, _action, desc in bindings:
        parts.append(f"{_KEY_DISPLAY.get(key, key)} {desc.lower()}")
    return "  |  ".join(parts)


def _build_help_md(bindings: list[tuple[str, str, str]]) -> str:
    lines = ["# Keybindings", "", "| Key | Action |", "|-----|--------|"]
    for key, _action, desc in bindings:
        display = _KEY_DISPLAY.get(key, key)
        lines.append(f"| **{display}** | {desc} |")
    return "\n".join(lines) + _HELP_MD_FOOTER


class HelpScreen(ModalScreen[None]):
    CSS = """
    HelpScreen { align: center middle; }
    #help-dialog {
        width: 64; max-width: 90%; height: auto; max-height: 80%;
        border: thick $accent; background: $surface; padding: 1 2; overflow-y: auto;
    }
    #help-dialog Button { margin-top: 1; width: 100%; }
    """

    BINDINGS = [("escape", "close", "Close"), ("question_mark", "close", "Close")]

    def __init__(self, app_bindings: list[tuple[str, str, str]]) -> None:
        super().__init__()
        self._help_md = _build_help_md(app_bindings)

    def compose(self) -> ComposeResult:
        with Vertical(id="help-dialog"):
            yield Markdown(self._help_md)
            yield Button("Close", id="help-close-btn")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "help-close-btn":
            self.dismiss(None)

    def action_close(self) -> None:
        self.dismiss(None)


class TextInputModal(ModalScreen[str | None]):
    CSS = """
    #modal-dialog {
        width: 80;
        max-width: 90%;
        height: auto;
        max-height: 24;
        border: thick $accent;
        background: $surface;
        padding: 1 2;
    }
    #modal-dialog #modal-title {
        margin-bottom: 1;
        text-style: bold;
    }
    #modal-dialog #modal-label {
        margin-bottom: 0;
        color: $text-muted;
    }
    #modal-dialog TextArea {
        height: 8;
    }
    #modal-dialog .buttons {
        height: auto;
        margin-top: 1;
        align: right middle;
    }
    #modal-dialog .buttons Button {
        margin-left: 1;
    }
    """

    BINDINGS = [("escape", "cancel", "Cancel")]

    def __init__(
        self,
        title: str,
        label: str,
        *,
        placeholder: str = "",
        submit_label: str = "Save",
    ) -> None:
        super().__init__()
        self._title = title
        self._label = label
        self._placeholder = placeholder
        self._submit_label = submit_label

    def compose(self) -> ComposeResult:
        with Vertical(id="modal-dialog"):
            yield Static(self._title, id="modal-title")
            yield Static(self._label, id="modal-label")
            yield TextArea(id="modal-input", placeholder=self._placeholder)
            with Horizontal(classes="buttons"):
                yield Button(self._submit_label, variant="primary", id="submit-btn")
                yield Button("Cancel", id="cancel-btn")

    def on_mount(self) -> None:
        self.styles.align = ("center", "middle")
        self.query_one("#modal-input", TextArea).focus()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "submit-btn":
            text = self.query_one("#modal-input", TextArea).text.strip()
            self.dismiss(text)
        else:
            self.dismiss(None)

    def action_cancel(self) -> None:
        self.dismiss(None)


class CommentScreen(TextInputModal):
    def __init__(self, selection: Selection) -> None:
        super().__init__(
            title="Add Comment",
            label=f"Comment on {selection.format_loc()}",
        )


class SubmitReviewScreen(TextInputModal):
    """Modal dialog for submitting the review (copies to clipboard)."""

    def __init__(self, comment_count: int) -> None:
        super().__init__(
            title="Submit Review",
            label=f"{comment_count} comment(s) will be included",
            placeholder="Overall thoughts (optional)\u2026",
            submit_label="Submit & Copy to Clipboard",
        )

    def on_mount(self) -> None:
        super().on_mount()
        self.query_one("#submit-btn", Button).focus()


class RefSelectScreen(ModalScreen[ProjectRef | None]):
    CSS = """
    #ref-dialog {
        width: 72;
        max-width: 90%;
        height: auto;
        max-height: 80%;
        border: thick $accent;
        background: $surface;
        padding: 1 2;
    }
    #ref-dialog .label {
        margin-top: 1;
        margin-bottom: 0;
        color: $text-muted;
    }
    #ref-dialog Select {
        width: 100%;
    }
    #ref-dialog .buttons {
        height: auto;
        margin-top: 1;
        align: right middle;
    }
    #ref-dialog .buttons Button {
        margin-left: 1;
    }
    """

    BINDINGS = [("escape", "cancel", "Cancel")]

    def __init__(self, project: Project, default_commit: str = "") -> None:
        super().__init__()
        self._project = project
        self._default_commit = default_commit

    def compose(self) -> ComposeResult:
        with Vertical(id="ref-dialog"):
            yield Static("Base branch", classes="label")
            yield Select([], allow_blank=True, id="base-select")
            yield Static("Branch", classes="label")
            yield Select([], allow_blank=True, id="branch-select")
            yield Static("Commit", classes="label")
            yield Select([], allow_blank=True, id="commit-select")
            with Horizontal(classes="buttons"):
                yield Button("Load", variant="primary", id="load-btn")
                yield Button("Cancel", id="cancel-btn")

    async def on_mount(self) -> None:
        self.styles.align = ("center", "middle")
        self.run_worker(self._load_data())

    async def _load_data(self) -> None:
        (
            branch_names,
            current_branch,
            base_branch,
        ) = await self._project.get_branch_info()

        all_branch_options: list[tuple[str, str]] = [(b, b) for b in branch_names]
        base_select = self.query_one("#base-select", Select)
        base_select.set_options(all_branch_options)
        base_select.value = base_branch

        branch_options: list[tuple[str, str]] = []
        for name in branch_names:
            if name == current_branch:
                branch_options.insert(0, (f"{name} (current)", name))
            else:
                branch_options.append((name, name))
        branch_select = self.query_one("#branch-select", Select)
        branch_select.set_options(branch_options)
        branch_select.value = current_branch

        await self._load_commits(current_branch, base_branch)

    async def _load_commits(self, branch: str, base: str) -> None:
        commits = await self._project.get_commits(branch, base)
        commit_options = [(c.label, c.hash) for c in commits]
        commit_select = self.query_one("#commit-select", Select)
        commit_select.set_options(commit_options)

        for _label, val in commit_options:
            if val == self._default_commit:
                commit_select.value = val
                return
        if commit_options:
            commit_select.value = commit_options[0][1]

    def on_select_changed(self, event: Select.Changed) -> None:
        if (
            event.select.id in ("branch-select", "base-select")
            and event.value != Select.BLANK
        ):
            branch_val = self.query_one("#branch-select", Select).value
            base_val = self.query_one("#base-select", Select).value
            if branch_val != Select.BLANK and base_val != Select.BLANK:
                self.run_worker(
                    self._load_commits(str(branch_val), str(base_val)),
                    group="load-commits",
                    exclusive=True,
                )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "load-btn":
            branch_val = self.query_one("#branch-select", Select).value
            base_val = self.query_one("#base-select", Select).value
            commit_val = self.query_one("#commit-select", Select).value

            branch = str(branch_val) if branch_val != Select.BLANK else ""
            base = str(base_val) if base_val != Select.BLANK else ""
            commit = str(commit_val) if commit_val != Select.BLANK else ""

            self.dismiss(ProjectRef(branch=branch, base=base, commit=commit))
        else:
            self.dismiss(None)

    def action_cancel(self) -> None:
        self.dismiss(None)


class TowelieApp(App):
    CSS = """
    Screen {
        background: $surface;
    }
    #main-layout {
        height: 1fr;
    }
    #sidebar {
        width: 36;
        dock: left;
        border-right: solid $primary;
        background: $boost;
    }
    #sidebar.-hidden {
        display: none;
    }
    #sidebar Tree {
        padding: 0 1;
    }
    #diff-scroll {
        width: 1fr;
    }
    #status-bar {
        dock: bottom;
        height: 1;
        background: $accent;
        color: $text;
        padding: 0 1;
    }
    DiffView {
        margin-bottom: 1;
    }
    #debug-panel {
        dock: bottom;
        height: 14;
        border-top: solid $primary;
        background: $boost;
    }
    #debug-panel.-hidden {
        display: none;
    }
    #debug-title {
        height: 1;
        background: $primary;
        color: $text;
        padding: 0 1;
    }
    #debug-log {
        height: 1fr;
    }
    """

    TITLE = "towelie"
    SUB_TITLE = "code review"

    BINDINGS = [
        ("q", "quit", "Quit"),
        ("escape", "clear_selection", "Clear"),
        ("question_mark", "show_help", "Help"),
        ("c", "add_comment", "Comment"),
        ("f", "toggle_sidebar", "Files"),
        ("r", "select_ref", "Ref"),
        ("d", "toggle_debug", "Debug"),
        ("s", "toggle_split", "Split/Unified"),
        ("a", "toggle_annotations", "Annotations"),
        ("S", "submit_review", "Submit"),
        ("R", "reload_diff", "Reload"),
    ]

    def __init__(self, file_diffs: list[FileDiff], *, project: Project) -> None:
        super().__init__()
        self.file_diffs = file_diffs
        self.project = project
        self.options: AppOptions = OptionsStore().load()
        self.selection_state = SelectionState()
        self.comments: list[CommentRecord] = []
        self._current_ref = ProjectRef(branch="", base="", commit=UNCOMMITTED)
        self._help_line = _build_help_line(self.BINDINGS)

    def compose(self) -> ComposeResult:
        yield Header()
        with Horizontal(id="main-layout"):
            with Vertical(id="sidebar", classes="-hidden"):
                yield DiffFileTree(
                    self.project.git_root,
                    [fd.file_path for fd in self.file_diffs],
                    id="file-tree",
                )
            yield VerticalScroll(id="diff-scroll")
        with Vertical(id="debug-panel"):
            yield Static("Debug Log", id="debug-title")
            yield RichLog(id="debug-log", wrap=True, markup=True)
        yield Static(self._help_line, id="status-bar")

    async def on_mount(self) -> None:
        log_widget = self.query_one("#debug-log", RichLog)
        _tui_handler.attach(log_widget)
        logger.info(
            "TUI started \u2014 project=%s, files=%d",
            self.project.git_root,
            len(self.file_diffs),
        )
        if self.file_diffs:
            await self._mount_diff_views(self.file_diffs)
        else:
            self.notify(
                "No uncommitted changes found. Press r to select a branch/commit.",
                timeout=8,
            )

    async def _mount_diff_views(self, file_diffs: list[FileDiff]) -> None:
        use_split = self.options.diff.style == DiffStyle.TWO_SIDES
        scroll = self.query_one("#diff-scroll", VerticalScroll)

        # Sort the files in the same order we show them in DirectoryTree
        def _sort_key(fd: FileDiff) -> tuple:
            # Order directories before files at each level.
            parts = Path(fd.file_path).parts
            return (*((0, p.lower()) for p in parts[:-1]), (1, parts[-1].lower()))

        for fd in sorted(file_diffs, key=_sort_key):
            dv = DiffView(
                fd.file_path,
                fd.file_path,
                fd.old_content,
                fd.new_content,
                split=use_split,
                id=_safe_id(fd.file_path),
            )
            await scroll.mount(dv)

    def on_annotation_clicked(self, message: AnnotationClicked) -> None:
        widget = message.annotation_widget
        y = message.y

        if not (0 <= y <= len(widget.numbers)):
            return

        # Only works if you click on the number exactly not anywhere on the gutter.
        # TODO: Does not work with wrapped lines
        digits = "".join(c for c in widget.numbers[y].plain if c.isdigit())
        line_number = int(digits) if digits else None
        if line_number is None:
            logger.warning(f"Clicked line annotation has no numbers: {widget.numbers}")
            return

        diff_view = widget.parent
        while diff_view is not None:
            if isinstance(diff_view, DiffView):
                break
            diff_view = diff_view.parent
        assert diff_view is not None
        file_name: str = diff_view.path_modified
        side = _determine_diff_side(widget)

        logger.debug(
            "Annotation click: file=%s y=%d line=%d side=%s",
            file_name,
            y,
            line_number,
            side,
        )

        self.selection_state.select(file_name, side, line_number)
        self._update_status()

    def _update_status(self) -> None:
        selection = self.selection_state.to_selection()
        status = self.query_one("#status-bar", Static)
        if selection is None:
            status.update(self._help_line)
            return

        loc = selection.format_loc()
        if self.selection_state.is_selecting:
            status.update(
                f"Selecting: {loc}  \u2014 click another line to complete range"
            )
        else:
            status.update(f"Selected: {loc}  \u2014 press c to comment")

    def action_clear_selection(self) -> None:
        self.selection_state.clear()
        self._update_status()

    def action_show_help(self) -> None:
        self.push_screen(HelpScreen(self.BINDINGS))

    def action_toggle_sidebar(self) -> None:
        self.query_one("#sidebar").toggle_class("-hidden")

    def action_toggle_debug(self) -> None:
        self.query_one("#debug-panel").toggle_class("-hidden")

    def on_directory_tree_file_selected(
        self, event: DirectoryTree.FileSelected
    ) -> None:
        rel_path = str(event.path.relative_to(self.project.git_root))
        target_id = _safe_id(rel_path)
        dv = self.query_one(f"#{target_id}", DiffView)
        dv.scroll_visible(animate=True)

    def action_submit_review(self) -> None:
        if not self.comments:
            self.notify("No comments to submit", severity="warning")
            return
        self.push_screen(
            SubmitReviewScreen(len(self.comments)),
            self._on_submit_review_result,
        )

    def _on_submit_review_result(self, notes: str | None) -> None:
        if notes is None:
            return

        review = Review(
            comments=list(self.comments),
            notes=notes,
        )
        review_text = build_review_prompt(
            review,
            self.options.prompt.template,
            self.options.prompt.comment_output_mode,
        )

        self.copy_to_clipboard(review_text)
        self.comments.clear()
        self.selection_state.clear()
        self._update_status()
        self.notify("Review copied to clipboard!")
        logger.info("Review with %d comments copied to clipboard", len(review.comments))

    def action_add_comment(self) -> None:
        selection = self.selection_state.start_commenting()
        if selection is None:
            self.notify("No lines selected for comment", severity="warning")
            return
        self.push_screen(CommentScreen(selection), self._on_comment_result)

    def _on_comment_result(self, text: str | None) -> None:
        if text is None:
            self.selection_state.clear()
            self._update_status()
            return
        if not text:
            self.notify("Comment cannot be empty", severity="warning")
            return
        selection = self.selection_state.to_selection()
        if selection is None:
            self.notify("Selection lost during commenting", severity="error")
            return
        comment = CommentRecord(selection=selection, text=text)
        self.comments.append(comment)
        self.selection_state.clear()
        self._update_status()

    def action_toggle_split(self) -> None:
        for dv in self.query(DiffView):
            dv.split = not dv.split

    def action_toggle_annotations(self) -> None:
        for dv in self.query(DiffView):
            dv.annotations = not dv.annotations

    def action_select_ref(self) -> None:
        self.push_screen(
            RefSelectScreen(self.project, self.options.default_commit),
            self._on_ref_selected,
        )

    def _on_ref_selected(self, result: ProjectRef | None) -> None:
        if result is None:
            return
        logger.info(
            "Ref selected: branch=%s, base=%s, commit=%s",
            result.branch or "(current)",
            result.base or "(default)",
            result.commit or "(all)",
        )
        self.run_worker(self._reload_diffs(result))

    def action_reload_diff(self) -> None:
        self.run_worker(self._reload_diffs(self._current_ref))

    async def _reload_diffs(self, project_ref: ProjectRef) -> None:
        """Fetch diffs for the selected ref and replace all DiffViews."""
        self._current_ref = project_ref
        logger.info("Loading diff for ref: %s", project_ref)
        self.notify("Loading diff\u2026")
        file_diffs = await self.project.build_file_diffs_for_ref(project_ref)

        if not file_diffs:
            logger.info("No changes found for selection")
            self.notify("No changes found for this selection", severity="warning")
            return

        logger.info("Loaded %d file diffs", len(file_diffs))

        self.file_diffs = file_diffs
        self.comments.clear()
        self.selection_state.clear()

        scroll = self.query_one("#diff-scroll", VerticalScroll)
        await scroll.remove_children()
        await self._mount_diff_views(self.file_diffs)

        old_tree = self.query_one("#file-tree", DiffFileTree)
        sidebar = self.query_one("#sidebar")
        await old_tree.remove()
        new_tree = DiffFileTree(
            self.project.git_root,
            [fd.file_path for fd in self.file_diffs],
            id="file-tree",
        )
        await sidebar.mount(new_tree)

        self._update_status()


def run_tui(path: str | None = None) -> None:
    repo_path = Path(path) if path else None
    project, file_diffs = build_initial_file_diffs(repo_path)
    app = TowelieApp(file_diffs, project=project)
    app.run()
