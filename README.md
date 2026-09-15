# School Management System (SMS)

Full-stack school management: React + TypeScript frontend, FastAPI + SQLAlchemy 2.0 + PostgreSQL backend.

## Structure

```
backend/    FastAPI API (see backend/README.md)
frontend/   React + TS + Vite (Tailwind, Router, Query, Hook Form, Zod)
```

## Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 16+

## Quick Start (Git Bash)

### 1. Clone the repo

```bash
git clone <repo-url>
cd School-Management-System
```

### 2. Database

```bash
psql -U shakibalarman -d postgres -c "CREATE DATABASE sms_db;"
```

### 3. Backend

```bash
cd backend
cp .env.example .env
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
alembic revision --autogenerate -m "init"
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Login

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@school.com   | Admin123! |

> Admin creates student & teacher accounts from the dashboard.

## API Docs

- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Readiness: http://localhost:8000/ready

## Modules

Auth/RBAC, Students, Teachers, Guardians, Academic structure (year -> class -> section, subjects),
Attendance, Exams & Results (auto grade/GPA/position), Fees, Reports (report card).
