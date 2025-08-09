const userRepository = require('../repositories/userRepository');
const transactionRepository = require('../repositories/transactionRepository');

class TransactionService {
  /**
   * Create transfer
   */
  createTransfer(senderId, beneficiaryId, amount, description = '') {
    // Basic validations
    if (!senderId || !beneficiaryId || !amount) {
      throw new Error('Sender, beneficiary and amount are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    // Find users
    const sender = userRepository.findById(senderId);
    if (!sender) {
      throw new Error('Sender user not found');
    }

    const beneficiary = userRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error('Beneficiary user not found');
    }

    // Check if transfer to self
    if (senderId.toString() === beneficiaryId.toString()) {
      throw new Error('Cannot transfer to yourself');
    }

    // Business rule: transfers to non-beneficiaries limited to $5,000.00
    const isBeneficiary = userRepository.isBeneficiary(senderId, beneficiaryId);
    const NON_BENEFICIARY_LIMIT = 5000.00;

    if (!isBeneficiary && amount > NON_BENEFICIARY_LIMIT) {
      throw new Error(
        `Transfers to non-beneficiaries are limited to $${NON_BENEFICIARY_LIMIT.toFixed(2)}`
      );
    }

    // Check sufficient balance
    if (sender.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Execute transfer
    const newSenderBalance = sender.balance - amount;
    const newBeneficiaryBalance = beneficiary.balance + amount;

    // Update balances
    userRepository.update(senderId, { balance: newSenderBalance });
    userRepository.update(beneficiaryId, { balance: newBeneficiaryBalance });

    // Record transaction
    const transaction = transactionRepository.create({
      sender: senderId,
      beneficiary: beneficiaryId,
      amount: amount,
      description: description,
      type: 'transfer'
    });

    return {
      transaction,
      previousSenderBalance: sender.balance,
      newSenderBalance,
      previousBeneficiaryBalance: beneficiary.balance,
      newBeneficiaryBalance
    };
  }

  /**
   * Get user statement
   */
  getStatement(userId, limit = 10) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const transactions = transactionRepository.findLastTransactions(userId, limit);
    
    // Enrich transactions with user information
    const detailedStatement = transactions.map(transaction => {
      const sender = userRepository.findById(transaction.sender);
      const beneficiary = userRepository.findById(transaction.beneficiary);
      
      return {
        ...transaction,
        senderName: sender ? sender.username : 'User not found',
        beneficiaryName: beneficiary ? beneficiary.username : 'User not found',
        operationType: transaction.sender === userId.toString() ? 'sent' : 'received',
        amount: transaction.amount,
        description: transaction.description
      };
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        currentBalance: user.balance
      },
      transactions: detailedStatement
    };
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(transactionId, userId) {
    const transaction = transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Check if user has permission to view this transaction
    if (transaction.sender !== userId && transaction.beneficiary !== userId) {
      throw new Error('Access denied to this transaction');
    }

    // Enrich transaction with user information
    const sender = userRepository.findById(transaction.remetente);
    const beneficiary = userRepository.findById(transaction.destinatario);

    return {
      ...transaction,
      senderName: sender ? sender.username : 'User not found',
      beneficiaryName: beneficiary ? beneficiary.username : 'User not found',
      operationType: transaction.sender === userId ? 'sent' : 'received',
      amount: transaction.amount,
      description: transaction.description
    };
  }

  /**
   * Get all transactions (admin)
   */
  getAllTransactions() {
    const transactions = transactionRepository.findAll();
    
    return transactions.map(transaction => {
      const sender = userRepository.findById(transaction.sender);
      const beneficiary = userRepository.findById(transaction.beneficiary);
      
      return {
        ...transaction,
        senderName: sender ? sender.username : 'User not found',
        beneficiaryName: beneficiary ? beneficiary.username : 'User not found',
        amount: transaction.amount,
        description: transaction.description
      };
    });
  }
}

module.exports = new TransactionService();