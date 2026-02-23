const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/connection');

describe('Timer API', () => {
  beforeEach(() => {
    db.exec('DELETE FROM timers');
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /timers', () => {
    it('should create a new timer with stopped status and zero elapsed', async () => {
      const res = await request(app)
        .post('/timers')
        .expect(201)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('stopped');
      expect(res.body.elapsed_seconds).toBe(0);
      expect(res.body.start_time).toBeNull();
      expect(res.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should create multiple timers with unique IDs', async () => {
      const res1 = await request(app).post('/timers').expect(201);
      const res2 = await request(app).post('/timers').expect(201);

      expect(res1.body.id).not.toBe(res2.body.id);
    });
  });

  describe('POST /timers/:id/start', () => {
    it('should transition timer to running status', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      const startRes = await request(app)
        .post(`/timers/${timerId}/start`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(startRes.body.id).toBe(timerId);
      expect(startRes.body.status).toBe('running');
      expect(startRes.body.start_time).not.toBeNull();
      expect(startRes.body.elapsed_seconds).toBe(0);
    });

    it('should be idempotent when called on running timer', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      const startRes1 = await request(app)
        .post(`/timers/${timerId}/start`)
        .expect(200);

      const startRes2 = await request(app)
        .post(`/timers/${timerId}/start`)
        .expect(200);

      expect(startRes1.body.start_time).toBe(startRes2.body.start_time);
      expect(startRes2.body.status).toBe('running');
    });

    it('should return 404 for non-existent timer', async () => {
      const res = await request(app)
        .post('/timers/550e8400-e29b-41d4-a716-446655440000/start')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request(app)
        .post('/timers/invalid-uuid/start')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /timers/:id/stop', () => {
    it('should transition running timer to stopped and accumulate elapsed time', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      await request(app).post(`/timers/${timerId}/start`).expect(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      const stopRes = await request(app)
        .post(`/timers/${timerId}/stop`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(stopRes.body.id).toBe(timerId);
      expect(stopRes.body.status).toBe('stopped');
      expect(stopRes.body.start_time).toBeNull();
      expect(stopRes.body.elapsed_seconds).toBeGreaterThanOrEqual(0);
    });

    it('should be idempotent when called on stopped timer', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      await request(app).post(`/timers/${timerId}/start`).expect(200);
      await new Promise(resolve => setTimeout(resolve, 50));

      const stopRes1 = await request(app)
        .post(`/timers/${timerId}/stop`)
        .expect(200);

      const stopRes2 = await request(app)
        .post(`/timers/${timerId}/stop`)
        .expect(200);

      expect(stopRes1.body.elapsed_seconds).toBe(stopRes2.body.elapsed_seconds);
      expect(stopRes2.body.status).toBe('stopped');
    });

    it('should accumulate elapsed time across multiple start/stop cycles', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      await request(app).post(`/timers/${timerId}/start`).expect(200);
      await new Promise(resolve => setTimeout(resolve, 100));
      const stop1 = await request(app).post(`/timers/${timerId}/stop`).expect(200);
      const elapsed1 = stop1.body.elapsed_seconds;

      await request(app).post(`/timers/${timerId}/start`).expect(200);
      await new Promise(resolve => setTimeout(resolve, 100));
      const stop2 = await request(app).post(`/timers/${timerId}/stop`).expect(200);
      const elapsed2 = stop2.body.elapsed_seconds;

      expect(elapsed2).toBeGreaterThanOrEqual(elapsed1);
    });

    it('should return 404 for non-existent timer', async () => {
      const res = await request(app)
        .post('/timers/550e8400-e29b-41d4-a716-446655440000/stop')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request(app)
        .post('/timers/invalid-uuid/stop')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /timers/:id', () => {
    it('should retrieve stopped timer state', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      const getRes = await request(app)
        .get(`/timers/${timerId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(getRes.body.id).toBe(timerId);
      expect(getRes.body.status).toBe('stopped');
      expect(getRes.body.elapsed_seconds).toBe(0);
      expect(getRes.body.start_time).toBeNull();
    });

    it('should compute live elapsed_seconds for running timer', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      await request(app).post(`/timers/${timerId}/start`).expect(200);
      await new Promise(resolve => setTimeout(resolve, 100));

      const getRes = await request(app)
        .get(`/timers/${timerId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(getRes.body.id).toBe(timerId);
      expect(getRes.body.status).toBe('running');
      expect(getRes.body.start_time).not.toBeNull();
      expect(getRes.body.elapsed_seconds).toBeGreaterThanOrEqual(0);
    });

    it('should return 404 for non-existent timer', async () => {
      const res = await request(app)
        .get('/timers/550e8400-e29b-41d4-a716-446655440000')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request(app)
        .get('/timers/invalid-uuid')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /health', () => {
    it('should return 200 with ok status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body.status).toBe('ok');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete timer lifecycle', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      expect(createRes.body.status).toBe('stopped');
      expect(createRes.body.elapsed_seconds).toBe(0);

      const startRes = await request(app)
        .post(`/timers/${timerId}/start`)
        .expect(200);

      expect(startRes.body.status).toBe('running');

      await new Promise(resolve => setTimeout(resolve, 100));

      const stopRes = await request(app)
        .post(`/timers/${timerId}/stop`)
        .expect(200);

      expect(stopRes.body.status).toBe('stopped');
      expect(stopRes.body.start_time).toBeNull();
      expect(stopRes.body.elapsed_seconds).toBeGreaterThanOrEqual(0);

      const getRes = await request(app)
        .get(`/timers/${timerId}`)
        .expect(200);

      expect(getRes.body).toEqual(stopRes.body);
    });

    it('should handle stop on already stopped timer', async () => {
      const createRes = await request(app).post('/timers').expect(201);
      const timerId = createRes.body.id;

      const stopRes = await request(app)
        .post(`/timers/${timerId}/stop`)
        .expect(200);

      expect(stopRes.body.status).toBe('stopped');
      expect(stopRes.body.elapsed_seconds).toBe(0);
    });
  });
});
