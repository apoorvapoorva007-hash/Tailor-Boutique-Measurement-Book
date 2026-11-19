"""
Unified Single-Link Runner for TAILOR & BOUTIQUE MEASUREMENT BOOK
Serves both the React Frontend and Django REST Backend from a single URL!
"""

import os
import sys
import subprocess
import webbrowser
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

def main():
    print("=" * 65)
    print("  ✂️  TAILOR & BOUTIQUE MEASUREMENT BOOK - UNIFIED RUNNER")
    print("=" * 65)

    # 1. Verify frontend dist exists
    if not os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
        print("\n[+] Building frontend React bundle...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        subprocess.run([npm_cmd, "--prefix", "frontend", "run", "build"], check=True)

    print("\n[✓] Frontend & Backend united on ONE link!")
    print("\n👉 OPEN YOUR BROWSER AT:")
    print("   http://127.0.0.1:8000")
    print("   (or http://localhost:8000)")
    print("\n[ℹ] Both the React Frontend and Django REST API are served together.")
    print("[ℹ] Press Ctrl+C in this terminal to stop the server.\n")

    # 2. Launch Django server
    manage_py = os.path.join(BASE_DIR, "backend", "manage.py")
    python_exe = sys.executable

    try:
        subprocess.run([python_exe, manage_py, "runserver", "127.0.0.1:8000"])
    except KeyboardInterrupt:
        print("\n[✓] Boutique server stopped cleanly.")

if __name__ == "__main__":
    main()
