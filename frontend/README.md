# SMS Frontend (React + TypeScript + Vite)

## Setup (Git Bash)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env -> set VITE_API_URL (default: http://localhost:8000/api/v1)

# Start dev server
npm run dev
```

Frontend runs at http://localhost:5173

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod

## Project Structure

```
src/
  auth/           # AuthContext, ProtectedRoute
  pages/          # Login, Dashboard, Modules
  lib/            # API client (axios)
```

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```
