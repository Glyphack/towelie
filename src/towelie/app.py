import asyncio
from contextlib import asynccontextmanager
from dataclasses import dataclass
import os
from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from towelie.models import (
    AppOptionsPayload,
    Branch,
    ChecksResponse,
    CheckStatus,
    CommitInfo,
    Diff,
    DiffResponse,
    ParsedCheck,
    ProjectInfoResponse,
)
from towelie.options import (
    AppOptions,
    DiffOptions,
    OptionsStore,
    PromptOptions,
)

dev_mode = os.environ.get("TOWELIE_DEV") == "1"


def _log_cmd(cmd):
    if not dev_mode:
        return
    if isinstance(cmd, (list, tuple)):
        print(f"  $ {' '.join(str(c) for c in cmd)}", file=sys.stderr)
    else:
        print(f"  $ {cmd}", file=sys.stderr)


@dataclass
class CheckCommand:
    command: str
    shell: bool = True


ALL_CHANGES = "__all__"
UNCOMMITTED = "__uncommitted__"
STAGED = "__staged__"
UNSTAGED = "__unstaged__"


@dataclass
class Project:
    git_root: Path

    async def get_base_branch(self) -> str:
        for branch in ("main", "master"):
            _log_cmd(["git", "rev-parse", "--verify", branch])
            proc = await asyncio.create_subprocess_exec(
                "git",
                "rev-parse",
                "--verify",
                branch,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await proc.communicate()
            if proc.returncode == 0:
                return branch
        return "main"

    def _has_precommit_config(self) -> bool:
        return (self.git_root / ".pre-commit-config.yaml").exists()

    @property
    def check_command(self) -> CheckCommand | None:
        if self._has_precommit_config():
            return CheckCommand(command="prek -a")
        return None

    async def get_current_branch(self) -> str:
        _log_cmd(["git", "branch", "--show-current"])
        proc = await asyncio.create_subprocess_exec(
            "git",
            "branch",
            "--show-current",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        return stdout.decode().strip()

    async def get_origin(self) -> str:
        _log_cmd(["git", "config", "--get", "remote.origin.url"])
        proc = await asyncio.create_subprocess_exec(
            "git",
            "config",
            "--get",
            "remote.origin.url",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        origin = stdout.decode().strip()
        return origin or str(self.git_root.resolve())

    async def get_uncommitted_diff(self) -> Diff:
        _log_cmd(["git", "diff", "HEAD", "--unified=10"])
        diff_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "HEAD",
            "--unified=10",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _log_cmd(["git", "diff", "--cached", "--name-only"])
        staged_files = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "--cached",
            "--name-only",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _log_cmd(["git", "diff", "--name-only"])
        unstaged_files = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "--name-only",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        diff_out, _ = await diff_proc.communicate()
        staged_files_out, _ = await staged_files.communicate()
        unstaged_files_out, _ = await unstaged_files.communicate()
        files = set()
        for f in staged_files_out.decode().strip().split("\n"):
            if f:
                files.add(f)
        for f in unstaged_files_out.decode().strip().split("\n"):
            if f:
                files.add(f)
        return Diff(diff=diff_out.decode(), files=sorted(files))

    async def get_staged_diff(self) -> Diff:
        _log_cmd(["git", "diff", "--cached", "--unified=10"])
        diff_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "--cached",
            "--unified=10",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _log_cmd(["git", "diff", "--cached", "--name-only"])
        files_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "--cached",
            "--name-only",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        diff_out, _ = await diff_proc.communicate()
        files_out, _ = await files_proc.communicate()
        files = [f for f in files_out.decode().strip().split("\n") if f]
        return Diff(diff=diff_out.decode(), files=files)

    async def get_unstaged_diff(self) -> Diff:
        _log_cmd(["git", "diff", "--unified=10"])
        diff_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "--unified=10",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _log_cmd(["git", "diff", "--name-only"])
        files_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            "--name-only",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        diff_out, _ = await diff_proc.communicate()
        files_out, _ = await files_proc.communicate()
        files = [f for f in files_out.decode().strip().split("\n") if f]
        return Diff(diff=diff_out.decode(), files=files)

    async def get_commit_diff(self, commit: str) -> Diff:
        _log_cmd(["git", "diff", f"{commit}^", commit, "--unified=10"])
        diff_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            f"{commit}^",
            commit,
            "--unified=10",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _log_cmd(["git", "diff", f"{commit}^", commit, "--name-only"])
        files_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            f"{commit}^",
            commit,
            "--name-only",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        diff_stdout, _ = await diff_proc.communicate()
        files_stdout, _ = await files_proc.communicate()
        files = [f for f in files_stdout.decode().strip().split("\n") if f]
        return Diff(diff=diff_stdout.decode(), files=files)

    async def get_branch_diff(self, branch: str, base: str) -> Diff:
        _log_cmd(["git", "merge-base", base, branch])
        proc = await asyncio.create_subprocess_exec(
            "git",
            "merge-base",
            base,
            branch,
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        merge_base_ref = stdout.decode().strip()

        cmd = ["git", "diff", merge_base_ref, "--unified=10"]
        if branch != await self.get_current_branch():
            cmd.insert(3, branch)

        _log_cmd(cmd)
        diff_proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        diff_stdout, _ = await diff_proc.communicate()

        is_current = branch == await self.get_current_branch()
        _log_cmd(["git", "diff", f"{base}...{branch}", "--name-only"])
        files_proc = await asyncio.create_subprocess_exec(
            "git",
            "diff",
            f"{base}...{branch}",
            "--name-only",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        files_stdout, _ = await files_proc.communicate()
        files = set()
        for f in files_stdout.decode().strip().split("\n"):
            if f:
                files.add(f)
        if is_current:
            _log_cmd(["git", "diff", "HEAD", "--name-only"])
            head_proc = await asyncio.create_subprocess_exec(
                "git",
                "diff",
                "HEAD",
                "--name-only",
                cwd=self.git_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            head_stdout, _ = await head_proc.communicate()
            for f in head_stdout.decode().strip().split("\n"):
                if f:
                    files.add(f)
        return Diff(diff=diff_stdout.decode(), files=sorted(files))

    async def get_branches(self) -> list[str]:
        _log_cmd(["git", "branch", "--format=%(refname:short)"])
        proc = await asyncio.create_subprocess_exec(
            "git",
            "branch",
            "--format=%(refname:short)",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        return [b for b in stdout.decode().strip().split("\n") if b]

    async def get_commits(
        self,
        branch: str,
        base: str,
    ) -> list[CommitInfo]:
        is_current = branch == await self.get_current_branch()
        commits: list[CommitInfo] = [CommitInfo(hash=ALL_CHANGES, label="All changes")]
        if is_current:
            commits.append(CommitInfo(hash=UNCOMMITTED, label="Uncommited"))
            commits.append(CommitInfo(hash=STAGED, label="Staged changes"))
            commits.append(CommitInfo(hash=UNSTAGED, label="Unstaged changes"))
        _log_cmd(["git", "log", f"{base}..{branch}", "--pretty=format:%H%x00%s"])
        proc = await asyncio.create_subprocess_exec(
            "git",
            "log",
            f"{base}..{branch}",
            "--pretty=format:%H%x00%s",
            cwd=self.git_root,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        for line in stdout.decode().split("\n"):
            if not line:
                continue
            full_hash, subject = line.split("\x00", 1)
            short_hash = full_hash[:7]
            commits.append(CommitInfo(hash=full_hash, label=f"{short_hash} {subject}"))
        return commits

    async def run_checks(self) -> "CheckResult":
        if not self.check_command:
            msg = (
                "No .pre-commit-config.yaml found in repository.\n"
                "Set up pre-commit hooks to enable checks.\n"
                "See: https://github.com/j178/prek/"
            )
            return CheckResult(status=CheckStatus.NO_CHECKS, output=msg)
        _log_cmd(self.check_command.command)
        if self.check_command.shell:
            proc = await asyncio.create_subprocess_shell(
                self.check_command.command,
                cwd=self.git_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        else:
            proc = await asyncio.create_subprocess_exec(
                *self.check_command.command,
                cwd=self.git_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        stdout, stderr = await proc.communicate()
        output = stdout.decode()
        error = stderr.decode()
        if proc.returncode == 0:
            return CheckResult(status=CheckStatus.PASS, output=output)
        return CheckResult(status=CheckStatus.FAIL, output=output, error=error)


@dataclass
class CheckResult:
    status: CheckStatus
    output: str = ""
    error: str = ""


@dataclass
class AppContext:
    project: Project
    options_store: OptionsStore


async def get_git_root() -> Path:
    _log_cmd(["git", "rev-parse", "--show-toplevel"])
    proc = await asyncio.create_subprocess_exec(
        "git",
        "rev-parse",
        "--show-toplevel",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    if proc.returncode != 0:
        print("Error: not a git repository", file=sys.stderr)
        sys.exit(1)
    return Path(stdout.decode().strip())


def _asset_version(file_name: str) -> int:
    asset_path = Path(__file__).parent / "static" / file_name
    try:
        return asset_path.stat().st_mtime_ns
    except FileNotFoundError:
        return 0


APP_CONTEXT: AppContext


@asynccontextmanager
async def lifespan(_: FastAPI):
    global APP_CONTEXT
    project = Project(git_root=await get_git_root())
    APP_CONTEXT = AppContext(
        project=project,
        options_store=OptionsStore(),
    )
    yield


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")
app.mount(
    "/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static"
)


@app.middleware("http")
async def dev_no_store_cache(request: Request, call_next):
    response = await call_next(request)
    if not dev_mode:
        return response
    is_static = request.url.path.startswith("/static/")
    content_type = response.headers.get("content-type", "")
    is_html = content_type.startswith("text/html")
    if is_static or is_html:
        response.headers["Cache-Control"] = "no-store"
    return response


def parse_check_output(raw: CheckResult) -> list[ParsedCheck]:
    if raw.status == CheckStatus.NO_CHECKS:
        return []

    results: list[ParsedCheck] = []
    for line in raw.output.splitlines():
        line = line.strip()
        if not line or "." not in line:
            continue

        name = line.split(".")[0].strip()
        status_part = line.split(".")[-1].strip()
        if name:
            results.append(ParsedCheck(name=name, passed="pass" in status_part.lower()))

    return results


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
    return templates.TemplateResponse("index.html", build_page_context(request))


@app.get("/options")
async def options_page(request: Request):
    return templates.TemplateResponse("options.html", build_page_context(request))


@app.get("/api/info", response_model=ProjectInfoResponse)
async def get_info():
    base = str(await APP_CONTEXT.project.get_base_branch())
    branches = []
    for branch in await APP_CONTEXT.project.get_branches():
        commits = await APP_CONTEXT.project.get_commits(branch, base)
        branches.append(Branch(name=branch, commits=commits))

    return ProjectInfoResponse(
        project_name=APP_CONTEXT.project.git_root.name,
        origin=await APP_CONTEXT.project.get_origin(),
        current_branch=await APP_CONTEXT.project.get_current_branch(),
        base_branch=base,
        branches=branches,
    )


@app.get("/api/options")
async def get_options() -> AppOptions:
    return APP_CONTEXT.options_store.load()


@app.put("/api/options")
async def update_options(payload: AppOptionsPayload) -> AppOptions:
    options = AppOptions(
        prompt=PromptOptions(
            template=payload.prompt.template,
            comment_output_mode=payload.prompt.comment_output_mode,
        ),
        diff=DiffOptions(style=payload.diff.style),
    )
    return APP_CONTEXT.options_store.save(options)


@app.get("/api/diff")
async def diff(
    branch: str | None = None,
    base: str | None = None,
    commit: str | None = None,
) -> DiffResponse:
    current_branch = await APP_CONTEXT.project.get_current_branch()
    effective_branch = branch or current_branch
    effective_base = base or await APP_CONTEXT.project.get_base_branch()
    is_current_branch = effective_branch == current_branch

    if commit in (UNCOMMITTED, STAGED, UNSTAGED) and not is_current_branch:
        raise HTTPException(
            status_code=400,
            detail="Staged/unstaged/uncommitted filters are only available for the current branch",
        )
    elif commit == UNCOMMITTED:
        result = await APP_CONTEXT.project.get_uncommitted_diff()
    elif commit == STAGED:
        result = await APP_CONTEXT.project.get_staged_diff()
    elif commit == UNSTAGED:
        result = await APP_CONTEXT.project.get_unstaged_diff()
    elif not commit or commit == ALL_CHANGES:
        result = await APP_CONTEXT.project.get_branch_diff(
            effective_branch, effective_base
        )
    else:
        result = await APP_CONTEXT.project.get_commit_diff(commit)

    response = DiffResponse(diff=result)
    return response


@app.get("/api/checks")
async def checks() -> ChecksResponse:
    results = await APP_CONTEXT.project.run_checks()
    response = ChecksResponse(
        status=results.status,
        checks=parse_check_output(results),
        error=results.error,
    )
    return response
