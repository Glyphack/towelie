from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from towelie.options import CommentOutputMode, DiffStyle


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
