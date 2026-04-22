from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import StrEnum
from typing import TYPE_CHECKING, NewType

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from towelie.project import TowelieContext

Branch = NewType("Branch", str)


class DiffStyle(StrEnum):
    INLINE = "inline"
    TWO_SIDES = "two_sides"


class CommentOutputMode(StrEnum):
    LINE_NUMBERS = "line_numbers"
    SELECTED_LINES = "selected_lines"


class DiffSide(StrEnum):
    OLD = "old"
    NEW = "new"


logger = logging.getLogger(__name__)


@dataclass
class CheckPass:
    output: str


@dataclass
class CheckFail:
    output: str
    error: str


@dataclass
class CheckNoChecks:
    pass


CheckResult = CheckPass | CheckFail | CheckNoChecks


@dataclass
class WorkingTree:
    """Current files"""


@dataclass
class IndexRef:
    """Refers to staged changes"""


@dataclass
class CommitRef:
    """A specific commit"""

    sha: str


GitRef = WorkingTree | IndexRef | CommitRef


class SyntheticRef(StrEnum):
    ALL_CHANGES = "__all__"
    UNCOMMITTED = "__uncommitted__"
    STAGED = "__staged__"
    UNSTAGED = "__unstaged__"

    @property
    def label(self) -> str:
        return {
            SyntheticRef.ALL_CHANGES: "All changes",
            SyntheticRef.UNCOMMITTED: "Uncommitted",
            SyntheticRef.STAGED: "Staged changes",
            SyntheticRef.UNSTAGED: "Unstaged changes",
        }[self]


@dataclass
class Commit:
    ref: CommitRef | SyntheticRef
    label: str

    @classmethod
    def from_ref(cls, ref: CommitRef | SyntheticRef) -> Commit:
        label = ref.label if isinstance(ref, SyntheticRef) else ref.sha[:7]
        return cls(ref=ref, label=label)

    def to_option(self):
        return (
            self.label,
            self.ref.sha if isinstance(self.ref, CommitRef) else self.ref.value,
        )


def parse_ref(value: str) -> CommitRef | SyntheticRef:
    try:
        return SyntheticRef(value)
    except ValueError:
        return CommitRef(sha=value)


@dataclass
class DiffSettings:
    old: GitRef
    new: GitRef


@dataclass
class FileDiff:
    file_path: str
    old_content: str
    new_content: str


@dataclass
class DiffResult:
    """Result of diffing two commits."""

    raw_diff: str
    files: list[str]
    file_diffs: list[FileDiff] = field(default_factory=list)


@dataclass
class Line:
    """A single line reference in a diff: file path, side, and line number."""

    file_path: str
    diff_side: DiffSide
    line_number: int


class Selection(BaseModel):
    fileName: str
    startLine: int
    endLine: int
    diffSide: DiffSide

    def format(self) -> str:
        side = "new" if self.diffSide == DiffSide.NEW else "old"
        if self.startLine == self.endLine:
            return f"{self.fileName}:{self.startLine} ({side})"
        return f"{self.fileName}:{self.startLine}-{self.endLine} ({side})"


class Comment(BaseModel):
    selection: Selection
    text: str
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    created_at: float = Field(default_factory=time.time)


@dataclass
class ReviewSelection:
    """What is selected to be reviewed"""

    branch: Branch
    base: Branch
    commit: Commit


@dataclass
class Review:
    review_selection: ReviewSelection
    comments: list[Comment] = field(default_factory=list)

    def add_comment(self, c: Comment):
        self.comments.append(c)

    @staticmethod
    def _format_comment_block(
        comment: Comment,
        mode: CommentOutputMode,
        source_lines: dict[str, str] | None = None,
    ) -> str:
        """Format a single comment as XML, matching the frontend output."""
        sel = comment.selection
        side_label = (
            "old code (before the change)"
            if sel.diffSide == DiffSide.OLD
            else "new code (after the change)"
        )
        line_label = (
            str(sel.startLine)
            if sel.startLine == sel.endLine
            else f"{sel.startLine}-{sel.endLine}"
        )
        loc = (
            f'  <location file="{sel.fileName}"'
            f' lines="{line_label}" side="{side_label}" />'
        )
        if (
            mode == CommentOutputMode.SELECTED_LINES
            and source_lines
            and comment.id in source_lines
        ):
            src = source_lines[comment.id]
            return (
                f"<comment>\n{loc}\n"
                f"  <source_lines>{src}</source_lines>\n"
                f"  <text>{comment.text}</text>\n</comment>"
            )
        return f"<comment>\n{loc}\n  <text>{comment.text}</text>\n</comment>"

    async def build_prompt(
        self,
        context: TowelieContext,
        review_text: str,
    ) -> str:
        """Build the full review prompt from this Review and a template.

        Pulls config and source lines from the context.
        Can be reused by both TUI and frontend.
        """
        options = context.options_store.load()
        template = options.prompt.template
        output_mode = options.prompt.comment_output_mode

        source_lines: dict[str, str] = {}
        if output_mode == CommentOutputMode.SELECTED_LINES and self.comments:
            refs = await context.project.resolve_diff_settings(self.review_selection)
            for c in self.comments:
                sel = c.selection
                git_ref = refs.old if sel.diffSide == DiffSide.OLD else refs.new
                content = await context.project.read_file(sel.fileName, git_ref)
                lines = "\n".join(content.splitlines()[sel.startLine - 1 : sel.endLine])
                source_lines[c.id] = lines

        blocks = [
            self._format_comment_block(c, output_mode, source_lines)
            for c in self.comments
        ]
        comments_block = "\n\n".join(blocks)
        comments_block = (
            f"<overall_notes>{review_text}</overall_notes>\n\n{comments_block}"
            if comments_block
            else f"<overall_notes>{review_text}</overall_notes>"
        )

        ref = self.review_selection.commit.ref
        commit_ref = ref.sha if isinstance(ref, CommitRef) else ref.value
        review_scope = f"Review of {len(self.comments)} comment(s)"
        result = template
        for key, val in {
            "comments": comments_block,
            "branch": self.review_selection.branch,
            "comment_count": str(len(self.comments)),
            "commit_ref": commit_ref,
            "review_scope": review_scope,
        }.items():
            result = result.replace(f"{{{{{key}}}}}", val)
        return result


@dataclass
class SelectionState:
    """Tracks the current line selection state using a discriminated union.

    Uses ``select()`` to handle the two-phase click flow:
      1. First click sets the anchor (``Anchored``).
      2. Second click on the same file/side completes the range
         (``Complete``).
      3. A further click starts a brand-new selection.

    Use ``start_commenting()`` to transition to ``Commenting``
    before opening a comment dialog.
    """

    @dataclass
    class Idle:
        pass

    @dataclass
    class Anchored:
        """First click done, waiting for second click on same file/side."""

        anchor: Line

    @dataclass
    class Complete:
        selection: Selection

    @dataclass
    class Commenting:
        """A comment dialog is open for this selection."""

        selection: Selection

    Phase = Idle | Anchored | Complete | Commenting

    phase: Phase = field(default_factory=Idle)

    def select(self, file_name: str, diff_side: DiffSide, line_number: int) -> None:
        """Handle a line click. Manages anchor/end logic internally."""
        match self.phase:
            case SelectionState.Anchored(
                anchor=Line(
                    file_path=anchor_file,
                    diff_side=anchor_side,
                    line_number=anchor_line,
                ),
            ) if anchor_file == file_name and anchor_side == diff_side:
                start_ln = min(anchor_line, line_number)
                end_ln = max(anchor_line, line_number)
                self.phase = SelectionState.Complete(
                    Selection(
                        fileName=file_name,
                        startLine=start_ln,
                        endLine=end_ln,
                        diffSide=diff_side,
                    )
                )
            case _:
                self.phase = SelectionState.Anchored(
                    anchor=Line(file_name, diff_side, line_number),
                )

    def to_selection(self) -> Selection | None:
        """Get the normalised Selection, or None if state is idle."""
        match self.phase:
            case SelectionState.Complete(selection=sel):
                return sel
            case SelectionState.Commenting(selection=sel):
                return sel
            case SelectionState.Anchored(anchor=anchor):
                return Selection(
                    fileName=anchor.file_path,
                    startLine=anchor.line_number,
                    endLine=anchor.line_number,
                    diffSide=anchor.diff_side,
                )
            case _:
                logger.debug("to_selection called with no active selection")
                return None

    def start_commenting(self) -> Selection | None:
        """Transition to commenting state. Returns the selection or None."""
        if not isinstance(self.phase, SelectionState.Complete):
            return
        sel = self.to_selection()
        if sel is not None:
            self.phase = SelectionState.Commenting(selection=sel)
        return sel

    def clear(self) -> None:
        self.phase = SelectionState.Idle()

    @property
    def is_selecting(self) -> bool:
        """True when an anchor is set but the range is not yet complete."""
        return isinstance(self.phase, SelectionState.Anchored)
