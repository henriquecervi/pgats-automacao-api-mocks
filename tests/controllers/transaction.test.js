const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('Transaction Controller', () => {
  let authToken, user1Token;
  
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
    authToken = adminLogin.body.token;

    const user1Login = await request(app)
      .post('/auth/login')
      .send({
        username: 'user1',
        password: 'password'
      });
    user1Token = user1Login.body.token;
  });

  describe('POST /transactions/transfer', () => {
    it('should create valid transfer', async () => {
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          beneficiaryId: '2',
          amount: 50.00,
          description: 'Test transfer'
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('transaction');
      expect(response.body.transaction.amount).to.equal(50.00);
    });

    it('should reject transfer to non-beneficiary above $ 5,000', async () => {
      // First, login with user1 who doesn't have admin as beneficiary
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          beneficiaryId: '1', // admin is not beneficiary of user1
          amount: 6000.00,
          description: 'High transfer to non-beneficiary'
        });

      expect(response.status).to.equal(403);
      expect(response.body.error).to.include('limited to');
    });

    it('should reject transfer with insufficient balance', async () => {
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          beneficiaryId: '2',
          amount: 999999.00,
          description: 'Transfer with amount greater than balance'
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('Insufficient balance');
    });

    it('should validate valid beneficiary', async () => {
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          beneficiaryId: '999', // non-existent user
          amount: 100.00,
          description: 'Transfer to non-existent user'
        });

      expect(response.status).to.equal(404);
      expect(response.body.error).to.include('not found');
    });

    it('should not allow transfer to self', async () => {
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          beneficiaryId: '1', // same ID as admin
          amount: 100.00,
          description: 'Transfer to myself'
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Cannot transfer to yourself');
    });
  });

  describe('GET /transactions/statement', () => {
    it('should return user statement', async () => {
      const response = await request(app)
        .get('/transactions/statement?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('transactions');
      expect(response.body.transactions).to.be.an('array');
    });
  });
});