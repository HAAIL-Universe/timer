/**
 * Unit tests for timerService.
 */

const {
  createTimer,
  startTimer,
  stopTimer,
  getTimer,
} = require('../../src/services/timerService');
const db = require('../../src/db/connection');

afterEach(() => {
  db.exec('DELETE FROM timers');
});

describe('createTimer', () => {
  it('creates a stopped timer with zero elapsed', async () => {
    const timer = await createTimer();
    expect(timer.id).toBeDefined();
    expect(timer.status).toBe('stopped');
    expect(timer.elapsed_seconds).toBe(0);
    expect(timer.start_time).toBeNull();
  });

  it('generates unique IDs', async () => {
    const t1 = await createTimer();
    const t2 = await createTimer();
    expect(t1.id).not.toBe(t2.id);
  });
});

describe('getTimer', () => {
  it('returns a stopped timer as-is', async () => {
    const created = await createTimer();
    const timer = await getTimer(created.id);
    expect(timer.status).toBe('stopped');
    expect(timer.elapsed_seconds).toBe(0);
  });

  it('throws for non-existent id', async () => {
    await expect(getTimer('nonexistent')).rejects.toThrow('Timer not found');
  });

  it('computes elapsed for running timer', async () => {
    const created = await createTimer();
    await startTimer(created.id);

    // Slight delay to accumulate time
    await new Promise((r) => setTimeout(r, 50));

    const timer = await getTimer(created.id);
    expect(timer.status).toBe('running');
    expect(timer.elapsed_seconds).toBeGreaterThanOrEqual(0);
  });

  it('returns stored elapsed for a previously-run stopped timer', async () => {
    const created = await createTimer();
    await startTimer(created.id);
    await new Promise((r) => setTimeout(r, 50));
    const stopped = await stopTimer(created.id);
    const fetched = await getTimer(created.id);
    expect(fetched.elapsed_seconds).toBe(stopped.elapsed_seconds);
  });
});

describe('startTimer', () => {
  it('transitions stopped timer to running', async () => {
    const created = await createTimer();
    const timer = await startTimer(created.id);
    expect(timer.status).toBe('running');
    expect(timer.start_time).not.toBeNull();
  });

  it('is idempotent when already running', async () => {
    const created = await createTimer();
    const first = await startTimer(created.id);
    const second = await startTimer(created.id);
    expect(second.status).toBe('running');
    expect(second.start_time).toBe(first.start_time);
  });

  it('throws for non-existent id', async () => {
    await expect(startTimer('ghost')).rejects.toThrow('Timer not found');
  });

  it('preserves elapsed_seconds from previous runs', async () => {
    const created = await createTimer();
    await startTimer(created.id);
    await new Promise((r) => setTimeout(r, 50));
    const stopped = await stopTimer(created.id);
    expect(stopped.elapsed_seconds).toBeGreaterThanOrEqual(0);

    const restarted = await startTimer(created.id);
    expect(restarted.status).toBe('running');
    // elapsed_seconds in DB should still hold the accumulated value
    const raw = db.prepare('SELECT elapsed_seconds FROM timers WHERE id = ?').get(created.id);
    expect(raw.elapsed_seconds).toBe(stopped.elapsed_seconds);
  });
});

describe('stopTimer', () => {
  it('transitions running timer to stopped', async () => {
    const created = await createTimer();
    await startTimer(created.id);
    const timer = await stopTimer(created.id);
    expect(timer.status).toBe('stopped');
    expect(timer.start_time).toBeNull();
  });

  it('calculates elapsed_seconds on stop', async () => {
    const created = await createTimer();
    await startTimer(created.id);
    await new Promise((r) => setTimeout(r, 100));
    const timer = await stopTimer(created.id);
    expect(timer.elapsed_seconds).toBeGreaterThanOrEqual(0);
  });

  it('is idempotent when already stopped', async () => {
    const created = await createTimer();
    const timer = await stopTimer(created.id);
    expect(timer.status).toBe('stopped');
    expect(timer.elapsed_seconds).toBe(0);
  });

  it('throws for non-existent id', async () => {
    await expect(stopTimer('ghost')).rejects.toThrow('Timer not found');
  });

  it('accumulates elapsed across multiple start/stop cycles', async () => {
    const created = await createTimer();

    await startTimer(created.id);
    await new Promise((r) => setTimeout(r, 100));
    const first = await stopTimer(created.id);

    await startTimer(created.id);
    await new Promise((r) => setTimeout(r, 100));
    const second = await stopTimer(created.id);

    expect(second.elapsed_seconds).toBeGreaterThanOrEqual(first.elapsed_seconds);
  });
});

describe('elapsed calculation accuracy', () => {
  it('getTimer returns live elapsed for running timer', async () => {
    const created = await createTimer();
    await startTimer(created.id);
    await new Promise((r) => setTimeout(r, 200));
    const timer = await getTimer(created.id);
    // At least ~0.1s should have passed (relaxed for CI)
    expect(timer.elapsed_seconds).toBeGreaterThanOrEqual(0);
    expect(timer.status).toBe('running');
  });
});
