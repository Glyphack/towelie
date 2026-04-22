import asyncio
import argparse
import contextlib
import os
import signal
import socket
import subprocess
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = PROJECT_ROOT / "web"


def stop_process(proc: subprocess.Popen):
    if proc.poll() is not None:
        return
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        with contextlib.suppress(ProcessLookupError):
            os.killpg(proc.pid, signal.SIGKILL)


def open_when_ready(port: int):
    url = f"http://localhost:{port}"
    while True:
        try:
            urllib.request.urlopen(url, timeout=1)
            break
        except Exception:
            time.sleep(0.2)
    webbrowser.open(url)


def find_available_port(
    start_port: int, host: str = "127.0.0.1", attempts: int = 50
) -> int:
    for offset in range(attempts):
        port = start_port + offset
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return port
    msg = (
        f"Unable to find an open port starting at {start_port}"
        f" after {attempts} attempts."
    )
    raise RuntimeError(msg)


def dev():
    os.environ["TOWELIE_DEV"] = "1"
    import uvicorn

    print("Starting frontend watchers...")
    frontend_watch = subprocess.Popen(
        ["bun", "run", "watch"], cwd=PROJECT_ROOT, start_new_session=True
    )

    port = find_available_port(4242)
    print(f"\n  towelie → http://localhost:{port}\n")
    threading.Thread(target=open_when_ready, args=(port,), daemon=True).start()
    try:
        uvicorn.run("towelie.api:app", host="127.0.0.1", port=port, reload=True)
    finally:
        stop_process(frontend_watch)


def run():
    import uvicorn

    port = find_available_port(4242)
    print(f"\n  towelie → http://localhost:{port}\n")
    threading.Thread(target=open_when_ready, args=(port,), daemon=True).start()
    uvicorn.run("towelie.api:app", host="127.0.0.1", port=port)


def main():
    parser = argparse.ArgumentParser(
        description="towelie - Local code review for AI agents"
    )
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Run in development mode with Bun and Tailwind watchers",
    )
    parser.add_argument(
        "--tui",
        action="store_true",
        help="Run in TUI mode (terminal UI)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Open the debug panel by default in TUI mode",
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=None,
        help="Path to git repository (defaults to current directory)",
    )
    args = parser.parse_args()

    if args.path:
        os.environ["TOWELIE_GIT_PATH"] = str(Path(args.path).resolve())

    if args.tui:
        from towelie.tui.app import run_tui

        asyncio.run(run_tui())
    elif args.dev:
        dev()
    else:
        run()


if __name__ == "__main__":
    main()
