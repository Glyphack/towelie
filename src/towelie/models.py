from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from towelie.options import CommentOutputMode, DefaultCommit, DiffSide, DiffStyle

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
    """Read from working tree (unstaged/uncommitted)"""


@dataclass
class IndexRef:
    """Read from git staging index"""


@dataclass
class CommitRef:
    sha: str


GitRef = WorktreeRef | IndexRef | CommitRef


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
