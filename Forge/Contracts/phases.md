# Timer – Phases Contract

## Phase 0 — Backend Scaffold

**Objective**

Build the complete backend API from scratch, including project scaffold, database schema, all REST endpoints, and configuration required for the timer service to operate independently and respond to all client requests.

**Deliverables**

- Project scaffold with dependency management (package.json/requirements.txt/go.mod as appropriate)
- Application entry point and HTTP server configuration
- Database connection setup and configuration (SQLite or in-memory)
- Database schema and migrations:
  - `timers` table with columns: `id` (UUID primary key), `status` (enum/string: stopped|running), `elapsed_seconds` (integer, default 0), `start_time` (timestamp, nullable)
- Timer domain model mapping database records to domain objects
- Repository layer implementing:
  - Create timer (insert new record with stopped status, 0 elapsed)
  - Find timer by ID (query single record)
  - Update timer state (modify status, start_time, elapsed_seconds)
- Service layer implementing business logic:
  - Timer creation with UUID generation
  - Start timer (transition to running, record start_time, idempotent)
  - Stop timer (calculate elapsed time delta, add to elapsed_seconds, clear start_time, transition to stopped, idempotent)
  - Get timer state (retrieve record, calculate current elapsed if running)
- HTTP routes and handlers:
  - `GET /health` – returns `{"status": "ok"}`
  - `POST /timers` – create new timer, return 201 with timer JSON
  - `GET /timers/:id` – retrieve timer state, return 200 with timer JSON or 404
  - `POST /timers/:id/start` – start timer, return 200 with updated timer JSON or 404
  - `POST /timers/:id/stop` – stop timer, return 200 with updated timer JSON or 404
- Error handling middleware (404 for unknown timers, 500 for server errors)
- JSON request/response serialization
- CORS headers for local frontend development
- Environment variable configuration (PORT, DATABASE_PATH)
- Dockerfile for backend service
- Boot/setup script or command documenting how to run migrations and start server
- Basic logging (startup, request logging, errors)

**Schema Coverage**

- `timers` table: `id`, `status`, `elapsed_seconds`, `start_time`
- All columns required for timer lifecycle (create, start, stop, retrieve)

**Exit Criteria**

- `docker build` completes successfully for backend image
- Backend container starts and listens on configured port
- `GET /health` returns 200 with `{"status": "ok"}`
- `POST /timers` returns 201 with valid timer object (stopped, 0 elapsed, null start_time)
- `GET /timers/:id` returns 200 with correct timer state for existing timer
- `GET /timers/:id` returns 404 for non-existent timer
- `POST /timers/:id/start` transitions timer to running, sets start_time
- `POST /timers/:id/start` on already-running timer is idempotent (returns current state)
- `POST /timers/:id/stop` transitions timer to stopped, calculates and persists elapsed_seconds
- `POST /timers/:id/stop` on already-stopped timer is idempotent
- `GET /timers/:id` for running timer returns elapsed_seconds calculated from start_time to current time
- All endpoints return proper JSON content-type headers
- Database persists timer state across server restarts (if using SQLite)

---

## Phase 1 — Frontend & Ship

**Objective**

Build the complete frontend web application from scratch with all UI components, integrate with backend API, style the interface, and deliver comprehensive documentation enabling users to run the full timer application locally.

**Deliverables**

- Frontend project scaffold (HTML/CSS/JS or React/Vue/Svelte as appropriate)
- Dependency management and build configuration
- Single-page application structure:
  - Main timer view/page
  - Timer display component showing elapsed time formatted as HH:MM:SS or MM:SS
  - Start/Stop button (single toggle control)
  - Visual indication of timer state (running vs stopped)
- API integration layer:
  - HTTP client configuration pointing to backend service
  - Function to create new timer (`POST /timers`)
  - Function to start timer (`POST /timers/:id/start`)
  - Function to stop timer (`POST /timers/:id/stop`)
  - Function to fetch timer state (`GET /timers/:id`)
- Application initialization flow:
  - On load, create a new timer via API or restore existing timer ID from local storage
  - Fetch initial timer state
- Timer state management:
  - Track current timer ID, status, and elapsed seconds in application state
  - Handle start button click → call start API, update UI state
  - Handle stop button click → call stop API, update UI state
- Real-time elapsed time updates:
  - Poll backend (`GET /timers/:id`) every 1 second when timer is running
  - Update display with current elapsed_seconds from server response
- Time formatting utility:
  - Convert elapsed seconds to human-readable format (e.g., 125 seconds → "02:05")
- Styling and layout:
  - Responsive design working on desktop and mobile viewports
  - Centered timer display with clear typography
  - Distinct button states (start vs stop appearance)
  - Minimal, clean aesthetic consistent with "no-frills" product intent
- Error handling:
  - Display user-friendly message if backend is unreachable
  - Handle 404 errors (timer not found) gracefully
- Dockerfile for frontend service (static file server or dev server)
- docker-compose.yml orchestrating both backend and frontend services
- Comprehensive README.md including:
  - Project name and description ("Timer - A simple, straightforward timer application")
  - Features list (start/stop timer, display elapsed time, basic timer controls)
  - Tech stack documentation (backend framework/language, frontend framework, database)
  - Architecture overview (RESTful API, client-server model)
  - Setup and installation instructions:
    - Prerequisites (Docker, Docker Compose)
    - Clone repository command
    - Environment variables (if any)
    - `docker-compose up` command to start services
  - Usage instructions:
    - How to access the application (http://localhost:PORT)
    - How to use the timer (click start, observe elapsed time, click stop)
  - API endpoint documentation (brief overview with examples)
  - Development notes (how to run backend/frontend separately, ports)
  - Project structure overview

**Schema Coverage**

- No new schema changes; frontend consumes existing `timers` table via API

**Exit Criteria**

- `docker build` completes successfully for frontend image
- `docker-compose up` starts both backend and frontend services without errors
- Frontend accessible at configured URL (e.g., http://localhost:3000)
- UI displays timer with initial state (stopped, 00:00)
- Clicking "Start" button:
  - Calls backend start API successfully
  - Button label changes to "Stop"
  - Elapsed time display begins incrementing every second
- Elapsed time display updates accurately (within 1-second precision) while running
- Clicking "Stop" button:
  - Calls backend stop API successfully
  - Button label changes to "Start"
  - Elapsed time display stops incrementing
  - Displayed time matches elapsed_seconds returned by backend
- Timer state persists across page refreshes (via local storage or by querying same timer ID)
- UI is responsive and usable on mobile viewport (320px width minimum)
- README.md is complete, well-formatted, and contains all required sections
- A new user can clone repo, run `docker-compose up`, and successfully use the timer within 2 minutes
- No console errors in browser developer tools during normal operation
- All links in README are valid and all commands execute successfully