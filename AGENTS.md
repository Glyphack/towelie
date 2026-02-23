## Commands

`uv run towelie --dev`: Runs the project and builds frontend. It runs in watch mode.

## Coding rules

The frontend code is in `./web` directory.
The backend serves html templates and have stimulus to manage javascript.
Do not edit `src/towelie/static/output.css` directly; edit `src/towelie/static/input.css` and run `bun run build`.
