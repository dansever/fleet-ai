# Google Cloud SDK

## Authenticate with a user identity which authorizes gcloud to access Google Cloud Platform.

gcloud auth login

## List all credentialed accounts.

gcloud auth list
To run a python script - PYTHONPATH=. python backend/agents/....

## Start FastAPI server in root folder:

🟩 PowerShell:
cd backend
.\start.ps1

## Clean pycache folders

git-bash on Windows:
Get-ChildItem -Recurse -Filter **pycache** | Remove-Item -Recurse -Force

Powershell:
Get-ChildItem -Recurse -Directory -Filter "**pycache**" | Remove-Item -Recurse -Force
