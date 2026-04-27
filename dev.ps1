<#
  Shopperz Mart - Local Development Script (Hybrid Mode)
  =======================================================
  Runs PostgreSQL in Docker, Backend + Storefront locally.
  All ports are read from root .env (single source of truth).

  Usage:  .\dev.ps1              (start everything)
          .\dev.ps1 -SkipDb      (skip DB, just start servers)
          .\dev.ps1 -BackendOnly (DB + backend only)
          .\dev.ps1 -StorefrontOnly(storefront only, assumes DB+backend running)
#>

param(
    [switch]$SkipDb,
    [switch]$BackendOnly,
    [switch]$StorefrontOnly
)

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

# -- Logging helpers ---
function Write-Info { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Wrn  { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err  { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# -- Load .env from root ---
$envFile = Join-Path $ROOT ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $idx = $line.IndexOf("=")
            $key = $line.Substring(0, $idx).Trim()
            $val = $line.Substring($idx + 1).Trim()
            [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
        }
    }
    Write-Info "Loaded environment from .env"
} else {
    Write-Err ".env file not found at project root!"
    exit 1
}

# -- Read ports from .env (single source of truth) ---
$API_PORT   = if ($env:API_PORT)    { $env:API_PORT }    else { "3000" }
$WEB_PORT   = if ($env:WEB_PORT)    { $env:WEB_PORT }    else { "3001" }
$ADMIN_PORT = if ($env:ADMIN_PORT)  { $env:ADMIN_PORT }  else { "3002" }
$DEV_DB_PORT= if ($env:DEV_DB_PORT) { $env:DEV_DB_PORT } else { "5433" }
$DB_USER    = if ($env:DATABASE_USER) { $env:DATABASE_USER } else { "postgres" }
$DB_PASS    = if ($env:DATABASE_PASSWORD) { $env:DATABASE_PASSWORD } else { "password" }
$DB_NAME    = if ($env:DATABASE_NAME) { $env:DATABASE_NAME } else { "ecommerce" }

Write-Info "Ports: API=$API_PORT | Web=$WEB_PORT | Admin=$ADMIN_PORT | Dev DB=$DEV_DB_PORT"

# ================================================================
#  Step 0: Kill stale processes on API & Web ports
# ================================================================
Write-Info "Checking for stale processes on ports $API_PORT, $WEB_PORT, and $ADMIN_PORT..."

foreach ($port in @($API_PORT, $WEB_PORT, $ADMIN_PORT)) {
    $connections = netstat -ano | Select-String "LISTENING" | Select-String ":$port "
    foreach ($conn in $connections) {
        if ($conn -match '\s(\d+)\s*$') {
            $procId = $Matches[1]
            if ($procId -ne "0") {
                $procName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
                Write-Wrn "Killing $procName (PID: $procId) on port $port"
                taskkill /PID $procId /T /F 2>$null | Out-Null
            }
        }
    }
}
Write-Ok "Ports $API_PORT and $WEB_PORT are free."

# ================================================================
#  Step 1: Start PostgreSQL in Docker (lightweight, ~50MB RAM)
# ================================================================
if (-not $SkipDb -and -not $StorefrontOnly) {
    Write-Info "Starting PostgreSQL in Docker (host port $DEV_DB_PORT)..."

    $composeArgs = "-f `"$ROOT\docker-compose.yml`" -f `"$ROOT\docker-compose.dev.yml`" up db -d"
    $composeResult = cmd /c "cd /d `"$ROOT`" && docker-compose $composeArgs 2>&1"
    Write-Host $composeResult

    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to start PostgreSQL container!"
        Write-Wrn "Make sure Docker Desktop is running."
        exit 1
    }

    # Wait for DB to be healthy
    Write-Info "Waiting for PostgreSQL to be ready..."
    $maxRetries = 30
    $ready = $false
    for ($i = 0; $i -lt $maxRetries; $i++) {
        Start-Sleep -Seconds 1
        $check = docker-compose -f "$ROOT\docker-compose.yml" -f "$ROOT\docker-compose.dev.yml" ps db 2>&1 | Out-String
        if ($check -match "healthy") {
            $ready = $true
            break
        }
        if ($check -match "running") {
            $env:PGPASSWORD = $DB_PASS
            $null = pg_isready -h localhost -p $DEV_DB_PORT 2>$null
            if ($LASTEXITCODE -eq 0) {
                $ready = $true
                $env:PGPASSWORD = $null
                break
            }
            $env:PGPASSWORD = $null
        }
        Write-Host "." -NoNewline
    }
    Write-Host ""

    if ($ready) {
        Write-Ok "PostgreSQL is ready on localhost:$DEV_DB_PORT (Docker)"
    } else {
        Write-Err "PostgreSQL did not become ready in time."
        exit 1
    }
} elseif ($SkipDb) {
    Write-Wrn "Skipping DB startup (-SkipDb)"
} else {
    Write-Wrn "Storefront-only mode, skipping DB"
}

# ================================================================
#  Step 2: Start Backend (NestJS) locally
# ================================================================
$backendProc = $null
$frontendProc = $null

if (-not $StorefrontOnly) {
    Write-Info "Starting NestJS Backend on http://localhost:$API_PORT ..."

    $envVars = @(
        "set DATABASE_HOST=localhost",
        "set DATABASE_PORT=$DEV_DB_PORT",
        "set DATABASE_USER=$DB_USER",
        "set DATABASE_PASSWORD=$DB_PASS",
        "set DATABASE_NAME=$DB_NAME",
        "set ADMIN_EMAIL=$($env:ADMIN_EMAIL)",
        "set ADMIN_PASSWORD=$($env:ADMIN_PASSWORD)",
        "set ADMIN_JWT_SECRET=$($env:ADMIN_JWT_SECRET)",
        "set API_PORT=$API_PORT"
    ) -join "&& "

    $backendCmd = "cd /d `"$ROOT\backend`" && $envVars&& npm run start:dev"
    $backendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $backendCmd -PassThru -NoNewWindow
    Write-Ok "Backend started (PID: $($backendProc.Id))"
}

# ================================================================
#  Step 3: Start Storefront (Vite) locally
# ================================================================
if (-not $BackendOnly) {
    if (-not $StorefrontOnly) {
        Write-Info "Waiting 5s for backend to initialize..."
        Start-Sleep -Seconds 5
    }

    Write-Info "Starting Vite Storefront on http://localhost:$WEB_PORT ..."

    $frontendCmd = "cd /d `"$ROOT\Storefront`" && npm run dev"
    $frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $frontendCmd -PassThru -NoNewWindow
    Write-Ok "Storefront started (PID: $($frontendProc.Id))"
}

# ================================================================
#  Step 4: Start Admin (Vite) locally
# ================================================================
$adminProc = $null
if (-not $BackendOnly) {
    Write-Info "Starting Vite Admin Panel on http://localhost:$ADMIN_PORT ..."

    $adminCmd = "cd /d `"$ROOT\Admin`" && npm run dev"
    $adminProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $adminCmd -PassThru -NoNewWindow
    Write-Ok "Admin started (PID: $($adminProc.Id))"
}

# ================================================================
#  Summary
# ================================================================
# -- Detect LAN IP for external access ---
$LAN_IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1).IPAddress
if (-not $LAN_IP) { $LAN_IP = "YOUR_LAN_IP" }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "      Shopperz Mart - Local Development (Hybrid Mode)"       -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
if (-not $StorefrontOnly) {
    Write-Host "   Database:      localhost:$DEV_DB_PORT/$DB_NAME (Docker)" -ForegroundColor DarkGray
    Write-Host "   API Server:    http://localhost:$API_PORT"              -ForegroundColor White
}
if (-not $BackendOnly) {
    Write-Host "   Admin Panel:   http://localhost:$ADMIN_PORT"            -ForegroundColor White
    Write-Host "   Web Storefront: http://localhost:$WEB_PORT"              -ForegroundColor White
}
Write-Host ""
Write-Host "   ----- External Access (LAN: $LAN_IP) -----"               -ForegroundColor Green
if (-not $StorefrontOnly) {
    Write-Host "   API Server:    http://${LAN_IP}:$API_PORT"             -ForegroundColor Green
}
if (-not $BackendOnly) {
    Write-Host "   Admin Panel:   http://${LAN_IP}:$ADMIN_PORT"           -ForegroundColor Green
    Write-Host "   Web Storefront: http://${LAN_IP}:$WEB_PORT"             -ForegroundColor Green
}
Write-Host ""
Write-Host "   Press Ctrl+C to stop all servers"                          -ForegroundColor Yellow
Write-Host "   (PostgreSQL container will keep running)"                  -ForegroundColor DarkGray
Write-Host ""
Write-Host "   To stop DB:  docker-compose down"                          -ForegroundColor DarkGray
Write-Host "   Fresh DB:    docker-compose down -v && run dev.bat again"  -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# ================================================================
#  Keep alive — wait for processes, cleanup on exit
# ================================================================
try {
    while ($true) {
        if ($backendProc -and $backendProc.HasExited) {
            Write-Wrn "Backend process exited (code: $($backendProc.ExitCode))"
            break
        }
        if ($frontendProc -and $frontendProc.HasExited) {
            Write-Wrn "Storefront process exited (code: $($frontendProc.ExitCode))"
            break
        }
        if ($adminProc -and $adminProc.HasExited) {
            Write-Wrn "Admin process exited (code: $($adminProc.ExitCode))"
            break
        }
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Info "Shutting down..."
} finally {
    Write-Host ""
    Write-Wrn "Stopping local servers..."

    foreach ($proc in @($backendProc, $frontendProc, $adminProc)) {
        if ($proc -and -not $proc.HasExited) {
            $null = taskkill /PID $proc.Id /T /F 2>&1
        }
    }

    Write-Ok "Local servers stopped."
    Write-Wrn "PostgreSQL container is still running (use 'docker-compose down' to stop it)"
}
