import { Controller } from "@hotwired/stimulus";
import { getOptions, updateOptions } from "../api";
import { type AppOptions, type DiffStyle } from "../options";

export default class OptionsController extends Controller {
  static targets = ["promptTemplate", "diffStyle", "status", "saveButton"];

  declare readonly promptTemplateTarget: HTMLTextAreaElement;
  declare readonly diffStyleTarget: HTMLSelectElement;
  declare readonly statusTarget: HTMLElement;
  declare readonly saveButtonTarget: HTMLButtonElement;

  async connect() {
    const options = await getOptions();
    this.promptTemplateTarget.value = options.prompt.template;
    this.diffStyleTarget.value = options.diff.style;
  }

  async save(event: Event) {
    event.preventDefault();

    this.saveButtonTarget.disabled = true;
    this.setStatus("Saving...", "text-sm text-[var(--color-text-dim)]");

    const payload: AppOptions = {
      prompt: {
        template: this.promptTemplateTarget.value,
      },
      diff: {
        style: this.diffStyleTarget.value as DiffStyle,
      },
    };

    try {
      const saved = await updateOptions(payload);
      this.promptTemplateTarget.value = saved.prompt.template;
      this.diffStyleTarget.value = saved.diff.style;

      const tag = document.getElementById("towelie-options-data");
      if (tag) {
        tag.textContent = JSON.stringify(saved);
      }

      this.setStatus("Saved", "text-sm text-[var(--color-add)]");
    } catch {
      this.setStatus("Failed to save options", "text-sm text-[var(--color-del)]");
    } finally {
      this.saveButtonTarget.disabled = false;
    }
  }

  private setStatus(text: string, classes: string) {
    this.statusTarget.textContent = text;
    this.statusTarget.className = classes;
  }
}
