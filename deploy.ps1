<#
.SYNOPSIS
  Shopperz Mart - Namecheap cPanel Deployment Builder
.DESCRIPTION
  Builds all 3 apps and packages into a single ZIP with the correct folder structure.
  Extract in ~/demoshop.isty.me/ and you are done.
.EXAMPLE
  .\deploy.ps1
#>

param(
  [string]$ApiDomain = "https://api-demoshop.isty.me",
  [string]$WebDomain = "https://demoshop.isty.me",
  [string]$AdminDomain = "https://admin-demoshop.isty.me",
  [switch]$SkipImages
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$DeployDir = Join-Path $Root "deploy"
$Stage = Join-Path $DeployDir "_stage"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SHOPPERZ MART - Production Build" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  API   : $ApiDomain" -ForegroundColor DarkGray
Write-Host "  Web   : $WebDomain" -ForegroundColor DarkGray
Write-Host "  Admin : $AdminDomain" -ForegroundColor DarkGray
Write-Host ""

# -- Step 0: Clean -------------------------------------------------------
Write-Host "[1/7] Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path $DeployDir) { Remove-Item $DeployDir -Recurse -Force }
New-Item -Path $Stage -ItemType Directory -Force | Out-Null

# -- Step 1: Build Backend -----------------------------------------------
Write-Host "[2/7] Building Backend (NestJS)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "backend")
cmd /c "npm run build 2>&1" | Out-Null
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Backend build failed!" }

$BackendDir = Join-Path $Stage "Backend"
New-Item -Path $BackendDir -ItemType Directory -Force | Out-Null
Copy-Item -Path "dist" -Destination $BackendDir -Recurse
Copy-Item -Path "package.json" -Destination $BackendDir
Copy-Item -Path "package-lock.json" -Destination $BackendDir
if (-not $SkipImages -and (Test-Path "public")) { Copy-Item -Path "public" -Destination $BackendDir -Recurse }

# NOTE: Do NOT include a .htaccess in Backend/ — Namecheap auto-generates
# the Passenger .htaccess when you create the Node.js app in cPanel.
# Our custom .htaccess would overwrite it and cause 503 errors.
Pop-Location
Write-Host "  + Backend/ ready" -ForegroundColor Green

# -- Step 2: Build Frontend ----------------------------------------------
Write-Host "[3/7] Building Frontend (React Web)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "Frontend")

# Set env vars directly (PowerShell .env.production has BOM encoding issues with Vite)
$env:VITE_API_URL = "$ApiDomain/api/v1/customer"

cmd /c "npm run build 2>&1" | Out-Null
if ($LASTEXITCODE -ne 0) { $env:VITE_API_URL = $null; Pop-Location; throw "Frontend build failed!" }
$env:VITE_API_URL = $null

# SPA .htaccess
@(
  '<IfModule mod_rewrite.c>'
  '  RewriteEngine On'
  '  RewriteBase /'
  '  RewriteRule ^index\.html$ - [L]'
  '  RewriteCond %{REQUEST_FILENAME} !-f'
  '  RewriteCond %{REQUEST_FILENAME} !-d'
  '  RewriteRule . /index.html [L]'
  '</IfModule>'
) -join "`n" | Set-Content -Path (Join-Path "dist" ".htaccess") -Encoding ASCII

$FrontendDir = Join-Path $Stage "Frontend"
Copy-Item -Path "dist" -Destination $FrontendDir -Recurse
Pop-Location
Write-Host "  + Frontend/ ready" -ForegroundColor Green

# -- Step 3: Build Admin --------------------------------------------------
Write-Host "[4/7] Building Admin Panel (React)..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "Admin")

# Set env vars directly (PowerShell .env.production has BOM encoding issues with Vite)
$env:VITE_API_URL = "$ApiDomain/api/v1/admin"
$env:VITE_UPLOADS_BASE = "$ApiDomain"

cmd /c "npm run build 2>&1" | Out-Null
if ($LASTEXITCODE -ne 0) { $env:VITE_API_URL = $null; $env:VITE_UPLOADS_BASE = $null; Pop-Location; throw "Admin build failed!" }
$env:VITE_API_URL = $null
$env:VITE_UPLOADS_BASE = $null

@(
  '<IfModule mod_rewrite.c>'
  '  RewriteEngine On'
  '  RewriteBase /'
  '  RewriteRule ^index\.html$ - [L]'
  '  RewriteCond %{REQUEST_FILENAME} !-f'
  '  RewriteCond %{REQUEST_FILENAME} !-d'
  '  RewriteRule . /index.html [L]'
  '</IfModule>'
) -join "`n" | Set-Content -Path (Join-Path "dist" ".htaccess") -Encoding ASCII

$AdminDir = Join-Path $Stage "Admin"
Copy-Item -Path "dist" -Destination $AdminDir -Recurse
Pop-Location
Write-Host "  + Admin/ ready" -ForegroundColor Green

# -- Step 4: Generate .env -----------------------------------------------
Write-Host "[5/7] Generating .env..." -ForegroundColor Yellow
@(
  "# =================================================="
  "# SHOPPERZ MART - Production Environment"
  "# =================================================="
  ""
  "# === Database (from cPanel PostgreSQL Databases) ==="
  "DATABASE_HOST=127.0.0.1"
  "DATABASE_PORT=5432"
  "DATABASE_USER=your_cpanel_dbuser"
  "DATABASE_PASSWORD=your_db_password"
  "DATABASE_NAME=your_cpanel_dbname"
  ""
  "# === Server ==="
  "API_PORT=3000"
  ""
  "# === CORS (comma-separated domains or * for all) ==="
  "CORS_ORIGINS=$WebDomain,$AdminDomain"
  ""
  "# === Admin Panel Auth ==="
  "ADMIN_EMAIL=admin@shopperzmart.com"
  "ADMIN_PASSWORD=CHANGE_ME_NOW"
  "ADMIN_JWT_SECRET=GENERATE_A_RANDOM_SECRET_HERE"
) -join "`n" | Set-Content -Path (Join-Path $Stage ".env") -Encoding UTF8
Write-Host "  + .env ready" -ForegroundColor Green

# -- Step 5: Generate root .htaccess -------------------------------------
Write-Host "[6/7] Generating root .htaccess..." -ForegroundColor Yellow
@(
  "# =================================================="
  "# Shopperz Mart - Root Security"
  "# =================================================="
  ""
  "# Deny access to .env file"
  '<Files ".env">'
  "  Require all denied"
  "</Files>"
  ""
  "# Deny access to hidden files (except .htaccess itself)"
  '<FilesMatch "^\.(?!htaccess)">'
  "  Require all denied"
  "</FilesMatch>"
  ""
  "# Force HTTPS"
  "<IfModule mod_rewrite.c>"
  "  RewriteEngine On"
  "  RewriteCond %{HTTPS} off"
  '  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]'
  "</IfModule>"
  ""
  "# Security headers"
  "<IfModule mod_headers.c>"
  '  Header always set X-Content-Type-Options "nosniff"'
  '  Header always set X-Frame-Options "SAMEORIGIN"'
  '  Header always set Referrer-Policy "strict-origin-when-cross-origin"'
  "</IfModule>"
) -join "`n" | Set-Content -Path (Join-Path $Stage ".htaccess") -Encoding ASCII
Write-Host "  + .htaccess ready" -ForegroundColor Green

# -- Step 6: Create single ZIP -------------------------------------------
Write-Host "[7/7] Packaging into single ZIP..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$ZipPath = Join-Path $DeployDir "demoshop.isty.me.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }

Push-Location $Stage
tar.exe -a -c -f $ZipPath *
Pop-Location

# Clean staging
for ($i = 0; $i -lt 5; $i++) {
  try { Remove-Item $Stage -Recurse -Force -ErrorAction Stop; break }
  catch { Start-Sleep -Seconds 2 }
}
Write-Host "  + demoshop.isty.me.zip created" -ForegroundColor Green

# -- Summary -------------------------------------------------------------
$zipSize = (Get-Item $ZipPath).Length
$sizeStr = if ($zipSize -gt 1MB) { "{0:N1} MB" -f ($zipSize / 1MB) } else { "{0:N0} KB" -f ($zipSize / 1KB) }

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  demoshop.isty.me.zip    $sizeStr" -ForegroundColor White
Write-Host ""
Write-Host "  Contents:" -ForegroundColor Yellow
Write-Host "  .env              (edit DB creds before uploading)" -ForegroundColor DarkGray
Write-Host "  .htaccess         (root security)" -ForegroundColor DarkGray
Write-Host "  Backend/          (api-demoshop.isty.me)" -ForegroundColor DarkGray
Write-Host "  Frontend/         (demoshop.isty.me)" -ForegroundColor DarkGray
Write-Host "  Admin/            (admin-demoshop.isty.me)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Upload -> Extract in ~/demoshop.isty.me/ -> Done!" -ForegroundColor Green
Write-Host ""
