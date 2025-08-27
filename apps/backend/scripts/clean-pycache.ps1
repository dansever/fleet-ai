# Remove all __pycache__ directories recursively from the current directory
Write-Host "Cleaning __pycache__ folders (PowerShell)..."

Get-ChildItem -Recurse -Directory -Filter "__pycache__" | ForEach-Object {
    Write-Host "Removing:" $_.FullName
    Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Cleanup complete."
