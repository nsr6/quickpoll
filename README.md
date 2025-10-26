# QuickPoll - Real-time opinion polling platform

Polling app built on Next.js frontend and FastAPI backend. 

Live demo: https://quickpoll-seven.vercel.app/

---

## System design & architecture

 - Frontend: `frontend/` — Next.js (app router). Serves UI, connects to backend over HTTPS for REST and a WebSocket connection for live updates. The UI uses Tailwind CSS for styling and shadcn/ui-based components for common UI patterns.
- Backend: `backend/` — FastAPI app using `sqlmodel` for data models. Exposes REST endpoints and a `/ws` WebSocket endpoint for broadcasting poll updates.
- Database: PostgreSQL in production (recommended). The backend falls back to SQLite locally. The DB connection is controlled by the `DATABASE_URL` environment variable.
- Hosting (recommended):
  - Frontend on Vercel (Next.js optimized)
  - Backend on Render (Docker or native service) with a managed PostgreSQL instance
- Data flow:
  1. User creates/edits/votes on a poll in the Next.js UI.
  2. Frontend calls the backend REST API (e.g., `POST /polls`, `GET /polls`).
  3. Backend updates the DB and broadcasts events to connected WebSocket clients via `/ws` so UIs stay in sync.

Key endpoints
- `GET /polls` — list polls
- `POST /polls` — create a poll (returns token for owner-only actions)
- `POST /polls/{poll_id}/vote` — vote on an option
- `POST /polls/{poll_id}/like` — like a poll
- `PUT /polls/{poll_id}` — edit poll (requires token)
- `DELETE /polls/{poll_id}?token=...` — delete poll (requires token)
- WebSocket: `/ws` — clients connect for realtime events

Security notes
- Poll ownership is controlled by a token returned when a poll is created. Store this token securely (frontend stores it in localStorage in the current implementation).
- CORS must be configured on the backend to allow your frontend origin (Vercel URL) and local dev origin when developing.

---

## Run locally (Windows PowerShell)

Prerequisites
- Node.js (16+ recommended)
- Python 3.9+ and `pip`
- Git

1) Backend (Python)

Open a terminal, then:

```powershell
# from repo root
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

# Option A: run with uvicorn (development)
$env:DATABASE_URL = "sqlite:///./polls.db"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option B: run with Docker (if you prefer)
# docker build -t quickpoll-backend .
# docker run -p 8000:80 -e DATABASE_URL="sqlite:///./polls.db" quickpoll-backend
```

Notes:
- The backend `db.py` will use `DATABASE_URL` if provided; otherwise it falls back to SQLite `./polls.db`.
- For local development you can keep SQLite, but for deployed runs (Render) use a proper PostgreSQL `DATABASE_URL`.

2) Frontend (Next.js)

Open a separate terminal and run:

```powershell
cd frontend
npm install
# local dev server
npm run dev
```

Then open `http://localhost:3000` in your browser.

Environment variables for frontend development
- Create `frontend/.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

(If your backend runs on a different host/port, change accordingly.)

---

## Environment variables

Backend (`backend` service on Render):
- `DATABASE_URL` — PostgreSQL connection string (required in prod)
- `FRONTEND_URL` — allowed origin(s) for CORS

Frontend (Vercel):
- `NEXT_PUBLIC_API_URL` — e.g. `https://your-backend.onrender.com`
- `NEXT_PUBLIC_WS_URL` — e.g. `wss://your-backend.onrender.com/ws`

Local frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
- `NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws`


---

## Research & resources

Libraries, platforms and docs used while building/deploying:
- FastAPI — https://fastapi.tiangolo.com/
- Uvicorn — https://www.uvicorn.org/
- SQLModel — https://sqlmodel.tiangolo.com/
- Next.js — https://nextjs.org/
- Tailwind CSS — https://tailwindcss.com/
- shadcn/ui — https://ui.shadcn.com/
- Vercel docs — https://vercel.com/docs
- Render docs — https://render.com/docs
- PostgreSQL — https://www.postgresql.org/
