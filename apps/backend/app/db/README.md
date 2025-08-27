# 🔄 Generate SQLAlchemy Models from PostgreSQL

Use `sqlacodegen` to auto-generate SQLAlchemy models from your Postgres DB (populated via Drizzle).

---

## ✅ Steps

1. **Install dependencies**
   ```bash
   pip install sqlacodegen python-dotenv
   ```

````

2. **Make sure your `.env` contains**

   ```
   DATABASE_URL=postgres://user:pass@localhost:5432/dbname
   ```

3. **Run one of the following**:

   * **Linux/macOS/WSL**

     ```bash
        dbUrl=$(grep '^DATABASE_URL=' apps/backend/.env | sed 's/^DATABASE_URL=//' | sed 's/^postgres:/postgresql:/')
        sqlacodegen "$dbUrl" --generator declarative --outfile apps/backend/app/db/models_auto.py
     ```

   * **Windows PowerShell**

    ```powershell
      1) # read from backend folder that contains .env
      $envLine = Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' }
      if (-not $envLine) { throw "DATABASE_URL not found in .env" }

      2) # sanitize: strip key, quotes, spaces, then ensure correct driver prefix
      $dbUrl = ($envLine -replace '^DATABASE_URL=', '' -replace '^"|"$', '').Trim()
      $dbUrl = $dbUrl -replace '^postgres:', 'postgresql+psycopg:'   # v3 driver

      3) # Test
      Write-Host "Using DB URL: $dbUrl"

      4) # make sure target folder exists
      if (-not (Test-Path app/db)) { New-Item -ItemType Directory -Path app/db | Out-Null }

      5) # generate
      sqlacodegen "$dbUrl" --generator declarative --outfile app/db/models_auto.py
     ```

   * **Cross-platform (recommended)**

     ```bash
     python scripts/generate_models.py
     ```

4. **Models are saved to:**

   ```
   backend/db/models_auto.py
   ```

---

## ⚠️ Notes

* Don’t manually edit `models_auto.py`
* Re-run the command after DB schema changes
* Ensure your DB is migrated before generating
````
