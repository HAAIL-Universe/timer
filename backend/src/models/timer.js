class Timer {
  constructor(id, status, startTime, elapsedSeconds) {
    this.id = id;
    this.status = status;
    this.start_time = startTime;
    this.elapsed_seconds = elapsedSeconds;
  }

  static fromDatabase(row) {
    """Convert raw database row to Timer domain object."""
    return new Timer(
      row.id,
      row.status,
      row.start_time ? new Date(row.start_time) : null,
      row.elapsed_seconds
    );
  }

  getElapsedSeconds() {
    """Return current elapsed seconds, computing live value for running timers."""
    if (this.status === 'running' && this.start_time) {
      const now = Date.now();
      const runningMs = now - this.start_time.getTime();
      const runningSeconds = Math.floor(runningMs / 1000);
      return this.elapsed_seconds + runningSeconds;
    }
    return this.elapsed_seconds;
  }

  toJSON() {
    """Serialize Timer to JSON with computed elapsed_seconds for running timers."""
    return {
      id: this.id,
      status: this.status,
      elapsed_seconds: this.getElapsedSeconds(),
      start_time: this.start_time ? this.start_time.toISOString() : null
    };
  }
}

module.exports = Timer;
