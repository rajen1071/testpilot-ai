# TestPilot AI — Phase 1

## 1. Supabase
1. Create a free project at supabase.com.
2. SQL Editor → run `supabase/migrations/0001_phase1.sql`.
3. For quick local testing, Auth → Providers → Email → disable "Confirm email".
4. Copy from Settings → API: Project URL, `anon` key (frontend), `service_role` key (backend only).

## 2. Backend
```
cd backend && cp .env.example .env   # fill values
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload        # http://localhost:8000/docs
```
Or: `docker compose -f infrastructure/docker-compose.yml up --build`

## 3. Frontend
```
cd frontend && cp .env.example .env  # fill values (anon key only)
npm install && npm run dev           # http://localhost:5173
```

## Env vars
| Var | Where | Notes |
|---|---|---|
| SUPABASE_URL | backend | |
| SUPABASE_SERVICE_ROLE_KEY | backend | Never commit or expose |
| CORS_ORIGINS | backend | Comma-separated |
| VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY | frontend | Public values |
| VITE_API_URL | frontend | Backend base URL |
