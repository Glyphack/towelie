import argparse
import os
import subprocess
import sys
import threading
import time
import webbrowser
import socket
from pathlib import Path
import urllib.request


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = PROJECT_ROOT / "web"


def open_when_ready(port: int):
    url = f"http://localhost:{port}"
    while True:
        try:
            urllib.request.urlopen(url, timeout=1)
            break
        except Exception:
            time.sleep(0.2)
    webbrowser.open(url)

def find_available_port(start_port: int, host: str = "127.0.0.1", attempts: int = 50) -> int:
    for offset in range(attempts):
        port = start_port + offset
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return port
    raise RuntimeError(
        f"Unable to find an open port starting at {start_port} after {attempts} attempts."
    )


def check_git_repository():
    """Check if current directory is inside a git repository."""
    result = subprocess.run(
        ["git", "rev-parse", "--git-dir"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("Error: towelie only supports git repositories", file=sys.stderr)
        print("Please run towelie from within a git repository", file=sys.stderr)
        sys.exit(1)


def dev():
    check_git_repository()
    os.environ["TOWELIE_DEV"] = "1"
    import uvicorn

    static_dir = Path(__file__).resolve().parent / "static"

    print("Starting frontend & tailwind watchers...")
    esbuild = subprocess.Popen(["npm", "run", "watch"], cwd=PROJECT_ROOT)
    tailwind = subprocess.Popen(
        [
            "npx",
            "@tailwindcss/cli",
            "-i",
            str(static_dir / "input.css"),
            "-o",
            str(static_dir / "output.css"),
            "--watch",
        ],
        cwd=PROJECT_ROOT,
    )

    port = find_available_port(4242)
    print(f"\n  towelie → http://localhost:{port}\n")
    threading.Thread(target=open_when_ready, args=(port,), daemon=True).start()
    try:
        uvicorn.run("towelie.app:app", host="127.0.0.1", port=port, reload=True)
    finally:
        esbuild.terminate()
        tailwind.terminate()


def run():
    check_git_repository()
    import uvicorn

    port = find_available_port(4242)
    print(f"\n  towelie → http://localhost:{port}\n")
    threading.Thread(target=open_when_ready, args=(port,), daemon=True).start()
    uvicorn.run("towelie.app:app", host="127.0.0.1", port=port)


def main():
    parser = argparse.ArgumentParser(description="towelie - Local code review for AI agents")
    parser.add_argument("--dev", action="store_true", help="Run in development mode with npm and tailwind watchers")
    args = parser.parse_args()

    if args.dev:
        dev()
    else:
        run()


if __name__ == "__main__":
    main()
