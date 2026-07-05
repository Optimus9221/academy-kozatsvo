# Apply Prisma schema to Neon (production) from your PC.
# Usage:
#   .\scripts\deploy-db.ps1
#   .\scripts\deploy-db.ps1 -Seed

param(
  [switch]$Seed
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not $env:DATABASE_URL) {
  $env:DATABASE_URL = Read-Host "Paste Neon DATABASE_URL (pooled connection)"
}

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is required"
}

Write-Host "Pushing schema..."
npm run db:deploy

if ($Seed) {
  Write-Host "Seeding (demo data)..."
  npm run db:seed
  Write-Host "Change default passwords: npm run db:change-password -- admin@academy.ua YOUR_PASSWORD"
}

Write-Host "Done."
