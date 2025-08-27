# Automatically generate models from the database
# Run this script from the root of the backend directory
# .\scripts\generate-models.ps1

$envLine = Get-Content ../.env | Where-Object { $_ -match '^DATABASE_URL=' }
if (-not $envLine) { throw "DATABASE_URL not found in ../.env" }

$dbUrl = ($envLine -replace '^DATABASE_URL=', '' -replace '^"|"$', '').Trim()
$dbUrl = $dbUrl -replace '^postgres:', 'postgresql+psycopg:'

Write-Host "Using DB URL: $dbUrl"

if (-not (Test-Path ../app/db)) { New-Item -ItemType Directory -Path ../app/db | Out-Null }

sqlacodegen "$dbUrl" --generator declarative --outfile ../app/db/models_auto.py
