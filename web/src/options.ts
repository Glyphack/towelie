export type DiffStyle = "inline" | "two_sides";
export type CommentOutputMode = "line_numbers" | "selected_lines";

export interface AppOptions {
  prompt: {
    template: string;
    comment_output_mode: CommentOutputMode;
  };
  diff: {
    style: DiffStyle;
  };
}
