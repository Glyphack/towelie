import { Controller } from "@hotwired/stimulus";
import { getChecks, type CheckStatus } from "../api";

export default class ChecksController extends Controller {
  static targets = ["status", "output"];

  declare readonly statusTarget: HTMLElement;
  declare readonly outputTarget: HTMLElement;

  connect() {
    this.refresh();
  }

  async refresh() {
    this.statusTarget.textContent = "loading…";
    this.statusTarget.className = "text-xs text-[var(--color-text-faint)]";
    this.outputTarget.textContent = "";

    try {
      const data = await getChecks();
      this.statusTarget.textContent = data.status;
      this.statusTarget.className = this.statusClasses(data.status);

      let output = "";
      if (data.checks.length > 0) {
        output = data.checks
          .map((check) => `${check.passed ? "✓" : "✗"} ${check.name}`)
          .join("\n");
      }

      if (data.error) {
        if (output) output += "\n\n─── Error Details ───\n";
        output += data.error;
      }

      this.outputTarget.textContent = output;
    } catch {
      this.statusTarget.textContent = "error";
      this.statusTarget.className = "text-xs text-[var(--color-del)]";
    }
  }

  async copyOutput(e: Event) {
    const btn = e.currentTarget as HTMLButtonElement;
    const output = this.outputTarget.textContent?.trim() ?? "";
    if (!output) {
      this.flashButton(btn, "No output", 1200);
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      this.flashButton(btn, "Copied!", 1200);
    } catch {
      this.flashButton(btn, "Copy failed", 1500);
    }
  }

  private statusClasses(status: CheckStatus): string {
    switch (status) {
      case "pass":
        return "text-xs text-[var(--color-add)]";
      case "fail":
        return "text-xs text-[var(--color-del)]";
      default:
        return "text-xs text-[var(--color-text-faint)]";
    }
  }

  private flashButton(btn: HTMLButtonElement, message: string, ms: number) {
    const originalText = btn.textContent || "";
    const wasDisabled = btn.disabled;
    btn.textContent = message;
    btn.disabled = true;
    window.setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = wasDisabled;
    }, ms);
  }
}
