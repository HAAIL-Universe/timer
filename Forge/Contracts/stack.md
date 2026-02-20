# Timer – Technology Stack

## Overview

Timer is a lightweight two-phase proof-of-concept delivering a RESTful backend API and a minimal frontend interface. The stack prioritizes simplicity, fast iteration, and single-machine Docker Compose deployment. No authentication, no complex state management, no external services.

---

## Backend

### Language & Runtime
- **Node.js**: v20.x LTS
- **Reason**: Fast startup, excellent for I/O-bound REST APIs, minimal boilerplate for JSON handling, rich ecosystem for testing and development.

### Framework
- **Express.js**: v4.18.x
- **Reason**: Lightweight, unopinionated HTTP routing; ideal for small RESTful APIs with explicit route handlers.

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `express` | 4.18.x | HTTP server and routing |
| `uuid` | 9.x | Generate unique timer IDs |
| `better-sqlite3` | 9.x | Synchronous SQLite driver (simple, embedded persistence) |
| `cors` | 2.8.x | Enable cross-origin requests from frontend |
| `dotenv` | 16.x | Load environment variables from `.env` |
| `morgan` | 1.10.x | HTTP request logging (development) |

### Testing (Development)
- **jest**: 29.x (unit tests for services and repositories)
- **supertest**: 6.x (integration tests for HTTP endpoints)

---

## Database

### Engine
- **SQLite**: 3.x (via `better-sqlite3`)

### Schema
Single table: `timers`

```sql
CREATE TABLE timers (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('stopped', 'running')),
  start_time INTEGER,  -- Unix timestamp in milliseconds, NULL when stopped
  elapsed_seconds INTEGER NOT NULL DEFAULT 0
);
```

### Rationale
- **Embedded**: No separate database service; single file on disk.
- **Sufficient scale**: Proof-of-concept with single-session semantics; handles hundreds of timer records easily.
- **Simple schema**: Four columns, no joins, no migrations required for MVP.

---

## Frontend

### Framework
- **React**: 18.x
- **Reason**: Component-based, declarative UI; minimal learning curve for timer display and controls.

### Build Tool
- **Vite**: 5.x
- **Reason**: Fast dev server, instant HMR, optimized production builds with zero configuration.

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `react` | 18.x | UI component library |
| `react-dom` | 18.x | React rendering for web |
| `axios` | 1.6.x | HTTP client for backend API calls |

### Styling
- **Plain CSS**: No framework (minimal styling for MVP).
- **Reason**: Single-page UI with ~5 elements (timer display, start/stop button); CSS Grid/Flexbox sufficient.

---

## Deployment

### Containerization
- **Docker**: 24.x+
- **Docker Compose**: v2.x

### Architecture
Two services, single `docker-compose.yml`:

**Service: `backend`**
- Base image: `node:20-alpine`
- Working directory: `/app`
- Ports: `3000:3000` (configurable via `BACKEND_PORT`)
- Volume: `./data:/app/data` (persist SQLite database)
- Health check: `GET /health` (returns `200 OK`)

**Service: `frontend`**
- Base image: `node:20-alpine` (build stage), `nginx:alpine` (serve stage)
- Multi-stage build:
  1. Build React app with Vite (`npm run build`)
  2. Copy `/dist` to `nginx:alpine` and serve on port 80
- Ports: `8080:80` (configurable via `FRONTEND_PORT`)
- Nginx config: Proxy `/api/*` requests to backend service

### Networking
- **Internal Docker network**: `backend` and `frontend` services communicate via service names (`http://backend:3000`).
- **External access**: Host machine exposes frontend on `http://localhost:8080`.

### Persistence
- **SQLite database**: Mounted at `./data/timers.db` on host, persists across container restarts.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | HTTP server port | No | `3000` |
| `NODE_ENV` | Environment mode (`development` \| `production`) | No | `development` |
| `DB_PATH` | Path to SQLite database file | No | `./data/timers.db` |
| `CORS_ORIGIN` | Allowed CORS origin (frontend URL) | No | `http://localhost:8080` |
| `LOG_LEVEL` | Logging verbosity (`info` \| `debug` \| `error`) | No | `info` |

### Frontend (`frontend/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | No | `http://localhost:3000` |

### Docker Compose (`.env` at project root)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BACKEND_PORT` | Host port for backend service | No | `3000` |
| `FRONTEND_PORT` | Host port for frontend service | No | `8080` |

---

## Development Workflow

### Local Development (without Docker)
1. **Backend**: `cd backend && npm install && npm run dev` (uses `nodemon` for hot reload)
2. **Frontend**: `cd frontend && npm install && npm run dev` (Vite dev server on port 5173)
3. **Database**: Auto-created at `backend/data/timers.db` on first run

### Docker Compose (production-like)
1. `docker-compose up --build`
2. Access frontend at `http://localhost:8080`
3. Backend health check: `curl http://localhost:3000/health`

### Testing
- **Backend**: `cd backend && npm test` (Jest + Supertest)
- **Frontend**: Manual testing (no automated tests in MVP)

---

## Dependency Versions (Lock Files)

- **Backend**: `package-lock.json` committed (npm 10.x)
- **Frontend**: `package-lock.json` committed (npm 10.x)

---

## Security Considerations (MVP Scope)

- **No authentication**: Public API, no user accounts.
- **Input validation**: Timer ID format validated (UUID v4); invalid IDs return 400.
- **SQL injection**: Mitigated by parameterized queries (`better-sqlite3` prepared statements).
- **CORS**: Restricted to frontend origin (`CORS_ORIGIN` env var).
- **Rate limiting**: Not implemented in MVP (add `express-rate-limit` if needed).

---

## Monitoring & Observability

- **Logging**: `morgan` middleware logs all HTTP requests in `combined` format.
- **Health endpoint**: `GET /health` returns `{"status": "ok", "timestamp": <unix_ms>}`.
- **Error handling**: Global error handler returns JSON `{"error": "message"}` with appropriate status codes (400, 404, 500).

---

## Future Considerations (Post-MVP)

- **Database migration**: Switch to PostgreSQL if multi-user or persistence requirements grow.
- **Real-time updates**: Add WebSocket support (Socket.io) to push timer updates instead of polling.
- **Horizontal scaling**: Replace SQLite with shared database (PostgreSQL + connection pooling).
- **Frontend state management**: Introduce Zustand or React Context if complexity increases.
- **CI/CD**: Add GitHub Actions for automated testing and Docker image builds.