import { type AppOptions, type DiffSide } from "./options";

export interface ProjectRef {
  branch: string;
  base: string;
  commit: string;
}

export interface CommitInfo {
  ref: string;
  label: string;
}

export interface Branch {
  name: string;
  commits: CommitInfo[];
}

export interface Diff {
  diff: string;
  files: string[];
}

export interface DiffResponse {
  diff: Diff;
}

export type CheckStatus = "pass" | "fail" | "no_checks";

export interface ParsedCheck {
  name: string;
  passed: boolean;
}

export interface ChecksResponse {
  status: CheckStatus;
  checks: ParsedCheck[];
  error: string;
}

export interface ProjectInfo {
  project_name: string;
  origin: string;
  current_branch: string;
  base_branch: string;
  branches: Branch[];
}

async function parseJson(res: Response): Promise<any> {
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getInfo(): Promise<ProjectInfo> {
  const data = await parseJson(await fetch("/api/info"));
  return {
    project_name: data.project_name,
    origin: data.origin,
    current_branch: data.current_branch,
    base_branch: data.base_branch,
    branches: data.branches,
  };
}

export async function getDiff(ref: ProjectRef): Promise<DiffResponse> {
  const qs = new URLSearchParams();
  if (ref.branch) qs.set("branch", ref.branch);
  if (ref.base) qs.set("base", ref.base);
  if (ref.commit) qs.set("commit", ref.commit);

  const url = qs.toString() ? `/api/diff?${qs.toString()}` : "/api/diff";
  const data = await parseJson(await fetch(url));
  return {
    diff: {
      diff: data.diff,
      files: data.files,
    },
  };
}

export async function getSourceLines(
  ref: ProjectRef,
  file: string,
  start: number,
  end: number,
  side: DiffSide,
): Promise<string> {
  const qs = new URLSearchParams({
    file,
    start: String(start),
    end: String(end),
    side,
    branch: ref.branch,
    base: ref.base,
    commit: ref.commit,
  });
  const data = await parseJson(await fetch(`/api/source?${qs}`));
  return data.lines as string;
}

export async function getChecks(): Promise<ChecksResponse> {
  const data = await parseJson(await fetch("/api/checks"));
  return {
    status: data.status,
    error: data.error,
    checks: data.checks,
  };
}

export async function getOptions(): Promise<AppOptions> {
  const data = await parseJson(await fetch("/api/options"));
  return {
    prompt: data.prompt,
    diff: data.diff,
    default_commit: data.default_commit,
  };
}

export async function resetOptions(): Promise<void> {
  await parseJson(await fetch("/api/options", { method: "DELETE" }));
}

export async function updateOptions(payload: AppOptions): Promise<AppOptions> {
  const data = await parseJson(
    await fetch("/api/options", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
  return {
    prompt: data.prompt,
    diff: data.diff,
    default_commit: data.default_commit,
  };
}
