import { Controller } from "@hotwired/stimulus";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-slim.js";
import { getDiff, getInfo, getOptions } from "../api";
import "../comment.css";

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

function applyPromptTemplate(
  template: string,
  values: { comments: string; branch: string; comment_count: string },
): string {
  const replaceToken = (source: string, token: string, value: string): string =>
    source.split(token).join(value);

  let result = template;
  result = replaceToken(result, "{{comments}}", values.comments);
  result = replaceToken(result, "{{branch}}", values.branch);
  result = replaceToken(result, "{{comment_count}}", values.comment_count);
  return result;
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

type FileTree = Map<string, string | FileTree>;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Omit<Partial<HTMLElementTagNameMap[K]>, "style"> & {
    style?: Partial<CSSStyleDeclaration>;
  },
  children?: (HTMLElement | string)[],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  const { style, ...rest } = attrs;
  Object.assign(element, rest);
  if (style) Object.assign(element.style, style);
  for (const child of children ?? []) {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }
  return element;
}

function buildHrefMap(outputEl: HTMLElement): Map<string, string> {
  const hrefMap = new Map<string, string>();
  outputEl
    .querySelectorAll<HTMLAnchorElement>(".d2h-file-list a.d2h-file-name")
    .forEach((a) => {
      const name = a.textContent?.trim();
      if (name && a.hash) hrefMap.set(name, a.hash);
    });
  return hrefMap;
}

function buildFileTree(files: string[]): FileTree {
  const root: FileTree = new Map();
  for (const file of files ?? []) {
    const parts = file.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current.set(part, file);
      } else {
        if (!current.has(part)) {
          current.set(part, new Map());
        }
        current = current.get(part) as FileTree;
      }
    }
  }
  return root;
}

function renderTreeLevel(
  parent: HTMLElement,
  tree: FileTree,
  hrefMap: Map<string, string>,
  depth: number,
) {
  const entries = Array.from(tree.entries());
  const folders = entries.filter(([, v]) => v instanceof Map) as [
    string,
    FileTree,
  ][];
  const files = entries.filter(([, v]) => typeof v === "string") as [
    string,
    string,
  ][];
  const indent = { paddingLeft: `${depth * 12}px` };

  for (const [name, subtree] of folders) {
    parent.appendChild(
      el("div", { style: indent }, [
        el("span", {
          className:
            "flex items-center text-[10px] font-medium uppercase tracking-wide text-gray-400 gap-1.5 py-1",
          textContent: `${name}`,
        }),
      ]),
    );
    renderTreeLevel(parent, subtree, hrefMap, depth + 1);
  }

  for (const [name, fullPath] of files) {
    const link = el("a", {
      className:
        "block truncate rounded-md px-2 py-1 text-xs text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50 flex-1",
      textContent: name,
      href: hrefMap.get(fullPath) ?? "",
    });

    parent.appendChild(
      el("div", { className: "flex items-center gap-1 group", style: indent }, [
        link,
      ]),
    );
  }
}

function renderFileTree(
  container: HTMLElement,
  outputEl: HTMLElement,
  files: string[],
) {
  container.innerHTML = "";

  const hrefMap = buildHrefMap(outputEl);
  const tree = buildFileTree(files);

  const treeContainer = el("div", { className: "flex flex-col" });
  renderTreeLevel(treeContainer, tree, hrefMap, 0);

  container.appendChild(
    el("h3", {
      className:
        "text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-3 mt-1",
      textContent: "Files",
    }),
  );
  container.appendChild(treeContainer);
}

function renderCommentIndicators(
  outputEl: HTMLElement,
  comments: Comment[],
  popupSignal: AbortSignal,
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
        };
        setTimeout(
          () =>
            document.addEventListener("click", closeHandler, {
              once: true,
              signal: popupSignal,
            }),
          0,
        );
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

  const scrollParent = form.closest(
    ".d2h-file-side-diff",
  ) as HTMLElement | null;
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
  private currentBranchName = "current";
  private activeForm: HTMLElement | null = null;
  private commentPopupAbortController: AbortController | null = null;
  private selectionState: SelectionState = {
    start: null,
    rows: new Set<HTMLElement>(),
    row: null,
    selecting: false,
    hadStart: false,
    didDrag: false,
  };
  private sidebarVisible = true;

  async connect() {
    this.storage.load();
    await this.reloadReview();
    this.outputTarget.addEventListener("mousedown", this.HighlightSelectedLine);
    this.outputTarget.addEventListener("mousemove", this.highlightLineNumber);
    document.addEventListener("mouseup", this.ConfirmCommentSelection);
  }

  disconnect() {
    this.outputTarget.removeEventListener(
      "mousedown",
      this.HighlightSelectedLine,
    );
    this.outputTarget.removeEventListener(
      "mousemove",
      this.highlightLineNumber,
    );
    document.removeEventListener("mouseup", this.ConfirmCommentSelection);
  }

  async reloadReview() {
    await this.populateInfo();
    const branch = this.branchSelectTarget.value;
    const base = this.baseBranchSelectTarget.value;
    const commit = this.commitSelectTarget.value;

    const [diff, options] = await Promise.all([
      getDiff({ branch, base, commit }),
      getOptions(),
    ]);

    const outputFormat =
      options.diff.style === "inline" ? "line-by-line" : "side-by-side";

    this.outputTarget.innerHTML = "";
    const diff2htmlUi = new Diff2HtmlUI(this.outputTarget, diff.diff.diff, {
      drawFileList: true,
      matching: "lines",
      outputFormat,
      fileContentToggle: true,
      diffMaxChanges: 1000,
    });
    diff2htmlUi.draw();

    this.outputTarget
      .querySelectorAll<HTMLElement>(".d2h-file-wrapper")
      .forEach((wrapper) => {
        wrapper.style.contentVisibility = "auto";
        wrapper.style.containIntrinsicSize = "auto 500px";
      });
    this.decorateLineNumbersAndRenderComments();
    renderFileTree(this.fileExplorerTarget, this.outputTarget, diff.diff.files);
    this.storage.load();
  }

  async populateInfo() {
    const info = await getInfo();
    this.currentBranchName = info.current_branch;
    const branchSelect = this.branchSelectTarget;
    const baseBranchSelect = this.baseBranchSelectTarget;
    const commitSelect = this.commitSelectTarget;
    const savedBranch = branchSelect.value;
    const savedBase = baseBranchSelect.value;
    const savedCommit = commitSelect.value;
    const branchNames = info.branches.map((branch) => branch.name);

    branchSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = `${info.current_branch} (current)`;
    branchSelect.appendChild(defaultOption);
    branchNames.forEach((branchName) => {
      if (branchName === info.current_branch) return;
      const option = document.createElement("option");
      option.value = branchName;
      option.textContent = branchName;
      branchSelect.appendChild(option);
    });
    branchSelect.value =
      savedBranch && branchNames.includes(savedBranch) ? savedBranch : "";

    baseBranchSelect.innerHTML = "";
    branchNames.forEach((branchName) => {
      const option = document.createElement("option");
      option.value = branchName;
      option.textContent = branchName;
      baseBranchSelect.appendChild(option);
    });

    if (savedBase && branchNames.includes(savedBase)) {
      baseBranchSelect.value = savedBase;
    } else {
      baseBranchSelect.value = info.base_branch;
    }
    const selectedBranchName = branchSelect.value || info.current_branch;
    const selectedBranch = info.branches.find(
      (branch) => branch.name === selectedBranchName,
    );
    const commits = selectedBranch?.commits ?? [];

    commitSelect.innerHTML = "";
    commits.forEach((commit) => {
      const option = document.createElement("option");
      option.value = commit.hash;
      option.textContent = commit.label;
      commitSelect.appendChild(option);
    });

    commitSelect.value = commits.some((commit) => commit.hash === savedCommit)
      ? savedCommit
      : commits.length > 0
        ? commits[0].hash
        : "";

    return info;
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
    const selectedBranch = this.branchSelectTarget.value;
    const storageBranch = selectedBranch || "current";
    const renderedBranch = selectedBranch || this.currentBranchName;
    const branchComments = this.storage.forBranch(storageBranch);

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
    const commentsBlock = blocks.join("\n\n---\n\n");
    const template = (await getOptions()).prompt.template;
    let reviewText = applyPromptTemplate(template, {
      comments: commentsBlock,
      branch: renderedBranch,
      comment_count: String(branchComments.length),
    });
    if (!template.includes("{{comments}}")) {
      const trimmed = reviewText.trimEnd();
      reviewText = trimmed ? `${trimmed}\n\n${commentsBlock}` : commentsBlock;
    }

    await navigator.clipboard.writeText(reviewText);
    this.storage.clearBranch(storageBranch);
    this.decorateLineNumbersAndRenderComments();
    flashButton(btn, "Copied to clipboard!", 2000);
  }

  private decorateLineNumbersAndRenderComments() {
    this.commentPopupAbortController?.abort();
    this.commentPopupAbortController = new AbortController();

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
      this.commentPopupAbortController.signal,
      (comment) => {
        this.storage.remove(comment);
        this.decorateLineNumbersAndRenderComments();
      },
    );
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
    const start = Math.min(
      this.selectionState.start.startLine,
      this.selectionState.start.endLine,
    );
    const end = Math.max(
      this.selectionState.start.startLine,
      this.selectionState.start.endLine,
    );
    const normalized = {
      ...this.selectionState.start,
      startLine: start,
      endLine: end,
    };
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
      if (
        isNaN(num) ||
        num < normalized.startLine ||
        num > normalized.endLine
      ) {
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
      fileDiffContainer?.querySelector(".d2h-file-name")?.textContent?.trim() ||
      "unknown";

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

  private HighlightSelectedLine = (e: MouseEvent) => {
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

  private highlightLineNumber = (e: MouseEvent) => {
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
        this.selectionState.start.startLine !==
        this.selectionState.start.endLine;
      this.updateSelectionHighlight();
    }
  };

  private ConfirmCommentSelection = () => {
    if (!this.selectionState.selecting) return;
    this.selectionState.selecting = false;

    if (!this.selectionState.start || !this.selectionState.row) {
      this.selectionState.start = null;
      this.clearSelectionHighlight();
      return;
    }

    const shouldCommit =
      this.selectionState.didDrag || this.selectionState.hadStart;
    const normalized = this.selectionState.start;
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
}
