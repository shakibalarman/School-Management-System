# SMS Backend (FastAPI)

## Setup (Git Bash)

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env -> set DATABASE_URL password + JWT_SECRET_KEY

# Create database (one-time)
psql -U shakibalarman -d postgres -c "CREATE DATABASE sms_db;"

# Run migrations
alembic revision --autogenerate -m "init"
alembic upgrade head

# Seed admin user + academic data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

## Default Admin Credentials

| Email            | Password  |
|------------------|-----------|
| admin@school.com | Admin123! |

## Endpoints

| Route     | Description                     |
|-----------|---------------------------------|
| `/health` | Health check                    |
| `/ready`  | Health check incl. DB           |
| `/docs`   | Swagger UI                      |
| `/api/v1/auth/login`    | POST login (email + password) |
| `/api/v1/auth/me`       | GET current user (requires Bearer token) |
| `/api/v1/users`         | POST create user (admin only) |

## RBAC

- **admin** — full access, can create student/teacher accounts
- **teacher** — attendance, exams, marks
- **student** — own attendance, results
- **guardian** — child attendance, fees

## Tech Stack

- FastAPI 0.141
- SQLAlchemy 2.0
- Alembic (migrations)
- psycopg 3 (PostgreSQL driver)
- Pydantic v2 (validation)
- PyJWT + bcrypt (auth)
