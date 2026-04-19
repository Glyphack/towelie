from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from towelie.options import CommentOutputMode, DefaultCommit, DiffSide, DiffStyle

logger = logging.getLogger(__name__)

ALL_CHANGES = "__all__"
UNCOMMITTED = "__uncommitted__"
STAGED = "__staged__"
UNSTAGED = "__unstaged__"


class CheckStatus(StrEnum):
    PASS = "pass"
    FAIL = "fail"
    NO_CHECKS = "no_checks"


class Diff(BaseModel):
    diff: str
    files: list[str]


class DiffResponse(BaseModel):
    diff: Diff


class PromptOptionsPayload(BaseModel):
    template: str = Field(min_length=1)
    comment_output_mode: CommentOutputMode = CommentOutputMode.LINE_NUMBERS

    @field_validator("template")
    @classmethod
    def validate_template(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("template must not be blank")
        return value


class DiffOptionsPayload(BaseModel):
    style: DiffStyle = DiffStyle.TWO_SIDES


class AppOptionsPayload(BaseModel):
    prompt: PromptOptionsPayload
    diff: DiffOptionsPayload
    default_commit: DefaultCommit = DefaultCommit.ALL_CHANGES


class ParsedCheck(BaseModel):
    name: str
    passed: bool


class ChecksResponse(BaseModel):
    status: CheckStatus
    checks: list[ParsedCheck] = Field(default_factory=list)
    error: str = ""


class CommitInfo(BaseModel):
    hash: str
    label: str


class Branch(BaseModel):
    name: str
    commits: list[CommitInfo]


class ProjectInfoResponse(BaseModel):
    project_name: str
    origin: str
    current_branch: str
    base_branch: str
    branches: list[Branch]


# TODO: Not a good name
class ProjectRef(BaseModel):
    branch: str = ""
    base: str = ""
    commit: str = ""


async def parse_project_ref(
    branch: str = "", base: str = "", commit: str = ""
) -> ProjectRef:
    return ProjectRef(branch=branch, base=base, commit=commit)


@dataclass
class WorktreeRef:
    pass


@dataclass
class IndexRef:
    pass


@dataclass
class CommitRef:
    sha: str


GitRef = WorktreeRef | IndexRef | CommitRef


@dataclass
class FileDiff:
    file_path: str
    old_content: str
    new_content: str


@dataclass
class Selection:
    file_name: str
    start_line: int
    end_line: int
    diff_side: DiffSide

    def format_loc(self) -> str:
        side = "new" if self.diff_side == DiffSide.NEW else "old"
        if self.start_line == self.end_line:
            return f"{self.file_name}:{self.start_line} ({side})"
        return f"{self.file_name}:{self.start_line}-{self.end_line} ({side})"


@dataclass
class CommentRecord:
    selection: Selection
    text: str
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    created_at: float = field(default_factory=time.time)


@dataclass
class Review:
    comments: list[CommentRecord]
    notes: str = ""
    branch: str = ""
    base_branch: str = ""
    commit_ref: str = ""
    commit_sha: str = ""


@dataclass
class SelectionIdle:
    pass


@dataclass
class SelectionAnchored:
    """First click done, waiting for second click on same file/side."""

    file_name: str
    diff_side: DiffSide
    line_number: int


@dataclass
class SelectionComplete:
    selection: Selection


@dataclass
class SelectionCommenting:
    """A comment dialog is open for this selection."""

    selection: Selection


SelectionPhase = (
    SelectionIdle | SelectionAnchored | SelectionComplete | SelectionCommenting
)


@dataclass
class SelectionState:
    """Tracks the current line selection state using a discriminated union.

    Uses ``select()`` to handle the two-phase click flow:
      1. First click sets the anchor (``SelectionAnchored``).
      2. Second click on the same file/side completes the range
         (``SelectionComplete``).
      3. A further click starts a brand-new selection.

    Use ``start_commenting()`` to transition to ``SelectionCommenting``
    before opening a comment dialog.
    """

    phase: SelectionPhase = field(default_factory=SelectionIdle)

    def select(self, file_name: str, diff_side: DiffSide, line_number: int) -> None:
        """Handle a line click. Manages anchor/end logic internally."""
        match self.phase:
            case SelectionAnchored(
                file_name=anchor_file,
                diff_side=anchor_side,
                line_number=anchor_line,
            ) if anchor_file == file_name and anchor_side == diff_side:
                start = min(anchor_line, line_number)
                end = max(anchor_line, line_number)
                self.phase = SelectionComplete(
                    Selection(
                        file_name=file_name,
                        start_line=start,
                        end_line=end,
                        diff_side=diff_side,
                    )
                )
            case _:
                self.phase = SelectionAnchored(
                    file_name=file_name,
                    diff_side=diff_side,
                    line_number=line_number,
                )

    def to_selection(self) -> Selection | None:
        """Get the normalised Selection, or None if state is idle."""
        match self.phase:
            case SelectionComplete(selection=sel):
                return sel
            case SelectionCommenting(selection=sel):
                return sel
            case SelectionAnchored(file_name=fn, diff_side=side, line_number=ln):
                return Selection(
                    file_name=fn, start_line=ln, end_line=ln, diff_side=side
                )
            case _:
                logger.debug("to_selection called with no active selection")
                return None

    def start_commenting(self) -> Selection | None:
        """Transition to commenting state. Returns the selection or None."""
        sel = self.to_selection()
        if sel is not None:
            self.phase = SelectionCommenting(selection=sel)
        return sel

    def clear(self) -> None:
        self.phase = SelectionIdle()

    @property
    def is_selecting(self) -> bool:
        """True when an anchor is set but the range is not yet complete."""
        return isinstance(self.phase, SelectionAnchored)


def format_comment_block(comment: CommentRecord, mode: CommentOutputMode) -> str:
    """Format a single comment as XML, matching the frontend output."""
    sel = comment.selection
    side_label = (
        "old code (before the change)"
        if sel.diff_side == DiffSide.OLD
        else "new code (after the change)"
    )
    line_label = (
        str(sel.start_line)
        if sel.start_line == sel.end_line
        else f"{sel.start_line}-{sel.end_line}"
    )
    loc = (
        f'  <location file="{sel.file_name}"'
        f' lines="{line_label}" side="{side_label}" />'
    )
    if mode == CommentOutputMode.SELECTED_LINES:
        # In TUI mode we don't have easy access to source lines at this point,
        # so we fall back to the line_numbers format (same as frontend fallback).
        pass
    return f"<comment>\n{loc}\n  <text>{comment.text}</text>\n</comment>"


def build_review_prompt(
    review: Review, template: str, output_mode: CommentOutputMode
) -> str:
    """Build the full review prompt from a Review object and template.

    Can be reused by both TUI and frontend.
    """
    blocks = [format_comment_block(c, output_mode) for c in review.comments]
    comments_block = "\n\n".join(blocks)
    if review.notes:
        comments_block = (
            f"<overall_notes>{review.notes}</overall_notes>\n\n{comments_block}"
            if comments_block
            else f"<overall_notes>{review.notes}</overall_notes>"
        )

    review_scope = f"Review of {len(review.comments)} comment(s)"
    result = template
    for key, val in {
        "comments": comments_block,
        "branch": review.branch,
        "comment_count": str(len(review.comments)),
        "commit_ref": review.commit_ref,
        "commit_sha": review.commit_sha,
        "review_scope": review_scope,
    }.items():
        result = result.replace(f"{{{{{key}}}}}", val)
    return result


def resolve_git_ref(project_ref: ProjectRef, side: DiffSide) -> GitRef:
    if side == DiffSide.OLD:
        return CommitRef(sha=project_ref.base or "HEAD")
    if project_ref.commit == STAGED:
        return IndexRef()
    if project_ref.commit in (UNSTAGED, UNCOMMITTED):
        return WorktreeRef()
    if project_ref.commit and project_ref.commit != ALL_CHANGES:
        return CommitRef(sha=project_ref.commit)
    return CommitRef(sha=project_ref.branch or "HEAD")
