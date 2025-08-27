#!/usr/bin/env bash
echo "Cleaning __pycache__ folders (Git Bash)..."

find . -type d -name "__pycache__" -exec rm -rf {} +

echo "Cleanup complete."
