# To run this file, run from apps/backend: .\start.ps1

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1
# Run uvicorn with module resolution
py -m uvicorn app.main:app --reload