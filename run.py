#!/usr/bin/env python3
"""Antigravity Personal Intelligence & Opportunities Platform - Universal Runner.
Cross-platform runner for macOS, Linux, and Windows.

Usage:
    python run.py               # Run both Server & Client concurrently (Default)
    python run.py all           # Run both Server & Client concurrently
    python run.py server        # Run FastAPI Backend only (port 5000)
    python run.py client        # Run Next.js Frontend only (port 3000)
    python run.py test          # Run pytest backend test suite
    python run.py seed          # Seed 53+ sources and news into SQLite database
    python run.py sync          # Trigger live news ingestion pipeline
    python run.py build         # Build Next.js client production bundle
    python run.py doctor        # Check system health, database, and ports
"""
from __future__ import annotations

import argparse
import os
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
SERVER_DIR = ROOT_DIR / "server"
CLIENT_DIR = ROOT_DIR / "client"

# Locate Python in virtualenv or system
VENV_PYTHON = SERVER_DIR / "venv" / "bin" / "python3"
if not VENV_PYTHON.exists():
    VENV_PYTHON = SERVER_DIR / "venv" / "Scripts" / "python.exe"  # Windows
if not VENV_PYTHON.exists():
    VENV_PYTHON = Path(sys.executable)

# ANSI Colors
CYAN = "\033[0;36m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
RED = "\033[0;31m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


def print_banner():
    print(f"{CYAN}======================================================================{RESET}")
    print(f"{CYAN}{BOLD}     ANTIGRAVITY INTELLIGENCE & OPPORTUNITIES PLATFORM RUNNER        {RESET}")
    print(f"{CYAN}======================================================================{RESET}")
    print(f"{DIM}Root Directory: {ROOT_DIR}{RESET}\n")


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def ensure_env_file():
    env_file = ROOT_DIR / ".env"
    env_example = ROOT_DIR / ".env.example"
    if not env_file.exists() and env_example.exists():
        print(f"{YELLOW}Notice: .env not found. Copying from .env.example...{RESET}")
        env_file.write_text(env_example.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"{GREEN}✔ Created default .env{RESET}")


def run_doctor():
    print_banner()
    print(f"{BOLD}🔍 Running System Health Probe...{RESET}\n")

    # 1. Python check
    print(f"  Python Runtime:      {GREEN}✔ {VENV_PYTHON} ({sys.version.split()[0]}){RESET}")

    # 2. Node & npm check
    try:
        node_v = subprocess.check_output(["node", "--version"], text=True).strip()
        npm_v = subprocess.check_output(["npm", "--version"], text=True).strip()
        print(f"  Node.js & npm:       {GREEN}✔ Node {node_v} • npm {npm_v}{RESET}")
    except Exception:
        print(f"  Node.js & npm:       {RED}✖ Node.js or npm missing in PATH{RESET}")

    # 3. Database check
    db_file = ROOT_DIR / "platform.db"
    if db_file.exists():
        import sqlite3

        try:
            conn = sqlite3.connect(str(db_file))
            src_count = conn.execute("SELECT COUNT(*) FROM sources").fetchone()[0]
            art_count = conn.execute("SELECT COUNT(*) FROM articles").fetchone()[0]
            conn.close()
            size_mb = db_file.stat().st_size / (1024 * 1024)
            print(f"  Database (SQLite):   {GREEN}✔ platform.db ({size_mb:.2f} MB) • {src_count} Sources • {art_count} Articles{RESET}")
        except Exception as e:
            print(f"  Database (SQLite):   {YELLOW}▲ Database present but error reading: {e}{RESET}")
    else:
        print(f"  Database (SQLite):   {YELLOW}▲ platform.db not created yet. Run 'python run.py seed'{RESET}")

    # 4. Port checks
    p5000 = is_port_in_use(5000)
    p3000 = is_port_in_use(3000)
    print(f"  Port 5000 (Backend): {'🟡 In use' if p5000 else GREEN + '✔ Available' + RESET}")
    print(f"  Port 3000 (Client):  {'🟡 In use' if p3000 else GREEN + '✔ Available' + RESET}")
    print(f"\n{GREEN}✔ Doctor diagnostics completed.{RESET}")


def run_server():
    print_banner()
    ensure_env_file()
    print(f"{CYAN}🚀 Starting FastAPI Backend Service...{RESET}")
    print(f"  URL:  {BOLD}http://127.0.0.1:5000{RESET}")
    print(f"  Docs: {BOLD}http://127.0.0.1:5000/docs{RESET}\n")

    env = os.environ.copy()
    env["PYTHONPATH"] = "server"
    cmd = [str(VENV_PYTHON), "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "5000", "--reload"]
    try:
        subprocess.run(cmd, cwd=str(ROOT_DIR), env=env)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Backend server stopped.{RESET}")


def run_client():
    print_banner()
    print(f"{CYAN}💻 Starting Next.js Frontend Application...{RESET}")
    print(f"  URL:  {BOLD}http://localhost:3000{RESET}\n")
    try:
        subprocess.run(["npm", "run", "dev"], cwd=str(CLIENT_DIR))
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Frontend dev server stopped.{RESET}")


def run_test():
    print_banner()
    print(f"{CYAN}🧪 Executing Backend Pytest Suite...{RESET}\n")
    env = os.environ.copy()
    env["PYTHONPATH"] = "server"
    cmd = [str(VENV_PYTHON), "-m", "pytest", "server/tests", "-v"]
    res = subprocess.run(cmd, cwd=str(ROOT_DIR), env=env)
    sys.exit(res.returncode)


def run_seed():
    print_banner()
    print(f"{CYAN}🌱 Seeding 53+ Verified Sources and Growth News Articles...{RESET}\n")
    env = os.environ.copy()
    env["PYTHONPATH"] = "server"
    subprocess.run([str(VENV_PYTHON), "server/scripts/seed_expanded_sources.py"], cwd=str(ROOT_DIR), env=env, check=True)
    subprocess.run([str(VENV_PYTHON), "server/scripts/seed_expanded_news.py"], cwd=str(ROOT_DIR), env=env, check=True)
    print(f"\n{GREEN}✔ Database seeding completed successfully!{RESET}")


def run_sync():
    print_banner()
    print(f"{CYAN}⚡ Running Live News Ingestion Pipeline across verified feeds...{RESET}\n")
    sync_script = """
import asyncio
from app.database.session import async_session_maker
from app.ingestion.pipeline import IngestionPipeline

async def main():
    async with async_session_maker() as db:
        pipeline = IngestionPipeline()
        print('Starting parallel RSS & Web ingestion...')
        res = await pipeline.run_all_sources(db=db, max_items_per_source=3)
        print(f'Done! Processed {res.get("sources_processed")} sources, added {res.get("total_new_articles")} new articles.')

asyncio.run(main())
"""
    env = os.environ.copy()
    env["PYTHONPATH"] = "server"
    subprocess.run([str(VENV_PYTHON), "-c", sync_script], cwd=str(ROOT_DIR), env=env, check=True)
    print(f"\n{GREEN}✔ Ingestion sync completed.{RESET}")


def run_build():
    print_banner()
    print(f"{CYAN}📦 Building Next.js Client Production Bundle...{RESET}\n")
    res = subprocess.run(["npm", "run", "build"], cwd=str(CLIENT_DIR))
    sys.exit(res.returncode)


def run_all():
    print_banner()
    ensure_env_file()

    print(f"{GREEN}Starting Unified Application Stack:{RESET}")
    print(f"  {BOLD}▶ Backend API:{RESET}     http://127.0.0.1:5000")
    print(f"  {BOLD}▶ API Docs:{RESET}        http://127.0.0.1:5000/docs")
    print(f"  {BOLD}▶ Frontend UI:{RESET}     http://localhost:3000\n")
    print(f"{DIM}Press Ctrl+C to terminate both services cleanly.{RESET}")
    print("----------------------------------------------------------------------")

    env = os.environ.copy()
    env["PYTHONPATH"] = "server"

    backend_cmd = [str(VENV_PYTHON), "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "5000", "--reload"]
    frontend_cmd = ["npm", "run", "dev"]

    processes = []
    try:
        # Start Backend
        proc_backend = subprocess.Popen(backend_cmd, cwd=str(ROOT_DIR), env=env)
        processes.append(proc_backend)

        # Give backend a moment to bind port
        time.sleep(1.0)

        # Start Frontend
        proc_frontend = subprocess.Popen(frontend_cmd, cwd=str(CLIENT_DIR))
        processes.append(proc_frontend)

        while True:
            for p in processes:
                code = p.poll()
                if code is not None:
                    # One process terminated unexpectedly
                    raise KeyboardInterrupt
            time.sleep(0.5)

    except KeyboardInterrupt:
        print(f"\n{YELLOW}🛑 Shutting down application services...{RESET}")
        for p in processes:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass
        print(f"{GREEN}✔ All services stopped.{RESET}")


def main():
    parser = argparse.ArgumentParser(
        description="Unified Runner for Personal Intelligence & Opportunities Platform",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "module",
        nargs="?",
        default="all",
        choices=["all", "server", "backend", "client", "frontend", "test", "seed", "sync", "build", "doctor", "status", "health"],
        help="""Module or task to execute:
  all (default) : Start both Backend (5000) and Frontend (3000)
  server        : Start FastAPI backend only (http://127.0.0.1:5000)
  client        : Start Next.js frontend only (http://localhost:3000)
  test          : Run backend pytest test suite
  seed          : Seed 53+ sources and news into SQLite database
  sync          : Trigger live news ingestion pipeline
  build         : Build Next.js production bundle
  doctor        : Inspect database, open ports, and dependencies
""",
    )

    args = parser.parse_args()
    m = args.module.lower()

    if m in ["all"]:
        run_all()
    elif m in ["server", "backend"]:
        run_server()
    elif m in ["client", "frontend"]:
        run_client()
    elif m in ["test"]:
        run_test()
    elif m in ["seed"]:
        run_seed()
    elif m in ["sync"]:
        run_sync()
    elif m in ["build"]:
        run_build()
    elif m in ["doctor", "status", "health"]:
        run_doctor()


if __name__ == "__main__":
    main()
