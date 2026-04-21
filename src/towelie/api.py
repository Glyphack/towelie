from contextlib import asynccontextmanager
import logging
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query, Request, Response
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from towelie.api_models import (
    AddCommentRequest,
    AppOptionsPayload,
    CheckStatus,
    ChecksResponse,
    CommentsListResponse,
    DiffResponse,
    ParsedCheck,
    ProjectInfoResponse,
    SubmitReviewRequest,
    SubmitReviewResponse,
    UpdateCommentRequest,
)
from towelie.models import (
    Branch,
    CheckFail,
    CheckNoChecks,
    CheckPass,
    Comment,
    Commit,
    Review,
    ReviewSelection,
    SyntheticRef,
    parse_ref,
)
from towelie.options import (
    AppOptions,
    DiffOptions,
    PromptOptions,
)
from towelie.project import TowelieContext

logger = logging.getLogger(__name__)


APP_CONTEXT: TowelieContext


@asynccontextmanager
async def lifespan(_: FastAPI):
    global APP_CONTEXT
    APP_CONTEXT = await TowelieContext.new()
    yield


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")
app.mount(
    "/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static"
)


@app.middleware("http")
async def dev_no_store_cache(request: Request, call_next):
    response = await call_next(request)
    if not APP_CONTEXT.dev_mode():
        return response
    is_static = request.url.path.startswith("/static/")
    content_type = response.headers.get("content-type", "")
    is_html = content_type.startswith("text/html")
    if is_static or is_html:
        response.headers["Cache-Control"] = "no-store"
    return response


def parse_check_output(output: str) -> list[ParsedCheck]:
    results: list[ParsedCheck] = []
    for raw_line in output.splitlines():
        line = raw_line.strip()
        if not line or "." not in line:
            continue

        name = line.split(".")[0].strip()
        status_part = line.split(".")[-1].strip()
        if name:
            results.append(ParsedCheck(name=name, passed="pass" in status_part.lower()))

    return results


def _asset_version(file_name: str) -> int:
    asset_path = Path(__file__).parent / "static" / file_name
    try:
        return asset_path.stat().st_mtime_ns
    except FileNotFoundError:
        return 0


def build_page_context(request: Request) -> dict:
    view = {
        "project_name": APP_CONTEXT.project.git_root.name,
        "js_version": str(_asset_version("main.js")),
        "css_version": str(_asset_version("output.css")),
    }

    return {
        "request": request,
        "view": view,
    }


@app.get("/")
async def index_page(request: Request):
    return templates.TemplateResponse(
        request, "index.html", build_page_context(request)
    )


@app.get("/options")
async def options_page(request: Request):
    return templates.TemplateResponse(
        request, "options.html", build_page_context(request)
    )


@app.get("/api/options")
async def get_options(response: Response) -> AppOptions:
    response.headers["Cache-Control"] = "no-store"
    return APP_CONTEXT.options_store.load()


@app.put("/api/options")
async def update_options(payload: AppOptionsPayload) -> AppOptions:
    options = AppOptions(
        prompt=PromptOptions(
            template=payload.prompt.template,
            comment_output_mode=payload.prompt.comment_output_mode,
        ),
        diff=DiffOptions(style=payload.diff.style),
        default_commit=payload.default_commit,
    )
    return APP_CONTEXT.options_store.save(options)


@app.delete("/api/options")
async def reset_options() -> AppOptions:
    return APP_CONTEXT.options_store.save(AppOptions.defaults())


@app.get("/api/info", response_model=ProjectInfoResponse)
async def get_info():
    return await APP_CONTEXT.project.get_info()


class RefQuery(BaseModel):
    branch: str = ""
    base: str = ""
    commit: str = ""

    def to_selection(self) -> ReviewSelection:
        ref = parse_ref(self.commit) if self.commit else SyntheticRef.ALL_CHANGES
        return ReviewSelection(
            branch=Branch(self.branch),
            base=Branch(self.base),
            commit=Commit.from_ref(ref),
        )


@app.get("/api/diff")
async def select_diff(
    params: Annotated[RefQuery, Query()],
) -> DiffResponse:
    selection = params.to_selection()
    if APP_CONTEXT.review.review_selection != selection:
        APP_CONTEXT.review = Review(review_selection=selection)

    result = await APP_CONTEXT.project.compute_diff_result(selection)
    return DiffResponse(diff=result.raw_diff, files=result.files)


@app.post("/api/comments")
async def add_comment(req: AddCommentRequest):
    APP_CONTEXT.review.add_comment(req.comment)


@app.put("/api/comments/{comment_id}")
async def update_comment(comment_id: str, req: UpdateCommentRequest) -> Comment:
    for c in APP_CONTEXT.review.comments:
        if c.id == comment_id:
            c.text = req.text
            return c
    raise HTTPException(status_code=404, detail="Comment not found")


@app.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: str) -> dict:
    for i, c in enumerate(APP_CONTEXT.review.comments):
        if c.id == comment_id:
            APP_CONTEXT.review.comments.pop(i)
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Comment not found")


@app.get("/api/comments")
async def list_comments() -> CommentsListResponse:
    return CommentsListResponse(comments=APP_CONTEXT.review.comments)


@app.post("/api/review/submit")
async def submit_review(
    req: SubmitReviewRequest,
) -> SubmitReviewResponse:
    review = APP_CONTEXT.review
    if len(review.comments) == 0 and not req.overall_notes:
        raise HTTPException(status_code=400, detail="No comments or notes to submit")

    review_text = await review.build_prompt(APP_CONTEXT, req.overall_notes)
    APP_CONTEXT.review = Review(review_selection=review.review_selection)
    return SubmitReviewResponse(review_text=review_text)


@app.get("/api/checks")
async def checks() -> ChecksResponse:
    result = await APP_CONTEXT.project.run_checks()
    match result:
        case CheckNoChecks():
            return ChecksResponse(status=CheckStatus.NO_CHECKS)
        case CheckPass(output=_):
            return ChecksResponse(
                status=CheckStatus.PASS,
                checks=parse_check_output(result.output),
            )
        case CheckFail(error=error):
            return ChecksResponse(
                status=CheckStatus.FAIL,
                checks=parse_check_output(result.output),
                error=error,
            )
        case _:
            raise AssertionError
