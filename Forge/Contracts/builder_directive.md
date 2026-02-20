# Builder Directive — Timer

## Project Summary

A simple, straightforward timer application with start/stop controls and elapsed time display.

## Phase Structure

This project is delivered in exactly **2 phases**:

- **Phase 0 — Backend Scaffold**: Build complete REST API with timer service, database, and all endpoints
- **Phase 1 — Frontend & Ship**: Build complete web UI, integrate with API, and deliver full documentation

## Build Execution Steps

### 1. Read Contracts

Before beginning any implementation work, read and internalize:

- `blueprint.md` — Complete system architecture, tech stack, API design, data model, and integration patterns
- `phases.md` — Detailed deliverables, exit criteria, and acceptance tests for each phase

### 2. Execute Phase 0 — Backend Scaffold

Build the backend timer service from scratch:

- Scaffold project with dependency management and HTTP server
- Implement database schema (`timers` table with id, status, elapsed_seconds, start_time)
- Build repository layer (CRUD operations for timer records)
- Implement service layer with timer business logic (create, start, stop, get state)
- Create HTTP routes and handlers for all API endpoints:
  - `GET /health`
  - `POST /timers` (create)
  - `GET /timers/:id` (retrieve state)
  - `POST /timers/:id/start`
  - `POST /timers/:id/stop`
- Add error handling, CORS, logging, and environment configuration
- Create Dockerfile for backend service
- Verify all Phase 0 exit criteria pass (health check, timer CRUD operations, idempotency, state calculations)

### 3. Execute Phase 1 — Frontend & Ship

Build the frontend application and complete project delivery:

- Scaffold frontend project with build configuration
- Create single-page timer UI with display component and start/stop button
- Implement API integration layer (HTTP client, wrapper functions for all endpoints)
- Build application initialization flow (create/restore timer, fetch state)
- Implement timer state management and real-time updates (poll backend every 1 second)
- Add time formatting utility (seconds → HH:MM:SS display)
- Style UI with responsive, clean design for desktop and mobile
- Add error handling for network failures and API errors
- Create Dockerfile for frontend service
- Create docker-compose.yml orchestrating both services
- Write comprehensive README.md with:
  - Project description and features
  - Tech stack and architecture overview
  - Setup instructions (prerequisites, clone, docker-compose up)
  - Usage guide (access URL, how to use timer)
  - API documentation overview
  - Development notes
- Verify all Phase 1 exit criteria pass (docker-compose starts both services, timer UI functional, start/stop works, time updates accurately, responsive design, README complete)

### 4. Commit and Finalize

- Ensure all code is committed to the repository
- Verify docker-compose.yml is at repository root
- Verify README.md is at repository root and renders correctly
- Confirm a new user can clone and run the application using only README instructions
- Mark build complete

## Critical Requirements

- **Both phases must be executed to completion.** The build is not finished until Phase 1 exit criteria are met.
- All exit criteria in `phases.md` are mandatory acceptance tests.
- Follow the tech stack and architecture specified in `blueprint.md` exactly.
- The frontend must integrate with the backend API (not operate standalone).
- The final deliverable must be runnable via `docker-compose up` with no additional setup.
- README.md must enable a new user to successfully run the timer within 2 minutes.

## Boot Script

**boot_script**: `false`

No automated boot script is required. The builder will read contracts and execute phases according to these instructions.