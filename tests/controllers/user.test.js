const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('User Controller', () => {
  let authToken;
  
  beforeEach(async () => {
    // Reset database state
    const { resetDatabase, seedDatabase } = require('../../config/database');
    resetDatabase();
    seedDatabase();

    // Login to get authentication token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /users', () => {
    it('should list authenticated users', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('users');
      expect(response.body.users).to.be.an('array');
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.status).to.equal(401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).to.equal(401);
    });
  });

  describe('GET /users/me', () => {
    it('should return logged user profile', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('user');
      expect(response.body.user.username).to.equal('admin');
    });
  });

  describe('GET /users/balance', () => {
    it('should get user balance', async () => {
      const response = await request(app)
        .get('/users/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('balance');
      expect(typeof response.body.balance).to.equal('number');
    });
  });
});