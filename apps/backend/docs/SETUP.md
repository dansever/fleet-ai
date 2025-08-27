# FleetAI Backend Setup Guide

## Environment Variables Required

The backend requires the following environment variables to be set for document extraction to work:

### LlamaCloud Configuration

You need to create a `.env` file in the `backend/` directory with the following variables:

```env
# LlamaCloud API Configuration
# Get these from https://cloud.llamaindex.ai/
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key_here
LLAMA_EXTRACT_PROJECT_ID=your_project_id_here
LLAMA_ORGANIZATION_ID=your_organization_id_here
```

### How to Get LlamaCloud Credentials

1. Go to [LlamaCloud](https://cloud.llamaindex.ai/)
2. Sign up or log in to your account
3. Create a new project or use an existing one
4. Get your API key from the settings
5. Note your Project ID and Organization ID

## Setup Steps

1. **Create the .env file:**

   ```bash
   cd backend
   # Create .env file with your credentials
   ```

2. **Check environment variables:**

   ```bash
   python check_env.py
   ```

3. **Start the backend server:**

   ```bash
   # On Windows PowerShell:
   .\start.ps1

   # Or manually:
   $env:PYTHONPATH = "."
   . .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload
   ```

## Troubleshooting

### 500 Internal Server Error

If you get a 500 error when uploading files, check:

1. **Environment variables are set correctly**
2. **LlamaCloud API key is valid**
3. **Project ID and Organization ID are correct**
4. **Backend logs for specific error messages**

Run the environment checker to verify your setup:

```bash
python check_env.py
```

### CORS Errors

If you get CORS errors like "No 'Access-Control-Allow-Origin' header is present", check:

1. **Backend is running on the correct port** (default: 8000)
2. **Frontend is making requests to the correct URL** (must include `/api` prefix)
3. **CORS configuration is correct** in `config/cors.py`

Test backend accessibility:

```bash
python test_cors.py
```

### Common Issues

1. **Wrong API endpoint**: Frontend must include `/api` prefix in all requests
   - ✅ Correct: `http://localhost:8000/api/quotes/extract-from-file`
   - ✅ Frontend should use: `/api/quotes/extract-from-file`
   - ❌ Wrong: `/quotes/extract-from-file` (missing `/api` prefix)

2. **Backend not running**: Start the backend server first

   ```bash
   .\start.ps1
   ```

3. **Port conflicts**: Make sure port 8000 is available for the backend
