# School Management System (SMS)

Full-stack school management: React + TypeScript frontend, FastAPI + SQLAlchemy 2.0 + PostgreSQL backend.

## Structure

```
backend/    FastAPI API (see backend/README.md)
frontend/   React + TS + Vite (Tailwind, Router, Query, Hook Form, Zod)
```

## Quick start

1. **Database** — create `sms_db` in local PostgreSQL (user `shakibalarman`):
   ```powershell
   psql -U shakibalarman -d postgres -c "CREATE DATABASE sms_db;"
   ```
2. **Backend**:
   ```powershell
   cd backend
   Copy-Item .env.example .env   # fill in DB password + JWT secret
   python -m venv .venv; .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   alembic revision --autogenerate -m "init"
   alembic upgrade head
   python seed.py
   uvicorn app.main:app --reload --port 8000
   ```
3. **Frontend**:
   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

## Deployment note

Frontend → Vercel. The FastAPI backend needs a persistent Python host (not Vercel serverless);
point `VITE_API_URL` at the deployed API and set `BACKEND_CORS_ORIGINS` accordingly.
Database → managed PostgreSQL via `DATABASE_URL`.

## Modules (per spec, no additions/removals)

Auth/RBAC, Students, Teachers, Guardians, Academic structure (year → class → section, subjects),
Attendance, Exams & Results (auto grade/GPA/position), Fees, Reports (report card).
