const { expect } = require('chai');
const sinon = require('sinon');
const transactionService = require('../../services/transactionService');
const userRepository = require('../../repositories/userRepository');
const transactionRepository = require('../../repositories/transactionRepository');

describe('TransactionService', () => {
  afterEach(() => {
    sinon.restore(); // Importante: sempre limpar mocks/stubs
  });

  describe('createTransfer', () => {
    it('should successfully create transfer between beneficiaries', () => {
      // Arrange
      const senderId = 1;
      const beneficiaryId = 2;
      const amount = 500.00;
      const description = 'Test transfer';

      const mockSender = {
        id: 1,
        username: 'sender',
        balance: 1000.00
      };

      const mockBeneficiary = {
        id: 2,
        username: 'beneficiary',
        balance: 500.00
      };

      const mockTransaction = {
        id: 1,
        sender: senderId,
        beneficiary: beneficiaryId,
        amount: amount,
        description: description,
        type: 'transfer',
        timestamp: new Date()
      };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(senderId).returns(mockSender);
      findByIdStub.withArgs(beneficiaryId).returns(mockBeneficiary);

      const isBeneficiaryStub = sinon.stub(userRepository, 'isBeneficiary').returns(true);
      const updateStub = sinon.stub(userRepository, 'update');
      const createTransactionStub = sinon.stub(transactionRepository, 'create').returns(mockTransaction);

      // Act
      const result = transactionService.createTransfer(senderId, beneficiaryId, amount, description);

      // Assert
      expect(findByIdStub.calledWith(senderId)).to.be.true;
      expect(findByIdStub.calledWith(beneficiaryId)).to.be.true;
      expect(isBeneficiaryStub.calledOnceWith(senderId, beneficiaryId)).to.be.true;
      expect(updateStub.calledWith(senderId, { balance: 500.00 })).to.be.true;
      expect(updateStub.calledWith(beneficiaryId, { balance: 1000.00 })).to.be.true;
      expect(createTransactionStub.calledOnce).to.be.true;
      expect(result).to.have.property('transaction');
      expect(result.previousSenderBalance).to.equal(1000.00);
      expect(result.newSenderBalance).to.equal(500.00);
      expect(result.previousBeneficiaryBalance).to.equal(500.00);
      expect(result.newBeneficiaryBalance).to.equal(1000.00);
    });

    it('should enforce limit for non-beneficiary transfers', () => {
      // Arrange
      const senderId = 1;
      const beneficiaryId = 2;
      const amount = 6000.00; // Above limit
      const description = 'Large transfer';

      const mockSender = {
        id: 1,
        username: 'sender',
        balance: 10000.00
      };

      const mockBeneficiary = {
        id: 2,
        username: 'beneficiary',
        balance: 500.00
      };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(senderId).returns(mockSender);
      findByIdStub.withArgs(beneficiaryId).returns(mockBeneficiary);

      sinon.stub(userRepository, 'isBeneficiary').returns(false); // Not a beneficiary

      // Act & Assert
      expect(() => transactionService.createTransfer(senderId, beneficiaryId, amount, description))
        .to.throw('Transfers to non-beneficiaries are limited to $5000.00');
    });

    it('should throw error for insufficient balance', () => {
      // Arrange
      const senderId = 1;
      const beneficiaryId = 2;
      const amount = 1500.00;

      const mockSender = {
        id: 1,
        username: 'sender',
        balance: 1000.00 // Insufficient balance
      };

      const mockBeneficiary = {
        id: 2,
        username: 'beneficiary',
        balance: 500.00
      };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(senderId).returns(mockSender);
      findByIdStub.withArgs(beneficiaryId).returns(mockBeneficiary);

      sinon.stub(userRepository, 'isBeneficiary').returns(true);

      // Act & Assert
      expect(() => transactionService.createTransfer(senderId, beneficiaryId, amount))
        .to.throw('Insufficient balance');
    });

    it('should throw error when sender not found', () => {
      // Arrange
      const senderId = 999;
      const beneficiaryId = 2;
      const amount = 500.00;

      sinon.stub(userRepository, 'findById').withArgs(senderId).returns(null);

      // Act & Assert
      expect(() => transactionService.createTransfer(senderId, beneficiaryId, amount))
        .to.throw('Sender user not found');
    });

    it('should throw error when beneficiary not found', () => {
      // Arrange
      const senderId = 1;
      const beneficiaryId = 999;
      const amount = 500.00;

      const mockSender = { id: 1, username: 'sender', balance: 1000.00 };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(senderId).returns(mockSender);
      findByIdStub.withArgs(beneficiaryId).returns(null);

      // Act & Assert
      expect(() => transactionService.createTransfer(senderId, beneficiaryId, amount))
        .to.throw('Beneficiary user not found');
    });

    it('should throw error for self transfer', () => {
      // Arrange
      const senderId = 1;
      const beneficiaryId = 1; // Same as sender
      const amount = 500.00;

      const mockUser = { id: 1, username: 'user', balance: 1000.00 };

      sinon.stub(userRepository, 'findById').returns(mockUser);

      // Act & Assert
      expect(() => transactionService.createTransfer(senderId, beneficiaryId, amount))
        .to.throw('Cannot transfer to yourself');
    });

    it('should throw error for invalid amount', () => {
      // Arrange
      const senderId = 1;
      const beneficiaryId = 2;
      const amount = -100.00; // Negative amount

      // Act & Assert
      expect(() => transactionService.createTransfer(senderId, beneficiaryId, amount))
        .to.throw('Amount must be greater than zero');
    });

    it('should throw error for missing required fields', () => {
      // Act & Assert
      expect(() => transactionService.createTransfer(null, 2, 500.00))
        .to.throw('Sender, beneficiary and amount are required');

      expect(() => transactionService.createTransfer(1, null, 500.00))
        .to.throw('Sender, beneficiary and amount are required');

      expect(() => transactionService.createTransfer(1, 2, null))
        .to.throw('Sender, beneficiary and amount are required');
    });
  });

  describe('getStatement', () => {
    it('should return enriched statement for user', () => {
      // Arrange
      const userId = 1;
      const limit = 5;

      const mockUser = {
        id: 1,
        username: 'testuser',
        balance: 1000.00
      };

      const mockTransactions = [
        {
          id: 1,
          sender: '1',
          beneficiary: '2',
          amount: 100.00,
          description: 'Payment',
          type: 'transfer'
        },
        {
          id: 2,
          sender: '2',
          beneficiary: '1',
          amount: 50.00,
          description: 'Refund',
          type: 'transfer'
        }
      ];

      const mockSender = { id: 2, username: 'sender' };
      const mockBeneficiary = { id: 2, username: 'beneficiary' };

      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(userId).returns(mockUser);
      findByIdStub.withArgs('1').returns(mockUser);
      findByIdStub.withArgs('2').returns(mockSender);

      const findLastTransactionsStub = sinon.stub(transactionRepository, 'findLastTransactions')
        .returns(mockTransactions);

      // Act
      const result = transactionService.getStatement(userId, limit);

      // Assert
      expect(findByIdStub.calledWith(userId)).to.be.true;
      expect(findLastTransactionsStub.calledOnceWith(userId, limit)).to.be.true;
      expect(result).to.have.property('user');
      expect(result).to.have.property('transactions');
      expect(result.user.username).to.equal('testuser');
      expect(result.user.currentBalance).to.equal(1000.00);
      expect(result.transactions).to.be.an('array');
      expect(result.transactions[0]).to.have.property('operationType');
    });

    it('should throw error when user not found', () => {
      // Arrange
      const userId = 999;
      sinon.stub(userRepository, 'findById').returns(null);

      // Act & Assert
      expect(() => transactionService.getStatement(userId))
        .to.throw('User not found');
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction details when user has permission', () => {
      // Arrange
      const transactionId = 1;
      const userId = 1;

      const mockTransaction = {
        id: 1,
        sender: 1,
        beneficiary: 2,
        amount: 100.00,
        description: 'Test',
        remetente: 1,
        destinatario: 2
      };

      const findByIdStub = sinon.stub(transactionRepository, 'findById').returns(mockTransaction);
      const userFindByIdStub = sinon.stub(userRepository, 'findById');
      userFindByIdStub.withArgs(1).returns({ id: 1, username: 'sender' });
      userFindByIdStub.withArgs(2).returns({ id: 2, username: 'beneficiary' });

      // Act
      const result = transactionService.getTransactionById(transactionId, userId);

      // Assert
      expect(findByIdStub.calledOnceWith(transactionId)).to.be.true;
      expect(result).to.have.property('operationType');
      expect(result.operationType).to.equal('sent');
    });

    it('should throw error when transaction not found', () => {
      // Arrange
      const transactionId = 999;
      const userId = 1;

      sinon.stub(transactionRepository, 'findById').returns(null);

      // Act & Assert
      expect(() => transactionService.getTransactionById(transactionId, userId))
        .to.throw('Transaction not found');
    });

    it('should throw error when user has no permission', () => {
      // Arrange
      const transactionId = 1;
      const userId = 3; // Different user

      const mockTransaction = {
        id: 1,
        sender: 1,
        beneficiary: 2,
        amount: 100.00
      };

      sinon.stub(transactionRepository, 'findById').returns(mockTransaction);

      // Act & Assert
      expect(() => transactionService.getTransactionById(transactionId, userId))
        .to.throw('Access denied to this transaction');
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions with user information', () => {
      // Arrange
      const mockTransactions = [
        {
          id: 1,
          sender: 1,
          beneficiary: 2,
          amount: 100.00,
          description: 'Payment'
        }
      ];

      const findAllStub = sinon.stub(transactionRepository, 'findAll').returns(mockTransactions);
      const findByIdStub = sinon.stub(userRepository, 'findById');
      findByIdStub.withArgs(1).returns({ id: 1, username: 'sender' });
      findByIdStub.withArgs(2).returns({ id: 2, username: 'beneficiary' });

      // Act
      const result = transactionService.getAllTransactions();

      // Assert
      expect(findAllStub.calledOnce).to.be.true;
      expect(result).to.be.an('array');
      expect(result[0]).to.have.property('senderName');
      expect(result[0]).to.have.property('beneficiaryName');
      expect(result[0].senderName).to.equal('sender');
      expect(result[0].beneficiaryName).to.equal('beneficiary');
    });
  });
});
