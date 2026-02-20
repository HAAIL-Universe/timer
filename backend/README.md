# Timer Backend

Node.js/Express REST API for timer lifecycle management with SQLite persistence.

## Architecture

```
src/
├── index.js          # Entry point, server bootstrap
├── app.js            # Express app configuration (middleware, routes)
├── routes/
│   └── timers.js     # Timer route handlers
├── services/
│   └── timerService.js   # Business logic, elapsed time calculations
├── repositories/
│   └── timerRepository.js # SQLite data access layer
└── db/
    └── database.js   # Database connection and schema initialization
```

**Layer flow:** Routes → Services → Repositories → SQLite

- **Routes** — Parse HTTP requests, delegate to services, format responses.
- **Services** — Timer state management, elapsed time computation, validation.
- **Repositories** — Direct database queries via `better-sqlite3`.
- **Database** — Connection setup, table creation, schema enforcement.

## API Endpoints

### `GET /health`
Health check for readiness probes.

**Response:** `200 OK`
```json
{ "status": "ok" }
```

### `POST /timers`
Create a new timer in stopped state.

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "stopped",
  "elapsed_seconds": 0,
  "start_time": null
}
```

### `GET /timers/:id`
Get current timer state. Running timers include live elapsed calculation.

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "elapsed_seconds": 42,
  "start_time": "2024-01-15T10:30:00Z"
}
```

**Error:** `404 Not Found`
```json
{ "error": "Timer not found", "message": "No timer exists with id ..." }
```

### `POST /timers/:id/start`
Start a stopped timer. Idempotent if already running.

**Response:** `200 OK` — Timer object with `status: "running"`.

**Error:** `404 Not Found`

### `POST /timers/:id/stop`
Stop a running timer. Persists accumulated elapsed time. Idempotent if already stopped.

**Response:** `200 OK` — Timer object with `status: "stopped"`.

**Error:** `404 Not Found`

## Local Development

### Prerequisites
- Node.js 20.x LTS
- npm 10.x+

### Setup
```bash
cd backend
npm install
```

### Environment Variables
Create a `.env` file (optional):
```
PORT=3000
DB_PATH=./data/timer.db
```

### Run
```bash
npm start
```

Server starts at `http://localhost:3000`.

### Development Mode
```bash
npm run dev
```

## Testing

### Run Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

Coverage thresholds are configured in `jest.config.js`:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### Test Structure
```
tests/
├── unit/
│   ├── services/         # Service logic tests
│   └── repositories/     # Repository tests
└── integration/
    └── routes/           # HTTP endpoint tests (supertest)
```

## Docker

### Build
```bash
docker build -t timer-backend .
```

### Run
```bash
docker run -p 3000:3000 -v ./data:/app/data timer-backend
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20.x |
| Framework | Express 4.18.x |
| Database | SQLite 3 (better-sqlite3 9.x) |
| IDs | uuid 9.x |
| Testing | Jest 29.x, Supertest 6.x |
