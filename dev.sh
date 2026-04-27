#!/usr/bin/env bash
#
# Shopperz Mart — Local Development Script (Hybrid Mode)
# =======================================================
# Runs PostgreSQL in Docker, Backend + Frontend locally.
# All ports are read from root .env (single source of truth).
#
# Usage:  ./dev.sh                (start everything)
#         ./dev.sh --skip-db      (skip DB, just start servers)
#         ./dev.sh --backend-only (DB + backend only)
#         ./dev.sh --frontend-only(frontend only)
#

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SKIP_DB=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

# -- Parse arguments ---
for arg in "$@"; do
    case $arg in
        --skip-db)      SKIP_DB=true ;;
        --backend-only) BACKEND_ONLY=true ;;
        --frontend-only)FRONTEND_ONLY=true ;;
        -h|--help)
            echo "Usage: ./dev.sh [--skip-db] [--backend-only] [--frontend-only]"
            exit 0
            ;;
    esac
done

# -- Colors ---
info()    { echo -e "\033[36m[INFO]\033[0m  $1"; }
ok()      { echo -e "\033[32m[OK]\033[0m    $1"; }
warn()    { echo -e "\033[33m[WARN]\033[0m  $1"; }
err()     { echo -e "\033[31m[ERROR]\033[0m $1"; }

# -- Load .env ---
if [ -f "$ROOT/.env" ]; then
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        export "$key=$value"
    done < "$ROOT/.env"
    info "Loaded environment from .env"
else
    err ".env file not found at project root!"
    exit 1
fi

# -- Read ports from .env (single source of truth) ---
API_PORT="${API_PORT:-3000}"
WEB_PORT="${WEB_PORT:-3001}"
ADMIN_PORT="${ADMIN_PORT:-3002}"
DEV_DB_PORT="${DEV_DB_PORT:-5433}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASS="${DATABASE_PASSWORD:-password}"
DB_NAME="${DATABASE_NAME:-ecommerce}"

info "Ports: API=$API_PORT | Web=$WEB_PORT | Admin=$ADMIN_PORT | Dev DB=$DEV_DB_PORT"

# -- Track child PIDs for cleanup ---
PIDS=()

cleanup() {
    echo ""
    warn "Shutting down local servers..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null
        fi
    done
    ok "Local servers stopped."
    warn "PostgreSQL container is still running (use 'docker-compose down' to stop it)"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ================================================================
#  Step 0: Kill stale processes on API & Web ports
# ================================================================
info "Checking for stale processes on ports $API_PORT, $WEB_PORT, and $ADMIN_PORT..."

for port in $API_PORT $WEB_PORT $ADMIN_PORT; do
    pid=$(lsof -ti tcp:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        warn "Killing process (PID: $pid) on port $port"
        kill -9 $pid 2>/dev/null || true
    fi
done
ok "Ports $API_PORT and $WEB_PORT are free."

# ================================================================
#  Step 1: Start PostgreSQL in Docker
# ================================================================
if [ "$SKIP_DB" = false ] && [ "$FRONTEND_ONLY" = false ]; then
    info "Starting PostgreSQL in Docker (host port $DEV_DB_PORT)..."

    docker-compose -f "$ROOT/docker-compose.yml" -f "$ROOT/docker-compose.dev.yml" up db -d

    if [ $? -ne 0 ]; then
        err "Failed to start PostgreSQL container!"
        warn "Make sure Docker is running."
        exit 1
    fi

    # Wait for DB to be ready
    info "Waiting for PostgreSQL to be ready..."
    MAX_RETRIES=30
    for i in $(seq 1 $MAX_RETRIES); do
        if PGPASSWORD="$DB_PASS" pg_isready -h localhost -p "$DEV_DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
            ok "PostgreSQL is ready on localhost:$DEV_DB_PORT (Docker)"
            break
        fi
        if [ "$i" -eq "$MAX_RETRIES" ]; then
            err "PostgreSQL did not become ready in time."
            exit 1
        fi
        printf "."
        sleep 1
    done
    echo ""
elif [ "$SKIP_DB" = true ]; then
    warn "Skipping DB startup (--skip-db)"
else
    warn "Frontend-only mode, skipping DB"
fi

# ================================================================
#  Step 2: Start Backend (NestJS) locally
# ================================================================
if [ "$FRONTEND_ONLY" = false ]; then
    info "Starting NestJS Backend on http://localhost:$API_PORT ..."

    (
        cd "$ROOT/backend"
        DATABASE_HOST=localhost \
        DATABASE_PORT=$DEV_DB_PORT \
        DATABASE_USER=$DB_USER \
        DATABASE_PASSWORD=$DB_PASS \
        DATABASE_NAME=$DB_NAME \
        ADMIN_EMAIL="${ADMIN_EMAIL}" \
        ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
        ADMIN_JWT_SECRET="${ADMIN_JWT_SECRET}" \
        API_PORT=$API_PORT \
        npm run start:dev
    ) &
    PIDS+=($!)
    ok "Backend started (PID: ${PIDS[-1]})"
fi

# ================================================================
#  Step 3: Start Frontend (Vite) locally
# ================================================================
if [ "$BACKEND_ONLY" = false ]; then
    if [ "$FRONTEND_ONLY" = false ]; then
        info "Waiting 5s for backend to initialize..."
        sleep 5
    fi

    info "Starting Vite Frontend on http://localhost:$WEB_PORT ..."

    (cd "$ROOT/Frontend" && npm run dev) &
    PIDS+=($!)
    ok "Frontend started (PID: ${PIDS[-1]})"
fi

# ================================================================
#  Step 4: Start Admin (Vite) locally
# ================================================================
if [ "$BACKEND_ONLY" = false ]; then
    info "Starting Vite Admin Panel on http://localhost:$ADMIN_PORT ..."
    (cd "$ROOT/Admin" && npm run dev) &
    PIDS+=($!)
    ok "Admin started (PID: ${PIDS[-1]})"
fi

# ================================================================
#  Summary
# ================================================================
echo ""
echo -e "\033[35m============================================================\033[0m"
echo -e "\033[35m      Shopperz Mart — Local Development (Hybrid Mode)\033[0m"
echo -e "\033[35m============================================================\033[0m"
echo ""
if [ "$FRONTEND_ONLY" = false ]; then
    echo "   Database:      localhost:$DEV_DB_PORT/$DB_NAME (Docker)"
    echo "   API Server:    http://localhost:$API_PORT"
fi
if [ "$BACKEND_ONLY" = false ]; then
    echo "   Admin Panel:   http://localhost:$ADMIN_PORT"
    echo "   Web Frontend:  http://localhost:$WEB_PORT"
fi
echo ""
echo -e "\033[33m   Press Ctrl+C to stop all servers\033[0m"
echo "   (PostgreSQL container will keep running)"
echo ""
echo "   To stop DB:  docker-compose down"
echo "   Fresh DB:    docker-compose down -v && ./dev.sh"
echo -e "\033[35m============================================================\033[0m"
echo ""

# ================================================================
#  Keep alive — wait for child processes
# ================================================================
wait
