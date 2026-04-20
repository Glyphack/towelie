import asyncio
from dataclasses import dataclass
import logging
import os
import shutil
from pathlib import Path
import sys

from towelie.api_models import BranchInfo, CommitResponse, ProjectInfoResponse
from towelie.options import OptionsStore
from towelie.models import (
    Branch,
    CheckFail,
    CheckNoChecks,
    CheckPass,
    CheckResult,
    Commit,
    CommitRef,
    DiffSettings,
    DiffResult,
    ReviewSelection,
    FileDiff,
    GitRef,
    IndexRef,
    SyntheticRef,
    WorkingTree,
)

dev_mode = os.environ.get("TOWELIE_DEV") == "1"
logger = logging.getLogger(__name__)


def _log_cmd(cmd: list):
    if not dev_mode:
        return
    print(f"  $ {' '.join(str(c) for c in cmd)}", file=sys.stderr)


async def _run(cmd: list, cwd: Path | None = None) -> tuple[bytes, bytes, int]:
    """Run a command, log it, and return (stdout, stderr, returncode)."""
    _log_cmd(cmd)
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=cwd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    assert proc.returncode is not None
    return stdout, stderr, proc.returncode


@dataclass
class CheckCommand:
    command: str
    shell: bool = True


def _commit_to_response(c: Commit) -> CommitResponse:
    if isinstance(c.ref, CommitRef):
        return CommitResponse(ref=c.ref.sha, label=c.label)
    return CommitResponse(ref=c.ref.value, label=c.label)


@dataclass
class Project:
    git_root: Path

    async def get_info(self) -> ProjectInfoResponse:
        base, branch_names, current = await asyncio.gather(
            self.get_base_branch(),
            self.get_branches(),
            self.get_checked_out_branch(),
        )
        all_commits = await asyncio.gather(
            *(self.get_commits(name, base) for name in branch_names)
        )
        branches = [
            BranchInfo(
                name=n,
                commits=[_commit_to_response(c) for c in commits],
            )
            for n, commits in zip(branch_names, all_commits, strict=True)
        ]
        return ProjectInfoResponse(
            project_name=self.git_root.name,
            origin=await self.get_origin(),
            current_branch=current,
            base_branch=base,
            branches=branches,
        )

    async def get_base_branch(self) -> Branch:
        for name in ("main", "master"):
            _, _, rc = await _run(["git", "rev-parse", "--verify", name], self.git_root)
            if rc == 0:
                return Branch(name)
        return Branch("main")

    async def get_checked_out_branch(self) -> Branch:
        stdout, _, _ = await _run(["git", "branch", "--show-current"], self.git_root)
        return Branch(stdout.decode().strip())

    async def get_origin(self) -> str:
        stdout, _, _ = await _run(
            ["git", "config", "--get", "remote.origin.url"], self.git_root
        )
        origin = stdout.decode().strip()
        return origin or str(self.git_root.resolve())

    async def get_diff(self, settings: DiffSettings) -> DiffResult:
        """Unified diff: returns raw patch text and the list of changed files."""
        match (settings.old, settings.new):
            case (IndexRef(), WorkingTree()):
                ref_args: list[str] = []
            case (CommitRef(sha=sha), IndexRef()):
                ref_args = ["--cached", sha]
            case (CommitRef(sha=sha), WorkingTree()):
                ref_args = [sha]
            case (CommitRef(sha=old_sha), CommitRef(sha=new_sha)):
                ref_args = [old_sha, new_sha]
            case _:
                ref_args = []
        (diff_out, _, _), (files_out, _, _) = await asyncio.gather(
            _run(["git", "diff", *ref_args, "--unified=10"], self.git_root),
            _run(["git", "diff", *ref_args, "--name-only"], self.git_root),
        )
        files = sorted({f for f in files_out.decode().strip().split("\n") if f})
        return DiffResult(raw_diff=diff_out.decode(), files=files)

    async def get_branches(self) -> list[Branch]:
        stdout, _, _ = await _run(
            ["git", "branch", "--format=%(refname:short)"], self.git_root
        )
        return [Branch(b) for b in stdout.decode().strip().split("\n") if b]

    async def get_commits(
        self,
        branch: Branch,
        base: Branch,
    ) -> list[Commit]:
        is_current = branch == await self.get_checked_out_branch()
        commits: list[Commit] = [
            Commit(ref=SyntheticRef.ALL_CHANGES, label="All changes")
        ]
        if is_current:
            commits.append(Commit(ref=SyntheticRef.UNCOMMITTED, label="Uncommitted"))
            commits.append(Commit(ref=SyntheticRef.STAGED, label="Staged changes"))
            commits.append(Commit(ref=SyntheticRef.UNSTAGED, label="Unstaged changes"))
        stdout, _, _ = await _run(
            ["git", "log", f"{base}..{branch}", "--pretty=format:%H%x00%s"],
            self.git_root,
        )
        for line in stdout.decode().split("\n"):
            if not line:
                continue
            full_hash, subject = line.split("\x00", 1)
            short_hash = full_hash[:7]
            commits.append(
                Commit(ref=CommitRef(sha=full_hash), label=f"{short_hash} {subject}")
            )
        return commits

    async def read_file(self, file_path: str, ref: GitRef) -> str:
        if isinstance(ref, WorkingTree):
            try:
                return (self.git_root / file_path).read_text()
            except FileNotFoundError:
                # File was removed in the working tree, so it won't exist on disk
                return ""
        show_arg = (
            f":0:{file_path}" if isinstance(ref, IndexRef) else f"{ref.sha}:{file_path}"
        )
        stdout, _, rc = await _run(["git", "show", show_arg], self.git_root)
        if rc != 0:
            return ""
        return stdout.decode()

    async def resolve_diff_settings(self, project_ref: ReviewSelection) -> DiffSettings:
        ref = project_ref.ref
        current_branch = await self.get_checked_out_branch()
        effective_branch = project_ref.branch or current_branch
        effective_base = project_ref.base or await self.get_base_branch()
        is_current = effective_branch == current_branch

        match ref:
            case SyntheticRef.UNCOMMITTED:
                return DiffSettings(old=CommitRef("HEAD"), new=WorkingTree())
            case SyntheticRef.STAGED:
                return DiffSettings(old=CommitRef("HEAD"), new=IndexRef())
            case SyntheticRef.UNSTAGED:
                return DiffSettings(old=IndexRef(), new=WorkingTree())
            case CommitRef(sha=sha):
                return DiffSettings(old=CommitRef(f"{sha}^"), new=CommitRef(sha))
            case SyntheticRef.ALL_CHANGES:
                merge_base = await self._merge_base(effective_base, effective_branch)
                if is_current:
                    return DiffSettings(old=CommitRef(merge_base), new=WorkingTree())
                return DiffSettings(
                    old=CommitRef(merge_base),
                    new=CommitRef(effective_branch),
                )

    # TODO: Inline
    async def _merge_base(self, base: Branch, branch: Branch) -> str:
        stdout, _, rc = await _run(["git", "merge-base", base, branch], self.git_root)
        if rc == 0:
            return stdout.decode().strip()
        return base

    async def _fetch_file_diff(
        self, file_path: str, refs: DiffSettings
    ) -> FileDiff | None:
        if (self.git_root / file_path).is_dir():
            return None
        old, new = await asyncio.gather(
            self.read_file(file_path, refs.old),
            self.read_file(file_path, refs.new),
        )
        if old != new:
            return FileDiff(file_path=file_path, old_content=old, new_content=new)
        return None

    async def compute_diff_result(self, project_ref: ReviewSelection) -> DiffResult:
        """Compute the unified DiffResult for a ReviewSelection."""
        refs = await self.resolve_diff_settings(project_ref)
        raw = await self.get_diff(refs)

        results = await asyncio.gather(
            *(self._fetch_file_diff(f, refs) for f in raw.files)
        )
        file_diffs = sorted(
            [d for d in results if d is not None], key=lambda d: d.file_path
        )
        return DiffResult(
            raw_diff=raw.raw_diff,
            files=raw.files,
            file_diffs=file_diffs,
        )

    def get_check_command(self) -> CheckCommand | None:
        if not (self.git_root / ".pre-commit-config.yaml").exists():
            return None
        if shutil.which("prek"):
            return CheckCommand(command="prek -a")
        if shutil.which("pre-commit"):
            return CheckCommand(command="pre-commit run --all-files")
        return None

    async def run_checks(self) -> CheckResult:
        cmd = self.get_check_command()
        if not cmd:
            return CheckNoChecks()
        _log_cmd([cmd.command])
        if cmd.shell:
            proc = await asyncio.create_subprocess_shell(
                cmd.command,
                cwd=self.git_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        else:
            proc = await asyncio.create_subprocess_exec(
                *cmd.command,
                cwd=self.git_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        stdout, stderr = await proc.communicate()
        output = stdout.decode()
        error = stderr.decode()
        if proc.returncode == 0:
            return CheckPass(output=output)
        return CheckFail(output=output, error=error)


async def get_git_root() -> Path:
    if given_path := os.environ.get("TOWELIE_GIT_PATH"):
        return Path(given_path)
    stdout, _, return_code = await _run(["git", "rev-parse", "--show-toplevel"])
    if return_code != 0:
        print("Error: not a git repository", file=sys.stderr)
        sys.exit(1)
    return Path(stdout.decode().strip())


@dataclass
class TowelieContext:
    project: Project
    options_store: OptionsStore

    @classmethod
    async def new(cls):
        return cls(project=Project(await get_git_root()), options_store=OptionsStore())

    def dev_mode(self) -> bool:
        return os.environ.get("TOWELIE_DEV") == "1"
