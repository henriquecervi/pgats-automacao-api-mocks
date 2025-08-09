const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('Authentication Controller', () => {
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

  describe('POST /auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'test123',
          email: 'test@example.com'
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('user');
      expect(response.body.user.username).to.equal('testuser');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'ab', // too short
          password: '123', // too short
          email: 'invalid-email'
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('details');
    });

    it('should not allow duplicate users', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'admin', // already exists
          password: 'newpassword',
          email: 'new@email.com'
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'password'
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'invalid-password'
        });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: '', // empty
          password: ''  // empty
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('details');
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Valid token');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });
  });
});