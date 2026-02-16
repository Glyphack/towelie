import { Controller } from "@hotwired/stimulus";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-slim.js";

enum DiffSide {
  Old = "old",
  New = "new",
}

interface Selection {
  fileName: string;
  startLine: number;
  endLine: number;
  diffSide: DiffSide;
}

interface Comment {
  selection: Selection;
  text: string;
  branch: string;
}

interface DiffResponse {
  branch: string;
  base_branch: string;
  commits: Array<{ hash: string; label: string }>;
  selected_commit: string;
  is_current_branch: boolean;
  diff: string;
  files: string[];
  branches: string[];
  current_branch: string;
}

interface SelectionState {
  start: Selection | null;
  rows: Set<HTMLElement>;
  row: HTMLElement | null;
  selecting: boolean;
  hadStart: boolean;
  didDrag: boolean;
}

interface LineLocation {
  fileName: string;
  diffSide: DiffSide;
  lineNumber: number;
}

interface LineContext {
  location: LineLocation;
  row: HTMLElement;
}


// Temporarily changes button text and disables it, then restores original state after delay
function flashButton(btn: HTMLButtonElement, message: string, ms: number) {
  const original = btn.textContent;
  btn.textContent = message;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, ms);
}

// Injects the shared styles needed for commentable line numbers once.
function ensureCommentableLineNumberStyles() {
  if (document.getElementById("towelie-comment-styles")) return;

  const style = document.createElement("style");
  style.id = "towelie-comment-styles";
  style.textContent = `
    td.d2h-code-side-linenumber.towelie-commentable {
      cursor: pointer;
      position: relative;
      transition: background-color 150ms ease, color 150ms ease;
    }

    td.d2h-code-side-linenumber.towelie-commentable:hover {
      background-color: rgba(16, 185, 129, 0.14);
      color: #065f46;
    }

    td.d2h-code-side-linenumber.towelie-commentable:hover::before {
      content: "+";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #10b981;
      pointer-events: none;
    }

    tr.towelie-comment-range td.d2h-code-side-linenumber {
      background-color: rgba(251, 191, 36, 0.38);
    }

    tr.towelie-comment-range td.d2h-code-side-line {
      background-color: rgba(251, 191, 36, 0.12);
    }

    tr.towelie-comment-anchor td.d2h-code-side-linenumber {
      background-color: rgba(248, 113, 113, 0.38);
      color: #7f1d1d;
    }

    tr.towelie-comment-anchor td.d2h-code-side-line {
      background-color: rgba(248, 113, 113, 0.12);
    }
  `;
  document.head.appendChild(style);
}

class CommentStorage {
  private static KEY = "towelie-comments";
  private comments: Comment[] = [];

  load() {
    const stored = localStorage.getItem(CommentStorage.KEY);
    if (stored) {
      try {
        this.comments = JSON.parse(stored);
      } catch {
        this.comments = [];
        localStorage.removeItem(CommentStorage.KEY);
      }
    }
  }

  add(selection: Selection, text: string, branch: string) {
    this.comments.push({ selection, text, branch });
    this.save();
  }

  remove(comment: Comment) {
    const idx = this.comments.indexOf(comment);
    if (idx !== -1) {
      this.comments.splice(idx, 1);
      this.save();
    }
  }

  forBranch(branch: string): Comment[] {
    return this.comments.filter((c) => c.branch === branch);
  }

  clearBranch(branch: string) {
    this.comments = this.comments.filter((c) => c.branch !== branch);
    this.save();
  }

  private save() {
    localStorage.setItem(CommentStorage.KEY, JSON.stringify(this.comments));
  }
}

function populateBranchSelects(
  branchSelect: HTMLSelectElement,
  baseBranchSelect: HTMLSelectElement,
  data: DiffResponse,
) {
  const savedBranch = branchSelect.value;
  const savedBase = baseBranchSelect.value;

  branchSelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `${data.current_branch} (current)`;
  branchSelect.appendChild(defaultOption);
  for (const branch of data.branches) {
    const option = document.createElement("option");
    option.value = branch;
    option.textContent = branch;
    branchSelect.appendChild(option);
  }
  branchSelect.value = savedBranch;

  const baseBranches = data.branches
    .filter((branch) => branch !== data.current_branch)
    .sort((a, b) => a.localeCompare(b));
  baseBranchSelect.innerHTML = "";
  const baseDefault = document.createElement("option");
  baseDefault.value = "";
  baseDefault.textContent = "Default (main/master)";
  baseBranchSelect.appendChild(baseDefault);
  for (const branch of baseBranches) {
    const option = document.createElement("option");
    option.value = branch;
    option.textContent = branch;
    baseBranchSelect.appendChild(option);
  }
  baseBranchSelect.value = savedBase;
}

function populateCommitSelect(
  commitSelect: HTMLSelectElement,
  data: DiffResponse,
) {
  const savedValue = commitSelect.value;
  commitSelect.innerHTML = "";

  for (const commit of data.commits) {
    const option = document.createElement("option");
    option.value = commit.hash;
    option.textContent = commit.label;
    commitSelect.appendChild(option);
  }

  const options = Array.from(commitSelect.options);
  if (options.some((o) => o.value === savedValue)) {
    commitSelect.value = savedValue;
  }
}

function renderTreeLevel(
  parent: HTMLElement,
  tree: Map<string, any>,
  hrefMap: Map<string, string>,
  depth: number,
) {
  const entries = Array.from(tree.entries());
  const folders = entries.filter(([, v]) => v instanceof Map);
  const files = entries.filter(([, v]) => typeof v === "string");

  for (const [name, subtree] of folders) {
    const folderEl = document.createElement("div");
    folderEl.style.paddingLeft = `${depth * 12}px`;

    const label = document.createElement("span");
    label.className =
      "flex items-center text-[10px] font-medium uppercase tracking-wide text-gray-400 gap-1.5 py-1";
    label.textContent = `📁 ${name}`;
    folderEl.appendChild(label);

    parent.appendChild(folderEl);
    renderTreeLevel(parent, subtree, hrefMap, depth + 1);
  }

  for (const [name, fullPath] of files) {
    const fileEl = document.createElement("div");
    fileEl.style.paddingLeft = `${depth * 12}px`;
    fileEl.className = "flex items-center gap-1 group";

    const a = document.createElement("a");
    a.className =
      "block truncate rounded-md px-2 py-1 text-xs text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50 flex-1";
    a.textContent = name;

    const hash = hrefMap.get(fullPath);
    if (hash) a.href = hash;

    fileEl.appendChild(a);
    parent.appendChild(fileEl);
  }
}

function renderFileTree(
  container: HTMLElement,
  outputEl: HTMLElement,
  files: string[],
) {
  container.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-3 mt-1";
  title.textContent = "Files";
  container.appendChild(title);

  const fileLinks = outputEl.querySelectorAll<HTMLAnchorElement>(
    ".d2h-file-list a.d2h-file-name",
  );
  const hrefMap = new Map<string, string>();
  fileLinks.forEach((a) => {
    const name = a.textContent?.trim();
    if (name && a.hash) hrefMap.set(name, a.hash);
  });

  const root = new Map<string, any>();
  for (const file of files || []) {
    const parts = file.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      if (isFile) {
        current.set(part, file);
      } else {
        if (!current.has(part)) {
          current.set(part, new Map<string, any>());
        }
        current = current.get(part);
      }
    }
  }

  const treeContainer = document.createElement("div");
  treeContainer.className = "flex flex-col";
  renderTreeLevel(treeContainer, root, hrefMap, 0);
  container.appendChild(treeContainer);
}

function renderCommentIndicators(
  outputEl: HTMLElement,
  comments: Comment[],
  onDelete: (comment: Comment) => void,
) {
  outputEl.querySelectorAll(".towelie-comment-btn").forEach((el) => {
    if (el.tagName === "TR") {
      el.querySelectorAll(".d2h-code-side-linenumber").forEach((ln) => {
        (ln as HTMLElement).style.backgroundColor = "";
      });
      el.classList.remove("towelie-comment-btn");
    } else {
      el.remove();
    }
  });
  outputEl
    .querySelectorAll(".towelie-comment-popup")
    .forEach((popup) => popup.remove());

  if (comments.length === 0) return;

  const fileWrappers = Array.from(
    outputEl.querySelectorAll(".d2h-file-wrapper"),
  );

  for (const comment of comments) {
    const { fileName, startLine, diffSide } = comment.selection;

    for (const wrapper of fileWrappers) {
      const fileNameEl = wrapper.querySelector(".d2h-file-name");
      const wrapperFileName = fileNameEl?.textContent?.trim();
      if (wrapperFileName !== fileName) continue;

      const filesDiv = wrapper.querySelector(".d2h-files-diff");
      if (!filesDiv) continue;

      const sides = Array.from(
        filesDiv.querySelectorAll(":scope > .d2h-file-side-diff"),
      );
      const sideContainer = diffSide === DiffSide.Old ? sides[0] : sides[1];
      if (!sideContainer) continue;

      const { endLine } = comment.selection;
      const lineNumberEls = Array.from(
        sideContainer.querySelectorAll(".d2h-code-side-linenumber"),
      );
      let firstRow: HTMLElement | null = null;
      for (const lineEl of lineNumberEls) {
        const num = Number((lineEl as HTMLElement).textContent);
        if (isNaN(num) || num < startLine || num > endLine) continue;

        const row = (lineEl as HTMLElement).closest("tr") as HTMLElement;
        if (!row) continue;

        row.classList.add("towelie-comment-btn");
        (lineEl as HTMLElement).style.backgroundColor =
          "rgba(250, 204, 21, 0.15)";

        if (!firstRow) firstRow = row;
      }

      if (!firstRow) continue;
      firstRow.style.position = "relative";

      const btn = document.createElement("button");
      btn.className =
        "towelie-comment-btn absolute -left-1 top-0 w-5 h-5 rounded-full bg-amber-400 shadow-sm text-[10px] leading-5 text-center cursor-pointer transition-colors hover:bg-amber-500 z-10";
      btn.textContent = "💬";
      btn.title = comment.text;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = firstRow!.querySelector(".towelie-comment-popup");
        if (existing) {
          existing.remove();
          return;
        }
        const popup = document.createElement("div");
        popup.className =
          "towelie-comment-popup absolute left-6 top-0 w-72 rounded-xl border border-gray-100 p-3 bg-white shadow-xl text-sm z-20";
        popup.addEventListener("click", (ev) => ev.stopPropagation());

        const textEl = document.createElement("p");
        textEl.textContent = comment.text;
        popup.appendChild(textEl);

        const deleteBtn = document.createElement("button");
        deleteBtn.className =
          "mt-2 rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => onDelete(comment));
        popup.appendChild(deleteBtn);
        firstRow!.appendChild(popup);

        const closeHandler = () => {
          popup.remove();
          document.removeEventListener("click", closeHandler);
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
      });

      firstRow.appendChild(btn);
    }
  }
}

function showInlineCommentForm(
  anchor: HTMLElement,
  selection: Selection,
  onSubmit: (selection: Selection, text: string) => void,
  onClose: () => void,
): HTMLElement {
  const { fileName, startLine, endLine, diffSide } = selection;

  const form = document.createElement("tr");
  form.innerHTML = `
    <td colspan="99" class="bg-gray-50 border border-gray-100">
      <div class="sticky left-0 flex flex-col gap-2 p-3">
        <span class="text-xs text-gray-500">${fileName} (${diffSide}) : ${startLine}-${endLine}</span>
        <textarea
          class="w-full rounded-lg border border-gray-200 p-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-200 focus:outline-none"
          rows="3"
          placeholder="Write a comment..."
          style="overflow-wrap: break-word; word-break: break-word;"
        ></textarea>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800"
            data-action="submit"
          >
            Comment
          </button>
          <button
            type="button"
            class="rounded-lg bg-white ring-1 ring-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
            data-action="cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </td>
  `;

  form
    .querySelector('[data-action="submit"]')!
    .addEventListener("click", () => {
      const textarea = form.querySelector("textarea")!;
      const text = textarea.value.trim();
      if (text) {
        onSubmit(selection, text);
        form.remove();
        onClose();
      }
    });

  form
    .querySelector('[data-action="cancel"]')!
    .addEventListener("click", () => {
      form.remove();
      onClose();
    });

  anchor.insertAdjacentElement("afterend", form);

  const scrollParent = form.closest(".d2h-file-side-diff") as HTMLElement | null;
  const innerDiv = form.querySelector("div")!;
  if (scrollParent) {
    innerDiv.style.width = `${scrollParent.clientWidth - 24}px`;
  }

  form.querySelector("textarea")!.focus();
  return form;
}


export default class ReviewController extends Controller {
  static targets = [
    "output",
    "fileExplorer",
    "branchSelect",
    "baseBranchSelect",
    "commitSelect",
    "sidebar",
    "sidebarToggle",
  ];

  declare readonly outputTarget: HTMLElement;
  declare readonly fileExplorerTarget: HTMLElement;
  declare readonly branchSelectTarget: HTMLSelectElement;
  declare readonly baseBranchSelectTarget: HTMLSelectElement;
  declare readonly commitSelectTarget: HTMLSelectElement;
  declare readonly sidebarTarget: HTMLElement;
  declare readonly sidebarToggleTarget: HTMLElement;

  private storage = new CommentStorage();
  private activeForm: HTMLElement | null = null;
  private selectionState: SelectionState = {
    start: null,
    rows: new Set<HTMLElement>(),
    row: null,
    selecting: false,
    hadStart: false,
    didDrag: false,
  };
  private sidebarVisible = true;

  private handleLineMouseDown = (e: MouseEvent) => {
    const context = this.getLineContext(e.target);
    if (!context) return;

    e.preventDefault();

    if (this.activeForm) {
      this.activeForm.remove();
      this.activeForm = null;
    }

    const { location, row } = context;

    if (
      !this.selectionState.start ||
      !this.matchesSelectionLocation(this.selectionState.start, location)
    ) {
      this.selectionState.start = this.selectionFromLocation(location);
      this.selectionState.hadStart = false;
    } else {
      this.selectionState.start.endLine = location.lineNumber;
      this.selectionState.hadStart = true;
    }

    this.selectionState.selecting = true;
    this.selectionState.didDrag = false;

    this.selectionState.row = row;
    this.updateSelectionHighlight();
  };

  private handleLineMouseMove = (e: MouseEvent) => {
    if (!this.selectionState.selecting || !this.selectionState.start) return;
    const context = this.getLineContext(e.target);
    if (!context) return;

    const { location, row } = context;
    if (!this.matchesSelectionLocation(this.selectionState.start, location)) {
      return;
    }

    if (this.selectionState.start.endLine !== location.lineNumber) {
      this.selectionState.start.endLine = location.lineNumber;
      this.selectionState.row = row;
      this.selectionState.didDrag =
        this.selectionState.start.startLine !== this.selectionState.start.endLine;
      this.updateSelectionHighlight();
    }
  };

  private handleMouseUp = () => {
    if (!this.selectionState.selecting) return;
    this.selectionState.selecting = false;

    if (!this.selectionState.start || !this.selectionState.row) {
      this.selectionState.start = null;
      this.clearSelectionHighlight();
      return;
    }

    const shouldCommit = this.selectionState.didDrag || this.selectionState.hadStart;
    const normalized = this.normalizeSelection(this.selectionState.start);
    this.selectionState.hadStart = false;
    this.selectionState.didDrag = false;

    if (!shouldCommit) {
      this.updateSelectionHighlight();
      return;
    }

    this.selectionState.start = null;

    this.activeForm = showInlineCommentForm(
      this.selectionState.row,
      normalized,
      (selection, text) => {
        const branch = this.branchSelectTarget.value || "current";
        this.storage.add(selection, text, branch);
        this.activeForm = null;
        this.decorateLineNumbersAndRenderComments();
      },
      () => {
        this.clearSelectionHighlight();
      },
    );
  };

  async connect() {
    this.storage.load();
    ensureCommentableLineNumberStyles();
    await this.reloadReview();
    this.outputTarget.addEventListener("mousedown", this.handleLineMouseDown);
    this.outputTarget.addEventListener("mousemove", this.handleLineMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  disconnect() {
    this.outputTarget.removeEventListener(
      "mousedown",
      this.handleLineMouseDown,
    );
    this.outputTarget.removeEventListener(
      "mousemove",
      this.handleLineMouseMove,
    );
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  branchChanged() {
    this.commitSelectTarget.value = "";
    this.reloadReview();
  }

  async reloadReview() {
    const branch = this.branchSelectTarget.value;
    const base = this.baseBranchSelectTarget.value;
    const commit = this.commitSelectTarget.value;

    const params = new URLSearchParams();
    if (branch) params.set("branch", branch);
    if (base) params.set("base", base);
    if (commit) params.set("commit", commit);

    const url = params.toString()
      ? `/api/diff?${params.toString()}`
      : "/api/diff";
    const res = await fetch(url);
    const data: DiffResponse = await res.json();

    this.outputTarget.innerHTML = "";
    const diff2htmlUi = new Diff2HtmlUI(this.outputTarget, data.diff, {
      drawFileList: true,
      matching: "lines",
      outputFormat: "side-by-side",
    });
    diff2htmlUi.draw();
    this.decorateLineNumbersAndRenderComments();
    renderFileTree(
      this.fileExplorerTarget,
      this.outputTarget,
      data.files,
    );
    populateCommitSelect(this.commitSelectTarget, data);
    populateBranchSelects(
      this.branchSelectTarget,
      this.baseBranchSelectTarget,
      data,
    );
    this.storage.load();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    const svg = this.sidebarToggleTarget.querySelector("svg");
    if (this.sidebarVisible) {
      this.sidebarTarget.style.display = "";
      if (svg) svg.style.transform = "";
    } else {
      this.sidebarTarget.style.display = "none";
      if (svg) svg.style.transform = "scaleX(-1)";
    }
  }

  async finishReview(e: Event) {
    const btn = e.currentTarget as HTMLButtonElement;
    const currentBranch = this.branchSelectTarget.value || "current";
    const branchComments = this.storage.forBranch(currentBranch);

    if (branchComments.length === 0) {
      flashButton(btn, "No comments to copy", 2000);
      return;
    }

    const blocks = branchComments.map((c) => {
      const s = c.selection;
      const sideLabel =
        s.diffSide === DiffSide.Old
          ? "old code (before the change)"
          : "new code (after the change)";
      return `${s.fileName} lines ${s.startLine}-${s.endLine} on the ${sideLabel}\n\n\`\`\`\n${c.text}\n\`\`\``;
    });
    const reviewText =
      "Here's the review of the user:\n\n" + blocks.join("\n\n---\n\n");

    await navigator.clipboard.writeText(reviewText);
    this.storage.clearBranch(currentBranch);
    this.decorateLineNumbersAndRenderComments();
    flashButton(btn, "Copied to clipboard!", 2000);
  }

  private decorateLineNumbersAndRenderComments() {
    const lineNumbers = this.outputTarget.querySelectorAll<HTMLElement>(
      ".d2h-code-side-linenumber",
    );
    lineNumbers.forEach((el) => {
      el.classList.add("towelie-commentable");
      if (!el.title) {
        el.title = "Click or drag to add a comment";
      }
    });

    const branch = this.branchSelectTarget.value || "current";
    renderCommentIndicators(
      this.outputTarget,
      this.storage.forBranch(branch),
      (comment) => {
        this.storage.remove(comment);
        this.decorateLineNumbersAndRenderComments();
      },
    );
  }

  // Ensures startLine <= endLine regardless of drag direction
  private normalizeSelection(selection: Selection): Selection {
    const start = Math.min(selection.startLine, selection.endLine);
    const end = Math.max(selection.startLine, selection.endLine);
    return {
      ...selection,
      startLine: start,
      endLine: end,
    };
  }

  private clearSelectionHighlight() {
    this.selectionState.rows.forEach((row) => {
      row.classList.remove("towelie-comment-range", "towelie-comment-anchor");
    });
    this.selectionState.rows.clear();
  }

  private selectionFromLocation(location: LineLocation): Selection {
    return {
      fileName: location.fileName,
      startLine: location.lineNumber,
      endLine: location.lineNumber,
      diffSide: location.diffSide,
    };
  }

  private matchesSelectionLocation(
    selection: Selection,
    location: LineLocation,
  ): boolean {
    return (
      selection.fileName === location.fileName &&
      selection.diffSide === location.diffSide
    );
  }

  // Highlights selected line range in the diff view with colored backgrounds
  private updateSelectionHighlight() {
    if (!this.selectionState.start) return;
    const normalized = this.normalizeSelection(this.selectionState.start);
    this.clearSelectionHighlight();

    const wrappers = Array.from(
      this.outputTarget.querySelectorAll(".d2h-file-wrapper"),
    );
    const wrapper = wrappers.find((item) => {
      const nameEl = item.querySelector(".d2h-file-name");
      return nameEl?.textContent?.trim() === normalized.fileName;
    });
    if (!wrapper) return;

    const filesDiv = wrapper.querySelector(".d2h-files-diff");
    if (!filesDiv) return;

    const sides = Array.from(
      filesDiv.querySelectorAll(":scope > .d2h-file-side-diff"),
    );
    const sideContainer =
      normalized.diffSide === DiffSide.Old ? sides[0] : sides[1];
    if (!sideContainer) return;

    const lineNumberEls = Array.from(
      sideContainer.querySelectorAll(".d2h-code-side-linenumber"),
    );
    // Find all rows within the selected line range and apply highlight classes
    for (const lineEl of lineNumberEls) {
      const num = Number((lineEl as HTMLElement).textContent);
      if (isNaN(num) || num < normalized.startLine || num > normalized.endLine) {
        continue;
      }

      const row = (lineEl as HTMLElement).closest("tr") as HTMLElement | null;
      if (!row) continue;

      row.classList.add("towelie-comment-range");
      if (num === normalized.startLine) {
        row.classList.add("towelie-comment-anchor");
      }
      this.selectionState.rows.add(row);
    }
  }

  private getLineContext(target: EventTarget | null): LineContext | null {
    if (!(target instanceof HTMLElement)) return null;

    const lineCell =
      (target.closest("td.d2h-code-side-linenumber") as HTMLElement | null) ||
      (target.closest("td.d2h-code-side-line")
        ?.previousElementSibling as HTMLElement | null);
    if (!lineCell) return null;

    const lineNumber = Number(lineCell.textContent);
    if (isNaN(lineNumber)) return null;

    const row = lineCell.closest("tr") as HTMLElement | null;
    if (!row) return null;

    const fileDiffContainer = lineCell.closest(".d2h-file-wrapper");
    const fileName =
      fileDiffContainer
        ?.querySelector(".d2h-file-name")
        ?.textContent?.trim() || "unknown";

    const filesDiv = lineCell.closest(".d2h-files-diff");
    let diffSide = DiffSide.New;
    if (filesDiv) {
      const sides = Array.from(
        filesDiv.querySelectorAll(":scope > .d2h-file-side-diff"),
      );
      const sideDiv = lineCell.closest(".d2h-file-side-diff");
      if (sideDiv === sides[0]) diffSide = DiffSide.Old;
    }

    return {
      location: {
        fileName,
        diffSide,
        lineNumber,
      },
      row,
    };
  }
}
