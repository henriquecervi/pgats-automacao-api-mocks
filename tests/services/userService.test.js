const { expect } = require('chai');
const sinon = require('sinon');
const userService = require('../../services/userService');
const userRepository = require('../../repositories/userRepository');

describe('UserService', () => {
  afterEach(() => {
    sinon.restore(); // Importante: sempre limpar mocks/stubs
  });

  describe('getAllUsers', () => {
    it('should return all users from repository', () => {
      // Arrange
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ];

      const findAllStub = sinon.stub(userRepository, 'findAll').returns(mockUsers);

      // Act
      const result = userService.getAllUsers();

      // Assert
      expect(findAllStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user without password when user exists', () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        balance: 1000.00
      };

      const findByIdStub = sinon.stub(userRepository, 'findById').returns(mockUser);

      // Act
      const result = userService.getUserById(userId);

      // Assert
      expect(findByIdStub.calledOnceWith(userId)).to.be.true;
      expect(result).to.deep.equal({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 1000.00
      });
      expect(result).to.not.have.property('password');
    });

    it('should throw error when user not found', () => {
      // Arrange
      const userId = 999;
      sinon.stub(userRepository, 'findById').returns(null);

      // Act & Assert
      expect(() => userService.getUserById(userId))
        .to.throw('User not found');
    });
  });

  describe('updateUser', () => {
    it('should successfully update user with allowed fields', () => {
      // Arrange
      const userId = 1;
      const updates = {
        email: 'newemail@example.com',
        beneficiaries: ['2', '3']
      };

      const updatedUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'newemail@example.com',
        beneficiaries: ['2', '3']
      };

      const updateStub = sinon.stub(userRepository, 'update').returns(updatedUser);

      // Act
      const result = userService.updateUser(userId, updates);

      // Assert
      expect(updateStub.calledOnceWith(userId, updates)).to.be.true;
      expect(result).to.deep.equal({
        id: 1,
        username: 'testuser',
        email: 'newemail@example.com',
        beneficiaries: ['2', '3']
      });
      expect(result).to.not.have.property('password');
    });

    it('should filter out non-allowed fields', () => {
      // Arrange
      const userId = 1;
      const updates = {
        email: 'newemail@example.com',
        password: 'newpassword', // not allowed
        balance: 5000.00, // not allowed
        username: 'newusername' // not allowed
      };

      const expectedFilteredUpdates = {
        email: 'newemail@example.com'
      };

      const updatedUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'newemail@example.com'
      };

      const updateStub = sinon.stub(userRepository, 'update').returns(updatedUser);

      // Act
      const result = userService.updateUser(userId, updates);

      // Assert
      expect(updateStub.calledOnceWith(userId, expectedFilteredUpdates)).to.be.true;
      expect(result).to.not.have.property('password');
    });

    it('should throw error when no valid fields provided', () => {
      // Arrange
      const userId = 1;
      const updates = {
        password: 'newpassword', // not allowed
        balance: 5000.00 // not allowed
      };

      // Act & Assert
      expect(() => userService.updateUser(userId, updates))
        .to.throw('No valid fields provided for update');
    });

    it('should throw error when user not found', () => {
      // Arrange
      const userId = 999;
      const updates = { email: 'newemail@example.com' };

      sinon.stub(userRepository, 'update').returns(null);

      // Act & Assert
      expect(() => userService.updateUser(userId, updates))
        .to.throw('User not found');
    });
  });

  describe('addBeneficiary', () => {
    it('should successfully add beneficiary', () => {
      // Arrange
      const userId = 1;
      const beneficiaryId = 2;

      const mockUser = {
        id: 1,
        username: 'user1',
        beneficiaries: []
      };

      const mockBeneficiary = {
        id: 2,
        username: 'user2'
      };

      const updatedUser = {
        id: 1,
        username: 'user1',
        password: 'hashedPassword',
        beneficiaries: ['2']
      };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(userId).returns(mockUser);
      findByIdStub.withArgs(beneficiaryId).returns(mockBeneficiary);

      const updateStub = sinon.stub(userRepository, 'update').returns(updatedUser);

      // Act
      const result = userService.addBeneficiary(userId, beneficiaryId);

      // Assert
      expect(findByIdStub.calledWith(userId)).to.be.true;
      expect(findByIdStub.calledWith(beneficiaryId)).to.be.true;
      expect(updateStub.calledOnceWith(userId, { beneficiaries: ['2'] })).to.be.true;
      expect(result).to.not.have.property('password');
    });

    it('should throw error when user not found', () => {
      // Arrange
      const userId = 999;
      const beneficiaryId = 2;

      sinon.stub(userRepository, 'findById').withArgs(userId).returns(null);

      // Act & Assert
      expect(() => userService.addBeneficiary(userId, beneficiaryId))
        .to.throw('User not found');
    });

    it('should throw error when beneficiary not found', () => {
      // Arrange
      const userId = 1;
      const beneficiaryId = 999;

      const mockUser = { id: 1, username: 'user1', beneficiaries: [] };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(userId).returns(mockUser);
      findByIdStub.withArgs(beneficiaryId).returns(null);

      // Act & Assert
      expect(() => userService.addBeneficiary(userId, beneficiaryId))
        .to.throw('Beneficiary user not found');
    });

    it('should throw error when trying to add self as beneficiary', () => {
      // Arrange
      const userId = 1;
      const beneficiaryId = 1;

      const mockUser = { id: 1, username: 'user1', beneficiaries: [] };

      sinon.stub(userRepository, 'findById').returns(mockUser);

      // Act & Assert
      expect(() => userService.addBeneficiary(userId, beneficiaryId))
        .to.throw('Cannot add yourself as a beneficiary');
    });

    it('should throw error when beneficiary already exists', () => {
      // Arrange
      const userId = 1;
      const beneficiaryId = 2;

      const mockUser = {
        id: 1,
        username: 'user1',
        beneficiaries: ['2'] // already exists
      };

      const mockBeneficiary = { id: 2, username: 'user2' };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(userId).returns(mockUser);
      findByIdStub.withArgs(beneficiaryId).returns(mockBeneficiary);

      // Act & Assert
      expect(() => userService.addBeneficiary(userId, beneficiaryId))
        .to.throw('User is already in the beneficiaries list');
    });
  });

  describe('getUserBalance', () => {
    it('should return user balance when user exists', () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: 1,
        username: 'testuser',
        balance: 1500.50
      };

      const findByIdStub = sinon.stub(userRepository, 'findById').returns(mockUser);

      // Act
      const result = userService.getUserBalance(userId);

      // Assert
      expect(findByIdStub.calledOnceWith(userId)).to.be.true;
      expect(result).to.deep.equal({
        message: 'Balance retrieved successfully',
        balance: 1500.50
      });
    });

    it('should throw error when user not found', () => {
      // Arrange
      const userId = 999;
      sinon.stub(userRepository, 'findById').returns(null);

      // Act & Assert
      expect(() => userService.getUserBalance(userId))
        .to.throw('User not found');
    });
  });
});
