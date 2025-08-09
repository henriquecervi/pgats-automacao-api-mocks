const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../services/authService');
const userRepository = require('../../repositories/userRepository');

describe('AuthService', () => {
  afterEach(() => {
    sinon.restore(); // Importante: sempre limpar mocks/stubs
  });

  describe('register', () => {
    it('should successfully register a new user', () => {
      // Arrange
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        balance: 1000.00
      };

      const findByUsernameStub = sinon.stub(userRepository, 'findByUsername').returns(null);
      const findByEmailStub = sinon.stub(userRepository, 'findByEmail').returns(null);
      const hashSyncStub = sinon.stub(bcrypt, 'hashSync').returns('hashedPassword');
      const createStub = sinon.stub(userRepository, 'create').returns(mockUser);

      // Act
      const result = authService.register(userData);

      // Assert
      expect(findByUsernameStub.calledOnceWith('testuser')).to.be.true;
      expect(findByEmailStub.calledOnceWith('test@example.com')).to.be.true;
      expect(hashSyncStub.calledOnceWith('password123', 10)).to.be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(result).to.deep.equal({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 1000.00
      });
      expect(result).to.not.have.property('password');
    });

    it('should throw error if username already exists', () => {
      // Arrange
      const userData = {
        username: 'existinguser',
        password: 'password123',
        email: 'test@example.com'
      };

      const existingUser = { id: 1, username: 'existinguser' };
      sinon.stub(userRepository, 'findByUsername').returns(existingUser);

      // Act & Assert
      expect(() => authService.register(userData))
        .to.throw('User with this username already exists');
    });

    it('should throw error if email already exists', () => {
      // Arrange
      const userData = {
        username: 'newuser',
        password: 'password123',
        email: 'existing@example.com'
      };

      const existingUser = { id: 1, email: 'existing@example.com' };
      sinon.stub(userRepository, 'findByUsername').returns(null);
      sinon.stub(userRepository, 'findByEmail').returns(existingUser);

      // Act & Assert
      expect(() => authService.register(userData))
        .to.throw('User with this email already exists');
    });

    it('should throw error if required fields are missing', () => {
      // Arrange
      const incompleteData = {
        username: 'testuser'
        // missing password and email
      };

      // Act & Assert
      expect(() => authService.register(incompleteData))
        .to.throw('Username, password and email are required');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', () => {
      // Arrange
      const credentials = {
        username: 'testuser',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com'
      };

      const mockToken = 'mocked.jwt.token';

      const findByUsernameStub = sinon.stub(userRepository, 'findByUsername').returns(mockUser);
      const compareSyncStub = sinon.stub(bcrypt, 'compareSync').returns(true);
      const jwtSignStub = sinon.stub(jwt, 'sign').returns(mockToken);

      // Act
      const result = authService.login(credentials);

      // Assert
      expect(findByUsernameStub.calledOnceWith('testuser')).to.be.true;
      expect(compareSyncStub.calledOnceWith('password123', 'hashedPassword')).to.be.true;
      expect(jwtSignStub.calledOnce).to.be.true;
      expect(result).to.deep.equal({
        token: mockToken,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      });
      expect(result.user).to.not.have.property('password');
    });

    it('should throw error if user not found', () => {
      // Arrange
      const credentials = {
        username: 'nonexistent',
        password: 'password123'
      };

      sinon.stub(userRepository, 'findByUsername').returns(null);

      // Act & Assert
      expect(() => authService.login(credentials))
        .to.throw('Invalid credentials');
    });

    it('should throw error if password is invalid', () => {
      // Arrange
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword'
      };

      sinon.stub(userRepository, 'findByUsername').returns(mockUser);
      sinon.stub(bcrypt, 'compareSync').returns(false);

      // Act & Assert
      expect(() => authService.login(credentials))
        .to.throw('Invalid credentials');
    });

    it('should throw error if required fields are missing', () => {
      // Arrange
      const incompleteCredentials = {
        username: 'testuser'
        // missing password
      };

      // Act & Assert
      expect(() => authService.login(incompleteCredentials))
        .to.throw('Username and password are required');
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify valid token', () => {
      // Arrange
      const token = 'valid.jwt.token';
      const decodedPayload = { userId: 1, username: 'testuser' };

      const jwtVerifyStub = sinon.stub(jwt, 'verify').returns(decodedPayload);

      // Act
      const result = authService.verifyToken(token);

      // Assert
      expect(jwtVerifyStub.calledOnceWith(token, 'banco-api-secret-key')).to.be.true;
      expect(result).to.deep.equal(decodedPayload);
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token';

      sinon.stub(jwt, 'verify').throws(new Error('jwt malformed'));

      // Act & Assert
      expect(() => authService.verifyToken(invalidToken))
        .to.throw('Invalid token');
    });
  });
});
