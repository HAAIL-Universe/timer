# Timer – Database Schema

## Conventions

### Naming
- **Tables**: Plural snake_case (e.g., `timers`)
- **Columns**: Snake_case (e.g., `start_time`, `elapsed_seconds`)
- **Primary Keys**: `id` (UUID type)
- **Timestamps**: `created_at`, `updated_at` where applicable

### Common Patterns
- All tables include `id` as primary key (UUID)
- Timestamp columns use `TIMESTAMP WITH TIME ZONE` for precision
- Nullable columns are explicitly marked; all others are `NOT NULL`
- Default values are set at database level where appropriate

### Data Types
- **Identifiers**: `UUID` for all primary keys
- **Timestamps**: `TIMESTAMP WITH TIME ZONE` for all time-related data
- **Status/Enums**: `VARCHAR` with CHECK constraints
- **Integers**: `INTEGER` for whole numbers (elapsed seconds)

---

## Tables

### timers

Stores individual timer instances with their current state, start time, and accumulated elapsed time.

```sql
CREATE TABLE timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(10) NOT NULL CHECK (status IN ('stopped', 'running')),
    start_time TIMESTAMP WITH TIME ZONE,
    elapsed_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timers_status ON timers(status);
CREATE INDEX idx_timers_created_at ON timers(created_at DESC);
```

**Column Definitions**:
- `id`: Unique identifier for the timer instance
- `status`: Current timer state; `stopped` (initial/default) or `running`
- `start_time`: Timestamp when timer was started; `NULL` when stopped, set when running
- `elapsed_seconds`: Total accumulated seconds; updated when timer is stopped
- `created_at`: Timestamp when timer record was created
- `updated_at`: Timestamp of last modification (start, stop, or state change)

**Constraints**:
- `status` must be one of: `stopped`, `running`
- When `status = 'running'`, `start_time` should be NOT NULL (enforced at application level)
- When `status = 'stopped'`, `start_time` should be NULL (enforced at application level)

**Indexes**:
- `idx_timers_status`: Optimize queries filtering by timer status
- `idx_timers_created_at`: Support retrieval of recent timers (useful for potential cleanup jobs)

---

## Schema Notes

### Minimal Design
This schema contains only the single table required for MVP functionality: tracking individual timer instances. No user accounts, timer history, or audit logs are included per the explicit out-of-scope items in the blueprint.

### State Management
The combination of `status`, `start_time`, and `elapsed_seconds` enables:
- **Stopped timers**: `status='stopped'`, `start_time=NULL`, `elapsed_seconds` holds total time
- **Running timers**: `status='running'`, `start_time` holds start timestamp, `elapsed_seconds` holds time accumulated from previous runs (0 for fresh start)

Elapsed time for a running timer is calculated as: `elapsed_seconds + (NOW() - start_time)`

### Idempotency Support
The schema supports idempotent operations:
- Starting an already running timer: No change to `start_time`
- Stopping an already stopped timer: No change to `elapsed_seconds`

### Future Extensibility
If the application evolves beyond MVP, this schema can extend to support:
- User ownership via `user_id` foreign key
- Timer labels via `name VARCHAR` column
- Soft deletion via `deleted_at` timestamp
- History tracking via separate `timer_events` table

However, these are deliberately excluded from the MVP scope.