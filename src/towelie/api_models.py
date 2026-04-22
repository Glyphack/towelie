from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from towelie.models import Branch, Comment
from towelie.options import CommentOutputMode, DiffStyle


class CheckStatus(StrEnum):
    PASS = "pass"
    FAIL = "fail"
    NO_CHECKS = "no_checks"


class CommitResponse(BaseModel):
    ref: str
    label: str


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
    default_commit: str = "all_changes"


class ParsedCheck(BaseModel):
    name: str
    passed: bool


class ChecksResponse(BaseModel):
    status: CheckStatus
    checks: list[ParsedCheck] = Field(default_factory=list)
    error: str = ""


class BranchInfo(BaseModel):
    name: Branch
    commits: list[CommitResponse]


class ProjectInfoResponse(BaseModel):
    project_name: str
    # TODO: Get rid of the origin field, probably not needed.
    origin: str
    current_branch: Branch
    base_branch: Branch
    branches: list[BranchInfo]


class DiffResponse(BaseModel):
    diff: str
    files: list[str]


class AddCommentRequest(BaseModel):
    comment: Comment


class UpdateCommentRequest(BaseModel):
    text: str


class CommentsListResponse(BaseModel):
    comments: list[Comment]


class SubmitReviewRequest(BaseModel):
    overall_notes: str = ""


class SubmitReviewResponse(BaseModel):
    review_text: str
