import { type AppOptions } from "./options";

export interface CommitInfo {
  hash: string;
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

export async function getDiff(params: {
  branch?: string;
  base?: string;
  commit?: string;
}): Promise<DiffResponse> {
  const qs = new URLSearchParams();
  if (params.branch) qs.set("branch", params.branch);
  if (params.base) qs.set("base", params.base);
  if (params.commit) qs.set("commit", params.commit);

  const url = qs.toString() ? `/api/diff?${qs.toString()}` : "/api/diff";
  const data = await parseJson(await fetch(url));
  return {
    diff: {
      diff: data.diff.diff,
      files: data.diff.files,
    },
  };
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
  };
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
  };
}
