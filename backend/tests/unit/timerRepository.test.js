/**
 * Unit tests for timerRepository.
 */

const {
  createTimer,
  findTimerById,
  updateTimer,
  deleteTimer,
} = require('../../src/repositories/timerRepository');
const db = require('../../src/db/connection');

afterEach(() => {
  db.exec('DELETE FROM timers');
});

describe('createTimer', () => {
  it('creates a stopped timer', async () => {
    const timer = await createTimer('t1', 'stopped', null, 0);
    expect(timer).toMatchObject({
      id: 't1',
      status: 'stopped',
      start_time: null,
      elapsed_seconds: 0,
    });
  });

  it('creates a running timer with start_time', async () => {
    const now = Date.now();
    const timer = await createTimer('t2', 'running', now, 5);
    expect(timer.id).toBe('t2');
    expect(timer.status).toBe('running');
    expect(timer.start_time).toBe(now);
    expect(timer.elapsed_seconds).toBe(5);
  });

  it('defaults elapsedSeconds to 0 when undefined', async () => {
    const timer = await createTimer('t3', 'stopped', null, undefined);
    expect(timer.elapsed_seconds).toBe(0);
  });

  it('rejects duplicate id', async () => {
    await createTimer('dup', 'stopped', null, 0);
    await expect(createTimer('dup', 'stopped', null, 0)).rejects.toThrow();
  });

  it('rejects invalid status', async () => {
    await expect(createTimer('bad', 'paused', null, 0)).rejects.toThrow();
  });
});

describe('findTimerById', () => {
  it('returns timer when found', async () => {
    await createTimer('f1', 'stopped', null, 10);
    const timer = await findTimerById('f1');
    expect(timer).not.toBeNull();
    expect(timer.id).toBe('f1');
    expect(timer.elapsed_seconds).toBe(10);
  });

  it('returns null when not found', async () => {
    const result = await findTimerById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('updateTimer', () => {
  it('updates an existing timer', async () => {
    await createTimer('u1', 'stopped', null, 0);
    const now = Date.now();
    const updated = await updateTimer('u1', 'running', now, 0);
    expect(updated.status).toBe('running');
    expect(updated.start_time).toBe(now);
  });

  it('returns null for non-existent id', async () => {
    const result = await updateTimer('ghost', 'stopped', null, 0);
    expect(result).toBeNull();
  });

  it('rejects invalid status on update', async () => {
    await createTimer('u2', 'stopped', null, 0);
    await expect(updateTimer('u2', 'invalid', null, 0)).rejects.toThrow();
  });

  it('updates elapsed_seconds', async () => {
    await createTimer('u3', 'stopped', null, 0);
    const updated = await updateTimer('u3', 'stopped', null, 42);
    expect(updated.elapsed_seconds).toBe(42);
  });

  it('clears start_time when stopping', async () => {
    const now = Date.now();
    await createTimer('u4', 'running', now, 0);
    const updated = await updateTimer('u4', 'stopped', null, 10);
    expect(updated.status).toBe('stopped');
    expect(updated.start_time).toBeNull();
    expect(updated.elapsed_seconds).toBe(10);
  });
});

describe('deleteTimer', () => {
  it('deletes an existing timer', async () => {
    await createTimer('d1', 'stopped', null, 0);
    const result = await deleteTimer('d1');
    expect(result).toBe(true);
    const found = await findTimerById('d1');
    expect(found).toBeNull();
  });

  it('returns false for non-existent id', async () => {
    const result = await deleteTimer('nope');
    expect(result).toBe(false);
  });
});
