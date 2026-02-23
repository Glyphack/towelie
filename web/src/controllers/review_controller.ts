import { Controller } from "@hotwired/stimulus";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-slim.js";
import { getDiff, getInfo, getOptions } from "../api";

enum DiffSide {
  Old = "old",
  New = "new",
}

type FileStatus = "M" | "A" | "D";

interface Selection {
  fileName: string;
  startLine: number;
  endLine: number;
  diffSide: DiffSide;
}

interface CommentRecord {
  id: string;
  selection: Selection;
  text: string;
  branch: string;
  author: "You";
  createdAt: number;
  updatedAt: number;
}

interface SelectionState {
  start: LineLocation | null;
  end: LineLocation | null;
  selecting: boolean;
  rows: Set<HTMLElement>;
  dragMoved: boolean;
  usedAnchor: boolean;
}

interface LineLocation {
  fileName: string;
  diffSide: DiffSide;
  lineNumber: number;
}

interface LineContext {
  location: LineLocation;
  row: HTMLTableRowElement;
}

interface FileEntry {
  fileName: string;
  pathParts: string[];
  status: FileStatus;
  anchorId: string;
  wrapper: HTMLElement;
}

interface FileTreeNode {
  path: string;
  folders: Map<string, FileTreeNode>;
  files: FileEntry[];
}

function applyPromptTemplate(
  template: string,
  values: { comments: string; branch: string; comment_count: string },
): string {
  return template
    .split("{{comments}}")
    .join(values.comments)
    .split("{{branch}}")
    .join(values.branch)
    .split("{{comment_count}}")
    .join(values.comment_count);
}

function flashButton(btn: HTMLButtonElement, message: string, ms: number) {
  const original = btn.textContent;
  btn.textContent = message;
  btn.disabled = true;
  window.setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, ms);
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

class CommentStorage {
  private static KEY = "towelie-comments";
  private comments: CommentRecord[] = [];

  load() {
    const stored = localStorage.getItem(CommentStorage.KEY);
    if (!stored) {
      this.comments = [];
      return;
    }

    try {
      const raw = JSON.parse(stored) as Array<Partial<CommentRecord>>;
      const now = Date.now();
      this.comments = raw
        .filter(
          (item): item is Partial<CommentRecord> & { selection: Selection } =>
            Boolean(item?.selection && item.text && item.branch),
        )
        .map((item) => {
          const createdAt =
            typeof item.createdAt === "number" ? item.createdAt : now;
          const updatedAt =
            typeof item.updatedAt === "number" ? item.updatedAt : createdAt;
          return {
            id: typeof item.id === "string" ? item.id : makeId(),
            selection: item.selection,
            text: item.text ?? "",
            branch: item.branch ?? "current",
            author: "You",
            createdAt,
            updatedAt,
          };
        });
      this.save();
    } catch {
      this.comments = [];
      localStorage.removeItem(CommentStorage.KEY);
    }
  }

  add(selection: Selection, text: string, branch: string): CommentRecord {
    const now = Date.now();
    const comment: CommentRecord = {
      id: makeId(),
      selection,
      text,
      branch,
      author: "You",
      createdAt: now,
      updatedAt: now,
    };
    this.comments.push(comment);
    this.save();
    return comment;
  }

  remove(id: string) {
    this.comments = this.comments.filter((comment) => comment.id !== id);
    this.save();
  }

  update(id: string, text: string) {
    const comment = this.comments.find((entry) => entry.id === id);
    if (!comment) return;
    comment.text = text;
    comment.updatedAt = Date.now();
    comment.author = "You";
    this.save();
  }

  forBranch(branch: string): CommentRecord[] {
    return this.comments.filter((comment) => comment.branch === branch);
  }

  clearBranch(branch: string) {
    this.comments = this.comments.filter(
      (comment) => comment.branch !== branch,
    );
    this.save();
  }

  private save() {
    localStorage.setItem(CommentStorage.KEY, JSON.stringify(this.comments));
  }
}

function parseFileStatuses(diffText: string): Map<string, FileStatus> {
  const statuses = new Map<string, FileStatus>();
  const lines = diffText.split("\n");

  let oldPath = "";
  let newPath = "";
  let status: FileStatus = "M";

  const flush = () => {
    if (status === "D") {
      if (oldPath) statuses.set(oldPath, "D");
      return;
    }
    if (newPath) statuses.set(newPath, status);
    else if (oldPath) statuses.set(oldPath, status);
  };

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      if (oldPath || newPath) flush();
      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      oldPath = match?.[1] ?? "";
      newPath = match?.[2] ?? "";
      status = "M";
      continue;
    }
    if (!oldPath && !newPath) continue;

    if (line.startsWith("new file mode ")) status = "A";
    if (line.startsWith("deleted file mode ")) status = "D";
    if (line.startsWith("rename from ")) oldPath = line.slice(12).trim();
    if (line.startsWith("rename to ")) newPath = line.slice(10).trim();
  }

  if (oldPath || newPath) flush();
  return statuses;
}

function detectStatus(
  fileName: string,
  statuses: Map<string, FileStatus>,
  diffFiles: string[],
): FileStatus {
  if (statuses.has(fileName)) return statuses.get(fileName) ?? "M";

  if (fileName.includes(" -> ")) {
    const [from, to] = fileName.split(" -> ").map((part) => part.trim());
    if (statuses.has(to)) return statuses.get(to) ?? "M";
    if (statuses.has(from)) return statuses.get(from) ?? "M";
  }

  const bySuffix = diffFiles.find(
    (candidate) => candidate.endsWith(fileName) || fileName.endsWith(candidate),
  );
  if (bySuffix && statuses.has(bySuffix)) return statuses.get(bySuffix) ?? "M";
  return "M";
}

export default class ReviewController extends Controller {
  static targets = [
    "shell",
    "sidebar",
    "sidebarStrip",
    "sidebarToggleIcon",
    "mainScroll",
    "output",
    "fileExplorer",
    "branchSelect",
    "baseBranchSelect",
    "commitSelect",
    "fileCount",
    "commentCount",
    "submitNotes",
  ];

  declare readonly shellTarget: HTMLElement;
  declare readonly sidebarTarget: HTMLElement;
  declare readonly sidebarStripTarget: HTMLButtonElement;
  declare readonly sidebarToggleIconTarget: HTMLElement;
  declare readonly mainScrollTarget: HTMLElement;
  declare readonly outputTarget: HTMLElement;
  declare readonly fileExplorerTarget: HTMLElement;
  declare readonly branchSelectTarget: HTMLSelectElement;
  declare readonly baseBranchSelectTarget: HTMLSelectElement;
  declare readonly commitSelectTarget: HTMLSelectElement;
  declare readonly fileCountTarget: HTMLElement;
  declare readonly commentCountTarget: HTMLElement;
  declare readonly submitNotesTarget: HTMLTextAreaElement;

  private storage = new CommentStorage();
  private currentBranchName = "current";
  private sidebarVisible = true;
  private fileEntries: FileEntry[] = [];
  private fileButtons = new Map<string, HTMLButtonElement>();
  private activeFileId = "";
  private scrollTicking = false;
  private openPanelRow: HTMLTableRowElement | null = null;
  private openPanelKey = "";
  private selectionState: SelectionState = {
    start: null,
    end: null,
    selecting: false,
    rows: new Set<HTMLElement>(),
    dragMoved: false,
    usedAnchor: false,
  };

  async connect() {
    this.storage.load();
    await this.reloadReview();
    this.outputTarget.addEventListener("mousedown", this.onMouseDown);
    this.outputTarget.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    this.mainScrollTarget.addEventListener("scroll", this.onMainScroll);
  }

  disconnect() {
    this.outputTarget.removeEventListener("mousedown", this.onMouseDown);
    this.outputTarget.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    this.mainScrollTarget.removeEventListener("scroll", this.onMainScroll);
  }

  async reloadReview() {
    await this.populateInfo();
    this.closePanel();
    this.clearSelectionHighlight();

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
      drawFileList: false,
      matching: "lines",
      outputFormat,
      fileContentToggle: true,
      stickyFileHeaders: false,
      diffMaxChanges: 50000,
    });
    diff2htmlUi.draw();

    const statusMap = parseFileStatuses(diff.diff.diff);
    this.fileEntries = this.collectFileEntries(statusMap, diff.diff.files);
    this.fileCountTarget.textContent = String(this.fileEntries.length);

    this.renderFileTree();
    this.normalizeDiffRows();
    this.renderComments();
    this.updateActiveFileFromScroll();
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
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.shellTarget.classList.toggle(
      "is-sidebar-collapsed",
      !this.sidebarVisible,
    );
    this.sidebarStripTarget.classList.toggle("hidden", this.sidebarVisible);
    this.sidebarStripTarget.setAttribute(
      "aria-hidden",
      String(this.sidebarVisible),
    );
    this.sidebarToggleIconTarget.classList.toggle(
      "is-collapsed",
      !this.sidebarVisible,
    );
  }

  async finishReview(e: Event) {
    const btn = e.currentTarget as HTMLButtonElement;
    const selectedBranch = this.branchSelectTarget.value;
    const storageBranch = selectedBranch || "current";
    const renderedBranch = selectedBranch || this.currentBranchName;
    const branchComments = this.storage.forBranch(storageBranch);
    const overallNotes = this.submitNotesTarget.value.trim();

    if (branchComments.length === 0 && !overallNotes) {
      flashButton(btn, "No comments to copy", 2000);
      return;
    }

    const blocks = branchComments.map((comment) => {
      const selection = comment.selection;
      const sideLabel =
        selection.diffSide === DiffSide.Old
          ? "old code (before the change)"
          : "new code (after the change)";
      const lineLabel =
        selection.startLine === selection.endLine
          ? `${selection.startLine}`
          : `${selection.startLine}-${selection.endLine}`;
      return `${selection.fileName} lines ${lineLabel} on the ${sideLabel}\n\n\`\`\`\n${comment.text}\n\`\`\``;
    });

    let commentsBlock = blocks.join("\n\n---\n\n");
    if (overallNotes) {
      commentsBlock = commentsBlock
        ? `Overall notes:\n${overallNotes}\n\n---\n\n${commentsBlock}`
        : `Overall notes:\n${overallNotes}`;
    }

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
    this.renderComments();
    flashButton(btn, "Copied to clipboard!", 2000);
  }

  private collectFileEntries(
    statuses: Map<string, FileStatus>,
    diffFiles: string[],
  ): FileEntry[] {
    return Array.from(
      this.outputTarget.querySelectorAll<HTMLElement>(".d2h-file-wrapper"),
    )
      .map((wrapper, index) => {
        const fileName =
          wrapper.querySelector(".d2h-file-name")?.textContent?.trim() ||
          `file-${index + 1}`;
        const anchorId = `towelie-file-${index + 1}`;
        wrapper.id = anchorId;
        wrapper.dataset.fileName = fileName;

        const split = fileName.split("/");

        return {
          fileName,
          pathParts: split,
          status: detectStatus(fileName, statuses, diffFiles),
          anchorId,
          wrapper,
        };
      })
      .sort((a, b) => a.fileName.localeCompare(b.fileName));
  }

  private renderFileTree() {
    this.fileButtons.clear();
    this.fileExplorerTarget.innerHTML = "";

    const comments = this.storage.forBranch(this.currentStorageBranch());
    const commentedFiles = new Set(
      comments.map((comment) => comment.selection.fileName),
    );

    const root: FileTreeNode = {
      path: "",
      folders: new Map<string, FileTreeNode>(),
      files: [],
    };

    this.fileEntries.forEach((entry) => {
      let node = root;
      const directories = entry.pathParts.slice(0, -1);
      directories.forEach((directory) => {
        const nextPath = node.path ? `${node.path}/${directory}` : directory;
        if (!node.folders.has(directory)) {
          node.folders.set(directory, {
            path: nextPath,
            folders: new Map<string, FileTreeNode>(),
            files: [],
          });
        }
        node = node.folders.get(directory)!;
      });
      node.files.push(entry);
    });

    const renderNode = (node: FileTreeNode, depth: number) => {
      Array.from(node.folders.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([name, folderNode]) => {
          const folderRow = document.createElement("div");
          folderRow.className = "towelie-tree-folder";
          folderRow.style.paddingLeft = `${12 + depth * 14}px`;
          folderRow.innerHTML = `
            <span class="towelie-tree-folder-icon">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H3z"></path><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2"></path></svg>
            </span>
            <span class="towelie-tree-folder-name">${name}</span>
          `;
          this.fileExplorerTarget.appendChild(folderRow);
          renderNode(folderNode, depth + 1);
        });

      node.files
        .sort((a, b) => a.fileName.localeCompare(b.fileName))
        .forEach((entry) => {
          const row = document.createElement("button");
          row.type = "button";
          row.className = "towelie-tree-file";
          row.dataset.anchorId = entry.anchorId;
          row.style.paddingLeft = `${12 + depth * 14}px`;

          const icon = document.createElement("span");
          icon.className = "towelie-tree-icon";
          icon.innerHTML =
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';

          const name = document.createElement("span");
          name.className = "towelie-tree-name";
          name.textContent =
            entry.pathParts[entry.pathParts.length - 1] ?? entry.fileName;

          const badge = document.createElement("span");
          badge.className = `towelie-tree-status towelie-tree-status-${entry.status.toLowerCase()}`;
          badge.textContent = entry.status;

          const dot = document.createElement("span");
          dot.className = "towelie-tree-comment-dot";
          if (!commentedFiles.has(entry.fileName)) {
            dot.classList.add("hidden");
          }

          row.append(icon, name, badge, dot);
          row.addEventListener("click", () =>
            this.scrollToFile(entry.anchorId),
          );
          this.fileExplorerTarget.appendChild(row);
          this.fileButtons.set(entry.anchorId, row);
        });
    };

    renderNode(root, 0);
  }

  private normalizeDiffRows() {
    this.outputTarget
      .querySelectorAll<HTMLTableRowElement>(".towelie-comment-panel-row")
      .forEach((row) => row.remove());

    const rows =
      this.outputTarget.querySelectorAll<HTMLTableRowElement>(
        ".d2h-diff-tbody tr",
      );
    rows.forEach((row) => {
      row.classList.remove("towelie-diff-row", "has-comment");
      row
        .querySelectorAll<HTMLElement>(".towelie-comment-gutter")
        .forEach((gutter) => gutter.remove());
      row
        .querySelectorAll<HTMLElement>(".towelie-comment-trigger")
        .forEach((trigger) => trigger.remove());

      const lineCells = Array.from(
        row.querySelectorAll<HTMLElement>(
          "td.d2h-code-side-linenumber, td.d2h-code-linenumber",
        ),
      );

      lineCells.forEach((lineCell) => {
        const lineNumber = Number(lineCell.textContent?.trim());
        if (Number.isNaN(lineNumber) || lineNumber <= 0) return;

        const context = this.buildContextFromCell(lineCell, row);
        if (!context) return;

        row.classList.add("towelie-diff-row");
        lineCell.classList.add("towelie-commentable-number");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "towelie-comment-trigger";
        button.title = "Toggle comment panel";
        button.dataset.fileName = context.location.fileName;
        button.dataset.diffSide = context.location.diffSide;
        button.dataset.line = String(context.location.lineNumber);
        button.innerHTML =
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.togglePanelForRow(row, context.location);
        });

        lineCell.appendChild(button);
      });
    });
  }

  private renderComments() {
    const branch = this.currentStorageBranch();
    const comments = this.storage.forBranch(branch);

    this.commentCountTarget.textContent = `${comments.length} notes`;
    this.closePanel();

    this.outputTarget
      .querySelectorAll<HTMLTableRowElement>(".d2h-diff-tbody tr")
      .forEach((row) => {
        row.classList.remove(
          "has-comment",
          "towelie-comment-range",
          "towelie-comment-anchor",
        );
        row
          .querySelectorAll<HTMLElement>(".towelie-comment-trigger")
          .forEach((button) => button.classList.remove("has-comment"));
      });

    const commentsByFile = new Map<string, CommentRecord[]>();
    comments.forEach((comment) => {
      if (!commentsByFile.has(comment.selection.fileName)) {
        commentsByFile.set(comment.selection.fileName, []);
      }
      commentsByFile.get(comment.selection.fileName)?.push(comment);
    });

    this.fileEntries.forEach((entry) => {
      const button = this.fileButtons.get(entry.anchorId);
      if (!button) return;
      const dot = button.querySelector(".towelie-tree-comment-dot");
      if (!dot) return;
      dot.classList.toggle("hidden", !commentsByFile.has(entry.fileName));
    });

    comments.forEach((comment) => {
      const rows = this.findRowsForSelection(comment.selection);
      rows.forEach((row) => row.classList.add("towelie-comment-range"));

      const anchorRow = rows[0];
      if (!anchorRow) return;
      anchorRow.classList.add("has-comment", "towelie-comment-anchor");

      const triggers = Array.from(
        anchorRow.querySelectorAll<HTMLElement>(
          `.towelie-comment-trigger[data-file-name="${CSS.escape(comment.selection.fileName)}"][data-diff-side="${comment.selection.diffSide}"]`,
        ),
      );
      const anchorTrigger =
        triggers.find(
          (trigger) =>
            Number(trigger.dataset.line) === comment.selection.startLine,
        ) ??
        triggers.find((trigger) => {
          const line = Number(trigger.dataset.line);
          return (
            !Number.isNaN(line) &&
            line >= comment.selection.startLine &&
            line <= comment.selection.endLine
          );
        });
      anchorTrigger?.classList.add("has-comment");
    });

    this.updateActiveFileFromScroll();
  }

  private findRowsForSelection(selection: Selection): HTMLTableRowElement[] {
    const rows: HTMLTableRowElement[] = [];
    const wrapper = this.outputTarget.querySelector<HTMLElement>(
      `.d2h-file-wrapper[data-file-name="${CSS.escape(selection.fileName)}"]`,
    );
    if (!wrapper) return rows;

    wrapper
      .querySelectorAll<HTMLTableRowElement>(".d2h-diff-tbody tr")
      .forEach((row) => {
        const buttons = row.querySelectorAll<HTMLButtonElement>(
          `.towelie-comment-trigger[data-file-name="${CSS.escape(selection.fileName)}"][data-diff-side="${selection.diffSide}"]`,
        );
        buttons.forEach((button) => {
          const line = Number(button.dataset.line);
          if (
            !Number.isNaN(line) &&
            line >= selection.startLine &&
            line <= selection.endLine
          ) {
            rows.push(row);
          }
        });
      });

    return rows;
  }

  private togglePanelForRow(row: HTMLTableRowElement, location: LineLocation) {
    const key = `${location.fileName}:${location.diffSide}:${location.lineNumber}`;
    if (this.openPanelKey === key) {
      this.closePanel();
      return;
    }

    const comments = this.commentsForLocation(location);
    if (comments.length > 0) {
      this.openSavedPanel(row, location, comments);
      return;
    }

    this.openDraftPanel(row, {
      fileName: location.fileName,
      diffSide: location.diffSide,
      startLine: location.lineNumber,
      endLine: location.lineNumber,
    });
  }

  private openSavedPanel(
    diffRow: HTMLTableRowElement,
    location: LineLocation,
    comments: CommentRecord[],
  ) {
    this.closePanel();

    const panelRow = this.createPanelRow(diffRow, location);
    const panelBody = panelRow.querySelector<HTMLElement>(
      ".towelie-comment-panel-body",
    );
    if (!panelBody) return;

    comments.forEach((comment) => {
      const lineLabel =
        comment.selection.startLine === comment.selection.endLine
          ? `${comment.selection.startLine}`
          : `${comment.selection.startLine}-${comment.selection.endLine}`;

      const block = document.createElement("article");
      block.className = "towelie-comment-block";
      block.innerHTML = `
        <p class="towelie-comment-text"></p>
        <div class="towelie-comment-meta">${comment.author} · lines ${lineLabel}</div>
      `;
      const textNode = block.querySelector<HTMLElement>(
        ".towelie-comment-text",
      );
      if (textNode) textNode.textContent = comment.text;

      const actions = document.createElement("div");
      actions.className = "towelie-comment-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "towelie-comment-action";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        const editor = document.createElement("div");
        editor.className = "towelie-comment-editor";

        const textarea = document.createElement("textarea");
        textarea.rows = 3;
        textarea.className = "towelie-comment-textarea";
        textarea.value = comment.text;

        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "towelie-comment-save";
        saveBtn.textContent = "Save";

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "towelie-comment-cancel";
        cancelBtn.textContent = "Cancel";

        saveBtn.addEventListener("click", () => {
          const next = textarea.value.trim();
          if (!next) return;
          this.storage.update(comment.id, next);
          this.renderComments();
          this.openSavedPanel(
            diffRow,
            location,
            this.commentsForLocation(location),
          );
        });

        cancelBtn.addEventListener("click", () => {
          this.openSavedPanel(
            diffRow,
            location,
            this.commentsForLocation(location),
          );
        });

        const controls = document.createElement("div");
        controls.className = "towelie-comment-editor-controls";
        controls.append(saveBtn, cancelBtn);

        editor.append(textarea, controls);
        block.replaceChildren(editor);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "towelie-comment-action towelie-comment-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        this.storage.remove(comment.id);
        this.renderComments();
      });

      actions.append(editBtn, deleteBtn);
      block.appendChild(actions);
      panelBody.appendChild(block);
    });

    this.openPanelRow = panelRow;
    this.openPanelKey = `${location.fileName}:${location.diffSide}:${location.lineNumber}`;
    panelRow.classList.add("open");
  }

  private openDraftPanel(row: HTMLTableRowElement, selection: Selection) {
    this.closePanel();
    const location: LineLocation = {
      fileName: selection.fileName,
      diffSide: selection.diffSide,
      lineNumber: selection.startLine,
    };
    const panelRow = this.createPanelRow(row, location);
    const panelBody = panelRow.querySelector<HTMLElement>(
      ".towelie-comment-panel-body",
    );
    if (!panelBody) return;

    const editor = document.createElement("div");
    editor.className = "towelie-comment-editor";

    const label =
      selection.startLine === selection.endLine
        ? `${selection.fileName} · line ${selection.startLine}`
        : `${selection.fileName} · lines ${selection.startLine}-${selection.endLine}`;
    const caption = document.createElement("div");
    caption.className = "towelie-comment-meta";
    caption.textContent = label;

    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.className = "towelie-comment-textarea";
    textarea.placeholder = "Write a comment...";

    const controls = document.createElement("div");
    controls.className = "towelie-comment-editor-controls";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "towelie-comment-save";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "towelie-comment-cancel";
    cancelBtn.textContent = "Cancel";

    saveBtn.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text) return;
      this.storage.add(selection, text, this.currentStorageBranch());
      this.renderComments();
    });

    cancelBtn.addEventListener("click", () => {
      this.closePanel();
      this.clearSelectionHighlight();
    });

    controls.append(saveBtn, cancelBtn);
    editor.append(caption, textarea, controls);
    panelBody.appendChild(editor);

    this.openPanelRow = panelRow;
    this.openPanelKey = `${selection.fileName}:${selection.diffSide}:${selection.startLine}`;
    panelRow.classList.add("open");
    textarea.focus();
  }

  private createPanelRow(
    row: HTMLTableRowElement,
    location: LineLocation,
  ): HTMLTableRowElement {
    const panelRow = document.createElement("tr");
    panelRow.className = "towelie-comment-panel-row";
    panelRow.dataset.fileName = location.fileName;
    panelRow.dataset.diffSide = location.diffSide;

    const cell = document.createElement("td");
    cell.colSpan = row.children.length;
    cell.innerHTML =
      '<div class="towelie-comment-panel"><div class="towelie-comment-panel-body"></div></div>';
    panelRow.appendChild(cell);

    row.insertAdjacentElement("afterend", panelRow);
    return panelRow;
  }

  private closePanel() {
    if (!this.openPanelRow) return;
    this.openPanelRow.remove();
    this.openPanelRow = null;
    this.openPanelKey = "";
  }

  private commentsForLocation(location: LineLocation): CommentRecord[] {
    return this.storage
      .forBranch(this.currentStorageBranch())
      .filter((comment) => {
        const selection = comment.selection;
        return (
          selection.fileName === location.fileName &&
          selection.diffSide === location.diffSide &&
          location.lineNumber >= selection.startLine &&
          location.lineNumber <= selection.endLine
        );
      });
  }

  private currentStorageBranch(): string {
    return this.branchSelectTarget.value || "current";
  }

  private scrollToFile(anchorId: string) {
    const wrapper = this.outputTarget.querySelector<HTMLElement>(
      `#${CSS.escape(anchorId)}`,
    );
    if (!wrapper) return;

    const containerRect = this.mainScrollTarget.getBoundingClientRect();
    const targetRect = wrapper.getBoundingClientRect();
    const top =
      this.mainScrollTarget.scrollTop + targetRect.top - containerRect.top - 20;

    this.mainScrollTarget.scrollTo({ top, behavior: "smooth" });
    this.setActiveFile(anchorId);
  }

  private setActiveFile(anchorId: string) {
    if (this.activeFileId === anchorId) return;
    this.activeFileId = anchorId;
    this.fileButtons.forEach((button, id) => {
      button.classList.toggle("active", id === anchorId);
    });
  }

  private updateActiveFileFromScroll() {
    if (this.fileEntries.length === 0) {
      this.setActiveFile("");
      return;
    }

    const rect = this.mainScrollTarget.getBoundingClientRect();
    const marker = this.mainScrollTarget.scrollTop + 120;

    let candidate = this.fileEntries[0];
    this.fileEntries.forEach((entry) => {
      const top =
        this.mainScrollTarget.scrollTop +
        entry.wrapper.getBoundingClientRect().top -
        rect.top;
      if (top <= marker) candidate = entry;
    });

    this.setActiveFile(candidate.anchorId);
  }

  private clearSelectionClasses() {
    this.selectionState.rows.forEach((row) => {
      row.classList.remove("towelie-comment-range", "towelie-comment-anchor");
    });
    this.selectionState.rows.clear();
  }

  private clearSelectionHighlight() {
    this.clearSelectionClasses();
    this.resetSelectionState();
  }

  private resetSelectionState() {
    this.selectionState.start = null;
    this.selectionState.end = null;
    this.selectionState.selecting = false;
    this.selectionState.dragMoved = false;
    this.selectionState.usedAnchor = false;
  }

  private updateSelectionHighlight() {
    this.clearSelectionClasses();
    const selection = this.currentSelection();
    if (!selection) return;

    this.findRowsForSelection(selection).forEach((row, index) => {
      row.classList.add("towelie-comment-range");
      if (index === 0) row.classList.add("towelie-comment-anchor");
      this.selectionState.rows.add(row);
    });
  }

  private currentSelection(): Selection | null {
    if (!this.selectionState.start || !this.selectionState.end) return null;
    if (
      this.selectionState.start.fileName !== this.selectionState.end.fileName ||
      this.selectionState.start.diffSide !== this.selectionState.end.diffSide
    ) {
      return null;
    }

    const startLine = Math.min(
      this.selectionState.start.lineNumber,
      this.selectionState.end.lineNumber,
    );
    const endLine = Math.max(
      this.selectionState.start.lineNumber,
      this.selectionState.end.lineNumber,
    );

    return {
      fileName: this.selectionState.start.fileName,
      diffSide: this.selectionState.start.diffSide,
      startLine,
      endLine,
    };
  }

  private buildContextFromCell(
    lineCell: HTMLElement,
    row: HTMLTableRowElement,
  ): LineContext | null {
    const lineNumber = Number(lineCell.textContent?.trim());
    if (Number.isNaN(lineNumber) || lineNumber <= 0) return null;

    const wrapper = lineCell.closest<HTMLElement>(".d2h-file-wrapper");
    const fileName = wrapper?.dataset.fileName;
    if (!fileName) return null;

    const sideContainer = lineCell.closest(".d2h-file-side-diff");
    let diffSide = DiffSide.New;

    const filesDiff = lineCell.closest(".d2h-files-diff");
    if (filesDiff && sideContainer) {
      const sides = Array.from(
        filesDiff.querySelectorAll(":scope > .d2h-file-side-diff"),
      );
      if (sides[0] === sideContainer) {
        diffSide = DiffSide.Old;
      } else if (sides.length > 1) {
        diffSide = DiffSide.New;
      }
    } else if (
      lineCell.classList.contains("d2h-old") ||
      row.classList.contains("d2h-del")
    ) {
      diffSide = DiffSide.Old;
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

  private getLineContext(target: EventTarget | null): LineContext | null {
    if (!(target instanceof HTMLElement)) return null;

    const lineCell =
      (target.closest("td.d2h-code-side-linenumber") as HTMLElement | null) ||
      (target.closest("td.d2h-code-linenumber") as HTMLElement | null) ||
      (target.closest("td.d2h-code-side-line")
        ?.previousElementSibling as HTMLElement | null) ||
      (target.closest("td.d2h-code-line")
        ?.previousElementSibling as HTMLElement | null);
    if (!lineCell) return null;

    const row = lineCell.closest("tr");
    if (!(row instanceof HTMLTableRowElement)) return null;
    return this.buildContextFromCell(lineCell, row);
  }

  private onMouseDown = (event: MouseEvent) => {
    const context = this.getLineContext(event.target);
    if (!context) return;

    if ((event.target as HTMLElement).closest(".towelie-comment-trigger")) {
      return;
    }

    const hasAnchor =
      Boolean(this.selectionState.start) &&
      !this.selectionState.selecting &&
      this.selectionState.start?.fileName === context.location.fileName &&
      this.selectionState.start?.diffSide === context.location.diffSide;

    this.closePanel();
    if (!hasAnchor) {
      this.selectionState.start = context.location;
    }
    this.selectionState.end = context.location;
    this.selectionState.selecting = true;
    this.selectionState.dragMoved = false;
    this.selectionState.usedAnchor = hasAnchor;
    this.updateSelectionHighlight();
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.selectionState.selecting || !this.selectionState.start) return;
    const context = this.getLineContext(event.target);
    if (!context) return;

    if (
      context.location.fileName !== this.selectionState.start.fileName ||
      context.location.diffSide !== this.selectionState.start.diffSide
    ) {
      return;
    }

    this.selectionState.end = context.location;
    this.selectionState.dragMoved =
      this.selectionState.dragMoved ||
      this.selectionState.start.lineNumber !== context.location.lineNumber;
    this.updateSelectionHighlight();
  };

  private onMouseUp = () => {
    if (!this.selectionState.selecting) return;
    this.selectionState.selecting = false;

    const selection = this.currentSelection();
    if (!selection) {
      this.clearSelectionHighlight();
      return;
    }

    if (!this.selectionState.dragMoved && !this.selectionState.usedAnchor) {
      this.selectionState.start = this.selectionState.end;
      this.updateSelectionHighlight();
      return;
    }

    const row = this.findRowsForSelection(selection)[0];
    if (!row) {
      this.clearSelectionHighlight();
      return;
    }

    this.openDraftPanel(row, selection);
    this.resetSelectionState();
  };

  private onMainScroll = () => {
    if (this.scrollTicking) return;
    this.scrollTicking = true;
    window.requestAnimationFrame(() => {
      this.scrollTicking = false;
      this.updateActiveFileFromScroll();
    });
  };
}
