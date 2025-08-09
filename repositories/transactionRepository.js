const { transactions } = require('../config/database');

class TransactionRepository {
  /**
   * Find all transactions
   */
  findAll() {
    return transactions;
  }

  /**
   * Find transactions by user ID
   */
  findByUserId(userId) {
    return transactions.filter(
      transaction => transaction.sender === userId.toString() || transaction.beneficiary === userId.toString()
    );
  }

  /**
   * Find transaction by ID
   */
  findById(id) {
    return transactions.find(transaction => transaction.id === id.toString());
  }

  /**
   * Create new transaction
   */
  create(transactionData) {
    const newTransaction = {
      id: transactions.length > 0 ? (Math.max(...transactions.map(t => parseInt(t.id))) + 1).toString() : '1',
      ...transactionData,
      dateTime: new Date().toISOString(),
      status: 'completed'
    };
    
    transactions.push(newTransaction);
    return newTransaction;
  }

  /**
   * Find transactions by date range
   */
  findByDateRange(userId, startDate, endDate) {
    const userTransactions = this.findByUserId(userId);
    
    return userTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.dateTime);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  /**
   * Find user's last transactions
   */
  findLastTransactions(userId, limit = 10) {
    const userTransactions = this.findByUserId(userId);
    
    return userTransactions
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .slice(0, limit);
  }
}

module.exports = new TransactionRepository();