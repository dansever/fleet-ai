# To run this file, run from apps/backend: .\start.ps1

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1
# Run uvicorn with module resolution on port 8001
py -m uvicorn app.main:app --reload --port 8001