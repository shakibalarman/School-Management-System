# SMS Backend (FastAPI)

## Setup (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env -> set DATABASE_URL password + JWT_SECRET_KEY
# Create database once:
#   psql -U shakibalarman -d postgres -c "CREATE DATABASE sms_db;"
alembic revision --autogenerate -m "init"
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

Health: `GET /health`, readiness incl. DB: `GET /ready`.
API docs: `http://localhost:8000/docs`.
```

Frontend dev server (`http://localhost:5173`) is allow-listed via `BACKEND_CORS_ORIGINS`.
