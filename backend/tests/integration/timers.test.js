/**
 * Integration tests for timer endpoints.
 */

const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/db/connection');

describe('POST /timers', () => {
  it('should create a new timer in stopped state', async () => {
    const res = await request(app).post('/timers');
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'stopped',
      elapsed_seconds: 0,
      start_time: null,
    });
    expect(res.body.id).toBeDefined();
    expect(typeof res.body.id).toBe('string');
  });

  it('should return unique IDs for each timer', async () => {
    const res1 = await request(app).post('/timers');
    const res2 = await request(app).post('/timers');
    expect(res1.body.id).not.toBe(res2.body.id);
  });
});

describe('GET /timers/:id', () => {
  it('should return a timer by ID', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    const res = await request(app).get(`/timers/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      status: 'stopped',
      elapsed_seconds: 0,
      start_time: null,
    });
  });

  it('should return 404 for non-existent timer', async () => {
    const res = await request(app).get('/timers/non-existent-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /timers/:id/start', () => {
  it('should start a stopped timer', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    const res = await request(app).post(`/timers/${id}/start`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('running');
    expect(res.body.start_time).not.toBeNull();
  });

  it('should be idempotent when timer is already running', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    await request(app).post(`/timers/${id}/start`);
    const res = await request(app).post(`/timers/${id}/start`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('running');
  });

  it('should return 404 for non-existent timer', async () => {
    const res = await request(app).post('/timers/non-existent-id/start');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /timers/:id/stop', () => {
  it('should stop a running timer', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    await request(app).post(`/timers/${id}/start`);
    const res = await request(app).post(`/timers/${id}/stop`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('stopped');
    expect(res.body.start_time).toBeNull();
  });

  it('should be idempotent when timer is already stopped', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    const res = await request(app).post(`/timers/${id}/stop`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('stopped');
    expect(res.body.elapsed_seconds).toBe(0);
  });

  it('should return 404 for non-existent timer', async () => {
    const res = await request(app).post('/timers/non-existent-id/stop');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('Timer lifecycle', () => {
  it('should accumulate elapsed time across start/stop cycles', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    // Start the timer
    await request(app).post(`/timers/${id}/start`);

    // Manually set start_time in the past to simulate elapsed time
    const pastTime = Date.now() - 5000;
    db.prepare('UPDATE timers SET start_time = ? WHERE id = ?').run(pastTime, id);

    // Stop — should capture ~5 seconds
    const stop1 = await request(app).post(`/timers/${id}/stop`);
    expect(stop1.body.elapsed_seconds).toBeGreaterThanOrEqual(4);
    expect(stop1.body.elapsed_seconds).toBeLessThan(10);

    // Start again
    await request(app).post(`/timers/${id}/start`);

    // Set start_time in the past again
    const pastTime2 = Date.now() - 3000;
    db.prepare('UPDATE timers SET start_time = ? WHERE id = ?').run(pastTime2, id);

    // Stop — should accumulate
    const stop2 = await request(app).post(`/timers/${id}/stop`);
    expect(stop2.body.elapsed_seconds).toBeGreaterThanOrEqual(7);
  });

  it('should compute elapsed on GET while running', async () => {
    const create = await request(app).post('/timers');
    const id = create.body.id;

    await request(app).post(`/timers/${id}/start`);

    // Set start_time in the past
    const pastTime = Date.now() - 2000;
    db.prepare('UPDATE timers SET start_time = ? WHERE id = ?').run(pastTime, id);

    const res = await request(app).get(`/timers/${id}`);
    expect(res.body.status).toBe('running');
    expect(res.body.elapsed_seconds).toBeGreaterThanOrEqual(1);
  });
});
