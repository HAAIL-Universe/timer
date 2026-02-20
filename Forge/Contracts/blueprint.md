# Timer – Project Blueprint

## Product Intent

Timer is a minimal web-based timing application that provides reliable start, stop, and elapsed-time tracking. It targets a general audience who need straightforward, no-frills timing functionality without complexity. The product focuses on a single core capability: accurate time measurement with intuitive controls. Built as a proof-of-concept to demonstrate clean architecture in a tightly scoped two-phase delivery (backend API + frontend UI).

## Core Invariants

1. **Time accuracy**: Elapsed time must be calculated server-side to ensure consistency and reliability across client refreshes or reconnections.
2. **Single-session semantics**: Each timer instance operates independently; no user authentication or multi-user state management in MVP.
3. **RESTful state transitions**: Timer state (stopped, running, elapsed) is managed through explicit API endpoints; no implicit state changes.
4. **Idempotent operations**: Repeated start or stop commands on the same timer state are safe and return current state without error.
5. **Stateless API design**: Each request carries sufficient context (timer ID) to operate independently; no server-side session dependencies beyond timer records.

## MVP Scope

### In Scope (2-phase build)

**Phase 1 – Backend API**
- `POST /timers` – Create a new timer (returns timer ID, initialized to stopped, 0 elapsed)
- `POST /timers/:id/start` – Start the timer (records start timestamp)
- `POST /timers/:id/stop` – Stop the timer (calculates and persists elapsed time)
- `GET /timers/:id` – Retrieve current timer state (status: stopped|running, elapsed seconds, start time if running)
- In-memory or lightweight persistent storage (SQLite) for timer records

**Phase 2 – Frontend UI**
- Single-page interface displaying one active timer
- Start/Stop button (single toggle control)
- Elapsed time display (formatted as MM:SS or HH:MM:SS)
- Client-side polling or periodic refresh to update elapsed time when running
- Basic responsive layout, minimal styling

### Explicitly Not In Scope

- Multiple concurrent timers per user
- Pause/resume functionality (only start and stop)
- User authentication or accounts
- Timer history, logs, or analytics
- Lap times or split tracking
- Countdown timer mode
- Persistent storage of completed timers beyond current session
- Mobile native apps
- Real-time WebSocket updates
- Timer labels or naming

## Layer Boundaries

**Routes (HTTP Entry)**
- Parse HTTP requests (path, params, body)
- Validate timer ID format
- Delegate to service layer
- Return JSON responses with appropriate status codes

**Services (Business Logic)**
- Enforce timer state transitions (stopped ↔ running)
- Calculate elapsed time on stop or retrieval
- Coordinate repository calls
- Apply core invariants (idempotency, accuracy)

**Repositories (Data Access)**
- CRUD operations for timer entities
- Abstract storage implementation (in-memory or SQLite)
- Return domain objects (Timer with id, status, start_time, elapsed)

**Domain Models**
- `Timer`: id (string/UUID), status (enum: stopped|running), start_time (timestamp or null), elapsed_seconds (integer)

## Deployment

- **Local Development**: Docker Compose with backend service (Node.js/Python/Go) and frontend served statically or via dev server
- **Configuration**: Environment variables for port, database path (if SQLite)
- **Health Check**: `GET /health` endpoint returning 200 OK
- **Container Strategy**: Single-stage Dockerfile per service (backend, frontend), minimal base images
- **No External Dependencies**: No third-party APIs, authentication providers, or cloud services required for MVP

## Success Criteria

- User can create a timer, start it, see elapsed time increment, and stop it within 2 minutes of first run
- Backend returns accurate elapsed time on stop (within 1-second precision)
- Frontend updates elapsed display at least once per second when timer is running
- Full stack runs locally via `docker-compose up` with no manual setup