from __future__ import annotations

import logging
from collections import deque
from pathlib import Path
from typing import TYPE_CHECKING

from textual.app import App, ComposeResult
from textual.binding import Binding, BindingType
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

from towelie.project import Project, TowelieContext
from towelie.models import (
    Branch,
    Comment,
    CommitRef,
    FileDiff,
    ReviewSelection,
    Review,
    Selection,
    SelectionState,
    SyntheticRef,
    parse_ref,
)
from towelie.options import (
    DiffSide,
    DiffStyle,
)

if TYPE_CHECKING:
    from collections.abc import Iterable, Sequence

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
        self._root = Path(path).resolve()
        self._allowed: set[Path] = set()
        self.set_diff_paths(diff_paths)

    def set_diff_paths(self, diff_paths: list[str]) -> None:
        self._allowed.clear()
        for rel in diff_paths:
            abs_path = (self._root / rel).resolve()
            self._allowed.add(abs_path)
            for parent in abs_path.parents:
                self._allowed.add(parent)
                if parent == self._root:
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


def _unpack_binding(b: BindingType) -> tuple[str, str]:
    """Extract (key, description) from any BindingType variant."""
    if isinstance(b, Binding):
        return b.key, b.description
    match b:
        case key, _, desc:
            return key, desc
        case _:
            return b[0], ""


def _build_help_line(bindings: Sequence[BindingType]) -> str:
    parts = ["Click line numbers to select"]
    for b in bindings:
        key, desc = _unpack_binding(b)
        parts.append(f"{_KEY_DISPLAY.get(key, key)} {desc.lower()}")
    return "  |  ".join(parts)


def _build_help_md(bindings: Sequence[BindingType]) -> str:
    lines = ["# Keybindings", "", "| Key | Action |", "|-----|--------|"]
    for b in bindings:
        key, desc = _unpack_binding(b)
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

    def __init__(self, app_bindings: Sequence[BindingType]) -> None:
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
            label=f"Comment on {selection.format()}",
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


class RefSelectScreen(ModalScreen[ReviewSelection | None]):
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

    def __init__(self, project: Project, review: Review) -> None:
        super().__init__()
        self._project = project
        self._review = review

    def compose(self) -> ComposeResult:
        with Vertical(id="ref-dialog"):
            yield Static("Base branch", classes="label")
            yield Select[str]([], allow_blank=False, id="base-select")
            yield Static("Branch", classes="label")
            yield Select[str]([], allow_blank=False, id="branch-select")
            yield Static("Commit", classes="label")
            yield Select[str]([], allow_blank=False, id="commit-select")
            with Horizontal(classes="buttons"):
                yield Button("Load", variant="primary", id="load-btn")
                yield Button("Cancel", id="cancel-btn")

    def on_mount(self) -> None:
        self.styles.align = ("center", "middle")
        self.run_worker(self._populate())

    async def _populate(self) -> None:
        info = await self._project.get_info()
        sel = self._review.review_selection

        all_branch_options = [(b.name, b.name) for b in info.branches]
        branch_options: list[tuple[str, str]] = []
        for b in info.branches:
            if b.name == info.current_branch:
                branch_options.insert(0, (f"{b.name} (current)", b.name))
            else:
                branch_options.append((b.name, b.name))

        base_select = self.query_one("#base-select", Select)
        base_select.set_options(all_branch_options)
        base_select.value = sel.base

        branch_select = self.query_one("#branch-select", Select)
        branch_select.set_options(branch_options)
        branch_select.value = sel.branch

        await self._load_commits(sel.branch, sel.base)

    def on_select_changed(self, event: Select.Changed) -> None:
        if event.select.id in ("branch-select", "base-select"):
            branch_val = Branch(str(self.query_one("#branch-select", Select).value))
            base_val = Branch(str(self.query_one("#base-select", Select).value))
            self.run_worker(
                self._load_commits(branch_val, base_val),
                group="load-commits",
                exclusive=True,
            )

    async def _load_commits(self, branch: Branch, base: Branch) -> None:
        commits = await self._project.get_commits(branch, base)
        commit_options = [
            (c.label, c.ref.sha if isinstance(c.ref, CommitRef) else c.ref.value)
            for c in commits
        ]
        commit_select = self.query_one("#commit-select", Select)
        commit_select.set_options(commit_options)
        if commit_options:
            commit_select.value = commit_options[0][1]

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "load-btn":
            branch = str(self.query_one("#branch-select", Select).value)
            base = str(self.query_one("#base-select", Select).value)
            commit_str = str(self.query_one("#commit-select", Select).value)
            ref = parse_ref(commit_str) if commit_str else SyntheticRef.ALL_CHANGES
            self.dismiss(
                ReviewSelection(
                    branch=Branch(branch),
                    base=Branch(base),
                    ref=ref,
                )
            )
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

    def __init__(self, context: TowelieContext) -> None:
        super().__init__()
        self.ctx = context
        self.options = context.options_store.load()
        self.project = context.project
        self.selection_state = SelectionState()
        self.review: Review | None = None
        self._help_line = _build_help_line(self.BINDINGS)

    def compose(self) -> ComposeResult:
        yield Header()
        with Horizontal(id="main-layout"):
            with Vertical(id="sidebar"):
                yield DiffFileTree(
                    self.project.git_root,
                    [],
                    id="file-tree",
                )
            yield VerticalScroll(id="diff-scroll")
        debug_classes = "" if self.ctx.dev_mode() else "-hidden"
        with Vertical(id="debug-panel", classes=debug_classes):
            yield Static("Debug Log", id="debug-title")
            yield RichLog(id="debug-log", wrap=True, markup=True)
        yield Static(self._help_line, id="status-bar")

    async def on_mount(self) -> None:
        log_widget = self.query_one("#debug-log", RichLog)
        _tui_handler.attach(log_widget)
        info = await self.project.get_info()
        selection = ReviewSelection(
            info.current_branch,
            info.base_branch,
            parse_ref(self.options.default_commit),
        )
        self.review = Review(review_selection=selection)
        await self._reload_diffs(selection)

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
        if isinstance(self.selection_state, SelectionState.Complete):
            self.action_add_comment()

    def _update_status(self) -> None:
        selection = self.selection_state.to_selection()
        status = self.query_one("#status-bar", Static)
        if selection is None:
            status.update(self._help_line)
            return

        loc = selection.format()
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
        if self.review is None or not self.review.comments:
            self.notify("No comments to submit", severity="warning")
            return
        self.push_screen(
            SubmitReviewScreen(len(self.review.comments)),
            self._on_submit_review_result,
        )

    def _on_submit_review_result(self, review_text: str | None) -> None:
        if review_text is None:
            return

        assert self.review is not None
        review_text = self.review.build_prompt(
            self.options.prompt.template,
            self.options.prompt.comment_output_mode,
            review_text,
        )

        self.copy_to_clipboard(review_text)
        self.review = Review(self.review.review_selection)
        self.selection_state.clear()
        self._update_status()
        self.notify("Review copied to clipboard!")

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
        assert self.review is not None
        self.review.add_comment(Comment(selection=selection, text=text))
        self.selection_state.clear()
        self._update_status()

    def action_toggle_split(self) -> None:
        for dv in self.query(DiffView):
            dv.split = not dv.split

    def action_toggle_annotations(self) -> None:
        for dv in self.query(DiffView):
            dv.annotations = not dv.annotations

    def action_select_ref(self) -> None:
        assert self.review
        self.push_screen(
            RefSelectScreen(self.project, self.review), self._on_ref_selected
        )

    def _on_ref_selected(self, result: ReviewSelection | None) -> None:
        if result is None:
            return
        logger.debug(
            "Ref selected: branch=%s, base=%s, ref=%s",
            result.branch or "(current)",
            result.base or "(default)",
            result.ref,
        )
        self.review = Review(review_selection=result)
        self.run_worker(self._reload_diffs(result))

    def action_reload_diff(self) -> None:
        if self.review is not None:
            self.run_worker(self._reload_diffs(self.review.review_selection))

    async def _reload_diffs(self, project_ref: ReviewSelection) -> None:
        """Fetch diffs for the selected ref and replace all DiffViews."""
        logger.info("Loading diff for ref: %s", project_ref)
        self.notify("Loading diff\u2026")
        diff = await self.project.compute_diff_result(project_ref)

        if not diff.file_diffs:
            self.notify("No changes found for this selection", severity="warning")
            return

        logger.info("Loaded %d file diffs", len(diff.file_diffs))

        if self.review is not None:
            self.review.comments.clear()
        self.selection_state.clear()

        file_tree = self.query_one("#file-tree", DiffFileTree)
        file_tree.set_diff_paths([fd.file_path for fd in diff.file_diffs])
        file_tree.reload()

        use_split = self.options.diff.style == DiffStyle.TWO_SIDES
        scroll = self.query_one("#diff-scroll", VerticalScroll)
        await scroll.remove_children()

        def _sort_key(fd: FileDiff) -> tuple:
            parts = Path(fd.file_path).parts
            return (*((0, p.lower()) for p in parts[:-1]), (1, parts[-1].lower()))

        for fd in sorted(diff.file_diffs, key=_sort_key):
            dv = DiffView(
                fd.file_path,
                fd.file_path,
                fd.old_content,
                fd.new_content,
                split=use_split,
                id=_safe_id(fd.file_path),
            )
            await scroll.mount(dv)

        self._update_status()


async def run_tui() -> None:
    tc = await TowelieContext.new()
    app = TowelieApp(tc)
    await app.run_async()
