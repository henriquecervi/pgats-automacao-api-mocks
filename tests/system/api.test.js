const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('System', () => {
  it('GET /health - should return API status', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('OK');
  });

  it('GET /api-docs - should return Swagger documentation', async () => {
    const response = await request(app)
      .get('/api-docs/');

    expect(response.status).to.equal(200);
    expect(response.text).to.include('Swagger UI');
  });

  it('GET /non-existent-route - should return 404', async () => {
    const response = await request(app)
      .get('/non-existent-route');

    expect(response.status).to.equal(404);
    expect(response.body.error).to.include('not found');
  });
});