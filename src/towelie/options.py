from __future__ import annotations

from enum import StrEnum
import json
from pathlib import Path

from pydantic import BaseModel, Field, field_validator


DEFAULT_PROMPT_TEMPLATE = (
    "You are reviewing a code change.\n\n"
    "{{review_scope}}\n"
    "Total comments: {{comment_count}}\n\n"
    "{{comments}}"
)


class DiffStyle(StrEnum):
    INLINE = "inline"
    TWO_SIDES = "two_sides"


class CommentOutputMode(StrEnum):
    LINE_NUMBERS = "line_numbers"
    SELECTED_LINES = "selected_lines"


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

    @classmethod
    def defaults(cls) -> "AppOptions":
        return cls()

    @classmethod
    def from_raw(cls, data: object) -> "AppOptions":
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

        return cls(
            prompt=PromptOptions(
                template=prompt_template,
                comment_output_mode=prompt_comment_output_mode,
            ),
            diff=DiffOptions(style=diff_style),
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
