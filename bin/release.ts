import { $ } from "bun";
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    version: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const v = values.version;

await $`uv version ${v}`;
await $`bun run build`;
await $`uv publish`;
