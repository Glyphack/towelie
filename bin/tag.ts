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

await $`git tag -a ${v} -m 0.1.1`;
await $`git push --tags`;
