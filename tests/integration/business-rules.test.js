const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('Business Rules', () => {
  let adminToken, user1Token;
  
  beforeEach(async () => {
    // Reset database state
    const { resetDatabase, seedDatabase } = require('../../config/database');
    resetDatabase();
    seedDatabase();

    // Login to get authentication tokens
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    adminToken = adminLogin.body.token;

    const user1Login = await request(app)
      .post('/auth/login')
      .send({
        username: 'user1',
        password: 'password'
      });
    user1Token = user1Login.body.token;
  });

  describe('User Registration', () => {
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

    it('username and password are required', async () => {
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

  describe('Transfer Rules', () => {
    it('transfer to beneficiary can be above $ 5,000', async () => {
      // Admin has user1 as beneficiary, can transfer high values
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          beneficiaryId: '2', // user1 is beneficiary
          amount: 6000.00,
          description: 'High transfer to beneficiary'
        });

      expect(response.status).to.equal(201);
      expect(response.body.transaction.amount).to.equal(6000.00);
    });

    it('should not allow transfer to self', async () => {
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          beneficiaryId: '1', // same ID as admin
          amount: 100.00,
          description: 'Transfer to myself'
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Cannot transfer to yourself');
    });

    it('transfer to non-beneficiary limited to $ 5,000', async () => {
      // user1 doesn't have admin as beneficiary
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          beneficiaryId: '1', // admin is not beneficiary of user1
          amount: 5001.00,
          description: 'High transfer attempt'
        });

      expect(response.status).to.equal(403);
      expect(response.body.error).to.include('limited to');
    });
  });
});