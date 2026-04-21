# Towelie

Local code review tool. Fast and easy.
You can add comments and export the comments for your coding agent.

## Install

Install [uv](https://docs.astral.sh/uv/getting-started/installation/).

```bash
uvx towelie
```

This starts a local server at `http://localhost:4242` and opens it in your browser.

> [!NOTE]
> There's also a nightly version that has the latest changes. It probably has bugs
> `uvx --from git+https://github.com/glyphack/towelie.git@nightly towelie`

## Why Use Towelie?

If you like to review code changes locally and not use Github.
Another use case of local review tool is with AI agents.
I like having an agent working on a task while for itself, do the testing and come back with the complete code.
Once that is done, I use Towelie to review the generated code. This is much faster than pushing to Github.

Then I submit my review and give the review to AI agent to go over list of comments.
This way I can be nit picky with how I like stuff to be done and I can iterate over the code faster.

## Development

```bash
uv run towelie --dev
```

This runs:
- FastAPI with backend auto-reload
- Bun frontend watcher for `bundle.js`
- Tailwind watcher for `output.css`

Browser reload is manual in dev mode, but every refresh will pick up the latest built JS/CSS.
