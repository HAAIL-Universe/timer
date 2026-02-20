/**
 * Integration tests for GET /health endpoint.
 */

const request = require('supertest');
const app = require('../../src/index');

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should respond with correct content-type', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('should not require any request body', async () => {
    const res = await request(app).get('/health').send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
