#!/usr/bin/env bash
# ==============================================================================
# Antigravity Personal Intelligence & Opportunities Platform - Unified Runner
# ==============================================================================
# Usage:
#   ./run.sh                  # Run both Server & Client concurrently (Default)
#   ./run.sh all              # Run both Server & Client concurrently
#   ./run.sh server           # Run FastAPI Backend only (port 5000)
#   ./run.sh client           # Run Next.js Frontend only (port 3000)
#   ./run.sh test             # Run backend test suite (pytest)
#   ./run.sh seed             # Seed 53+ sources and news articles
#   ./run.sh sync             # Trigger live feed ingestion pipeline
#   ./run.sh build            # Build Next.js frontend production bundle
#   ./run.sh doctor           # Check dependencies, database, and ports health
#   ./run.sh help             # Show this help menu
# ==============================================================================

set -euo pipefail

# ANSI Color Codes
CYAN='\033[0;36m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT_DIR}"

# Locate Python Virtualenv
if [ -f "${ROOT_DIR}/server/venv/bin/python3" ]; then
    PYTHON_BIN="${ROOT_DIR}/server/venv/bin/python3"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
else
    echo -e "${RED}Error: Python 3 was not found.${NC}" >&2
    exit 1
fi

print_banner() {
    echo -e "${CYAN}======================================================================${NC}"
    echo -e "${CYAN}${BOLD}     ANTIGRAVITY INTELLIGENCE & OPPORTUNITIES PLATFORM RUNNER        ${NC}"
    echo -e "${CYAN}======================================================================${NC}"
    echo -e "${DIM}Root Directory: ${ROOT_DIR}${NC}"
    echo ""
}

show_help() {
    print_banner
    echo -e "${BOLD}COMMANDS & INDIVIDUAL MODULES:${NC}"
    echo -e "  ${GREEN}./run.sh${NC} or ${GREEN}./run.sh all${NC}     Run full stack: Backend (5000) + Frontend (3000)"
    echo -e "  ${GREEN}./run.sh server${NC}           Run FastAPI Backend service only (http://127.0.0.1:5000)"
    echo -e "  ${GREEN}./run.sh client${NC}           Run Next.js Frontend UI only (http://localhost:3000)"
    echo -e "  ${GREEN}./run.sh test${NC}             Run backend pytest test suite (27 passing tests)"
    echo -e "  ${GREEN}./run.sh seed${NC}             Seed 53+ sources and verified news into SQLite database"
    echo -e "  ${GREEN}./run.sh sync${NC}             Trigger live web & RSS news ingestion pipeline"
    echo -e "  ${GREEN}./run.sh build${NC}            Build Next.js client production bundle with Turbopack"
    echo -e "  ${GREEN}./run.sh doctor${NC}           Inspect database health, open ports, and dependencies"
    echo -e "  ${GREEN}./run.sh help${NC}             Show this help screen"
    echo ""
}

check_env() {
    if [ ! -f "${ROOT_DIR}/.env" ]; then
        if [ -f "${ROOT_DIR}/.env.example" ]; then
            echo -e "${YELLOW}Notice: .env not found. Creating from .env.example...${NC}"
            cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
            echo -e "${GREEN}✔ Created default .env${NC}"
        fi
    fi
}

run_doctor() {
    print_banner
    echo -e "${BOLD}🔍 Running System Health Probe...${NC}"
    echo ""

    # 1. Python check
    echo -ne "  Python Runtime:      "
    if [ -x "${PYTHON_BIN}" ]; then
        PY_VER=$("${PYTHON_BIN}" --version 2>&1)
        echo -e "${GREEN}✔ ${PY_VER} (${PYTHON_BIN})${NC}"
    else
        echo -e "${RED}✖ Missing Python${NC}"
    fi

    # 2. Node & npm check
    echo -ne "  Node.js & npm:       "
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        NODE_VER=$(node --version)
        NPM_VER=$(npm --version)
        echo -e "${GREEN}✔ Node ${NODE_VER} • npm ${NPM_VER}${NC}"
    else
        echo -e "${RED}✖ Node.js or npm missing${NC}"
    fi

    # 3. Database check
    echo -ne "  Database (SQLite):   "
    if [ -f "${ROOT_DIR}/platform.db" ]; then
        DB_SIZE=$(du -h "${ROOT_DIR}/platform.db" | awk '{print $1}')
        SRC_COUNT=$("${PYTHON_BIN}" -c "import sqlite3; c = sqlite3.connect('platform.db'); print(c.execute('SELECT COUNT(*) FROM sources').fetchone()[0])" 2>/dev/null || echo "0")
        ART_COUNT=$("${PYTHON_BIN}" -c "import sqlite3; c = sqlite3.connect('platform.db'); print(c.execute('SELECT COUNT(*) FROM articles').fetchone()[0])" 2>/dev/null || echo "0")
        echo -e "${GREEN}✔ platform.db (${DB_SIZE}) • ${SRC_COUNT} Sources • ${ART_COUNT} Articles${NC}"
    else
        echo -e "${YELLOW}▲ platform.db not created yet. Run './run.sh seed' to initialize.${NC}"
    fi

    # 4. Port checks
    echo -ne "  Port 5000 (Backend): "
    if lsof -i :5000 >/dev/null 2>&1; then
        PID_5000=$(lsof -t -i :5000 | head -n 1)
        echo -e "${YELLOW}▲ Port 5000 is currently occupied (PID: ${PID_5000})${NC}"
    else
        echo -e "${GREEN}✔ Available${NC}"
    fi

    echo -ne "  Port 3000 (Client):  "
    if lsof -i :3000 >/dev/null 2>&1; then
        PID_3000=$(lsof -t -i :3000 | head -n 1)
        echo -e "${YELLOW}▲ Port 3000 is currently occupied (PID: ${PID_3000})${NC}"
    else
        echo -e "${GREEN}✔ Available${NC}"
    fi

    echo ""
    echo -e "${GREEN}✔ Doctor diagnostics completed.${NC}"
}

run_server() {
    print_banner
    check_env
    echo -e "${CYAN}🚀 Starting FastAPI Backend Service...${NC}"
    echo -e "  URL:  ${BOLD}http://127.0.0.1:5000${NC}"
    echo -e "  Docs: ${BOLD}http://127.0.0.1:5000/docs${NC}"
    echo ""
    cd "${ROOT_DIR}"
    export PYTHONPATH=server
    exec "${PYTHON_BIN}" -m uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
}

run_client() {
    print_banner
    echo -e "${CYAN}💻 Starting Next.js Frontend Application...${NC}"
    echo -e "  URL:  ${BOLD}http://localhost:3000${NC}"
    echo ""
    cd "${ROOT_DIR}/client"
    exec npm run dev
}

run_test() {
    print_banner
    echo -e "${CYAN}🧪 Executing Backend Pytest Suite...${NC}"
    echo ""
    cd "${ROOT_DIR}"
    export PYTHONPATH=server
    exec "${PYTHON_BIN}" -m pytest server/tests -v
}

run_seed() {
    print_banner
    echo -e "${CYAN}🌱 Seeding 53+ Verified Sources and Growth News Articles...${NC}"
    echo ""
    cd "${ROOT_DIR}"
    export PYTHONPATH=server
    "${PYTHON_BIN}" server/scripts/seed_expanded_sources.py
    "${PYTHON_BIN}" server/scripts/seed_expanded_news.py
    echo ""
    echo -e "${GREEN}✔ Database seeding completed successfully!${NC}"
}

run_sync() {
    print_banner
    echo -e "${CYAN}⚡ Running Live News Ingestion Pipeline across verified feeds...${NC}"
    echo ""
    cd "${ROOT_DIR}"
    export PYTHONPATH=server
    "${PYTHON_BIN}" -c "
import asyncio
from app.database.session import async_session_maker
from app.ingestion.pipeline import IngestionPipeline

async def main():
    async with async_session_maker() as db:
        pipeline = IngestionPipeline()
        print('Starting parallel RSS & Web ingestion...')
        res = await pipeline.run_all_sources(db=db, max_items_per_source=3)
        print(f'Done! Processed {res.get(\"sources_processed\")} sources, added {res.get(\"total_new_articles\")} new articles.')

asyncio.run(main())
"
    echo -e "${GREEN}✔ Live ingestion sync completed.${NC}"
}

run_build() {
    print_banner
    echo -e "${CYAN}📦 Building Next.js Client Production Bundle...${NC}"
    echo ""
    cd "${ROOT_DIR}/client"
    exec npm run build
}

run_all() {
    print_banner
    check_env

    # Check and release ports if already held by previous background instances
    for port in 5000 3000; do
        if lsof -i :$port >/dev/null 2>&1; then
            OCCUPANT=$(lsof -t -i :$port | tr '\n' ' ')
            echo -e "${YELLOW}Warning: Port ${port} is currently in use (PID: ${OCCUPANT}). Cleaning up...${NC}"
            kill -9 ${OCCUPANT} 2>/dev/null || true
            sleep 0.5
        fi
    done

    echo -e "${GREEN}Starting Unified Application Stack:${NC}"
    echo -e "  ${BOLD}▶ Backend API:${NC}     http://127.0.0.1:5000"
    echo -e "  ${BOLD}▶ API Docs:${NC}        http://127.0.0.1:5000/docs"
    echo -e "  ${BOLD}▶ Frontend UI:${NC}     http://localhost:3000"
    echo ""
    echo -e "${DIM}Press Ctrl+C to terminate both services cleanly.${NC}"
    echo "----------------------------------------------------------------------"

    # Process cleanup trap
    BACKEND_PID=""
    CLIENT_PID=""

    cleanup() {
        echo ""
        echo -e "${YELLOW}🛑 Shutting down application services...${NC}"
        if [ -n "${BACKEND_PID}" ] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
            kill -TERM "${BACKEND_PID}" 2>/dev/null || true
        fi
        if [ -n "${CLIENT_PID}" ] && kill -0 "${CLIENT_PID}" 2>/dev/null; then
            kill -TERM "${CLIENT_PID}" 2>/dev/null || true
        fi
        # Extra safeguard
        pkill -P $$ 2>/dev/null || true
        echo -e "${GREEN}✔ All services stopped.${NC}"
        exit 0
    }

    trap cleanup SIGINT SIGTERM EXIT

    # Start Backend
    (
        cd "${ROOT_DIR}"
        export PYTHONPATH=server
        "${PYTHON_BIN}" -m uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload 2>&1 | sed -e "s/^/${CYAN}[Backend] ${NC}/"
    ) &
    BACKEND_PID=$!

    # Start Frontend
    (
        cd "${ROOT_DIR}/client"
        npm run dev 2>&1 | sed -e "s/^/${GREEN}[Client]  ${NC}/"
    ) &
    CLIENT_PID=$!

    # Wait for either process to exit
    wait -n "${BACKEND_PID}" "${CLIENT_PID}" 2>/dev/null || true
}

# ------------------------------------------------------------------------------
# Argument Dispatcher
# ------------------------------------------------------------------------------
ACTION="${1:-all}"

case "${ACTION}" in
    all|"")
        run_all
        ;;
    server|backend|api)
        run_server
        ;;
    client|frontend|ui)
        run_client
        ;;
    test|tests|pytest)
        run_test
        ;;
    seed)
        run_seed
        ;;
    sync|ingest)
        run_sync
        ;;
    build)
        run_build
        ;;
    doctor|status|health)
        run_doctor
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: ${ACTION}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
