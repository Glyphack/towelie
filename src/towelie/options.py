from __future__ import annotations

from enum import StrEnum
import json
from pathlib import Path

from pydantic import BaseModel, Field, field_validator


DEFAULT_PROMPT_TEMPLATE = (
    "<prompt>\n"
    "<instructions>\n"
    "Apply the following code review comments to the codebase. "
    "For each comment, make the exact change requested. "
    "Read the relevant file before editing it. "
    "Do not make changes beyond what each comment asks for.\n"
    "</instructions>\n\n"
    "<review_context>\n"
    "<scope>{{review_scope}}</scope>\n"
    "<total_comments>{{comment_count}}</total_comments>\n"
    "<note>If you need to understand how the code looked before or after a change, "
    "run git diff {{commit_ref}} on branch {{branch}} to get the full diff.</note>\n"
    "</review_context>\n\n"
    "<review_comments>\n"
    "<note>Each comment indicates whether it is on the new code (after the change) "
    "or the old code (before the change). "
    "Comments on old code point to something that was removed or existed before "
    "— use git diff to understand the context.</note>\n\n"
    "{{comments}}\n"
    "</review_comments>\n"
    "</prompt>"
)


class DiffStyle(StrEnum):
    INLINE = "inline"
    TWO_SIDES = "two_sides"


class CommentOutputMode(StrEnum):
    LINE_NUMBERS = "line_numbers"
    SELECTED_LINES = "selected_lines"


class DiffSide(StrEnum):
    OLD = "old"
    NEW = "new"


class DefaultCommit(StrEnum):
    ALL_CHANGES = "__all__"
    UNCOMMITTED = "__uncommitted__"
    STAGED = "__staged__"
    UNSTAGED = "__unstaged__"


class PromptOptions(BaseModel):
    template: str = DEFAULT_PROMPT_TEMPLATE
    comment_output_mode: CommentOutputMode = CommentOutputMode.LINE_NUMBERS

    @field_validator("template")
    @classmethod
    def validate_template(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("template must not be blank")
        return value


class DiffOptions(BaseModel):
    style: DiffStyle = DiffStyle.TWO_SIDES


class AppOptions(BaseModel):
    prompt: PromptOptions = Field(default_factory=PromptOptions)
    diff: DiffOptions = Field(default_factory=DiffOptions)
    default_commit: DefaultCommit = DefaultCommit.ALL_CHANGES

    @classmethod
    def defaults(cls) -> AppOptions:
        return cls()

    @classmethod
    def from_raw(cls, data: object) -> AppOptions:
        defaults = cls.defaults()
        if not isinstance(data, dict):
            return defaults

        prompt_template = defaults.prompt.template
        prompt_comment_output_mode = defaults.prompt.comment_output_mode
        prompt = data.get("prompt")
        if isinstance(prompt, dict):
            template = prompt.get("template")
            if isinstance(template, str) and template.strip():
                prompt_template = template
            comment_output_mode = prompt.get("comment_output_mode")
            if comment_output_mode in {
                CommentOutputMode.LINE_NUMBERS.value,
                CommentOutputMode.SELECTED_LINES.value,
            }:
                prompt_comment_output_mode = CommentOutputMode(comment_output_mode)

        diff_style = defaults.diff.style
        diff = data.get("diff")
        if isinstance(diff, dict):
            style = diff.get("style")
            if style in {DiffStyle.INLINE.value, DiffStyle.TWO_SIDES.value}:
                diff_style = DiffStyle(style)

        default_commit = defaults.default_commit
        raw_default_commit = data.get("default_commit")
        if raw_default_commit in {dc.value for dc in DefaultCommit}:
            default_commit = DefaultCommit(raw_default_commit)

        return cls(
            prompt=PromptOptions(
                template=prompt_template,
                comment_output_mode=prompt_comment_output_mode,
            ),
            diff=DiffOptions(style=diff_style),
            default_commit=default_commit,
        )

    def to_dict(self) -> dict:
        return self.model_dump(mode="json")


class OptionsStore:
    def __init__(self, path: Path | None = None):
        self.path = path or Path.home() / ".towelie" / "options.json"

    def load(self) -> AppOptions:
        if not self.path.exists():
            return AppOptions.defaults()

        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return AppOptions.defaults()

        return AppOptions.from_raw(raw)

    def save(self, options: AppOptions) -> AppOptions:
        self.path.parent.mkdir(parents=True, exist_ok=True)

        tmp_path = self.path.with_suffix(f"{self.path.suffix}.tmp")
        tmp_path.write_text(
            json.dumps(options.model_dump(mode="json"), indent=2) + "\n",
            encoding="utf-8",
        )
        tmp_path.replace(self.path)
        return options
