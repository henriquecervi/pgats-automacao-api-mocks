const { body, param, query, validationResult } = require('express-validator');
const transactionService = require('../services/transactionService');

/**
 * Validations for transfer
 */
const validateTransfer = [
  body('beneficiaryId')
    .notEmpty()
    .withMessage('Beneficiary ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must have at most 255 characters')
];

/**
 * Validations for transaction query
 */
const validateTransactionId = [
  param('id')
    .notEmpty()
    .withMessage('Transaction ID is required')
];

/**
 * Validations for statement
 */
const validateStatement = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a number between 1 and 100')
];

class TransactionController {

  /**
   * Create transfer
   */
  createTransfer = (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid input data',
          details: errors.array()
        });
      }

      const senderId = req.user.userId;
      const { beneficiaryId, amount, description } = req.body;

      const result = transactionService.createTransfer(
        senderId,
        beneficiaryId,
        amount,
        description
      );

      res.status(201).json({
        message: 'Transfer completed successfully',
        ...result
      });
    } catch (error) {
      const statusCode = 
        error.message.includes('limited to') ? 403 :
        error.message.includes('not found') ? 404 :
        400;

      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Get user statement
   */
  getStatement = (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid parameters',
          details: errors.array()
        });
      }

      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 10;

      const statement = transactionService.getStatement(userId, limit);

      res.json({
        message: 'Statement retrieved successfully',
        ...statement
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  /**
   * Get transaction by ID
   */
  getTransactionById = (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid ID',
          details: errors.array()
        });
      }

      const { id: transactionId } = req.params;
      const userId = req.user.userId;

      const transaction = transactionService.getTransactionById(transactionId, userId);

      res.json({
        message: 'Transaction found',
        transaction
      });
    } catch (error) {
      const statusCode = 
        error.message === 'Transaction not found' ? 404 :
        error.message === 'Access denied to this transaction' ? 403 :
        500;

      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Get all transactions (admin/debug only)
   */
  getAllTransactions = (req, res) => {
    try {
      const transactions = transactionService.getAllTransactions();

      res.json({
        message: 'Transactions retrieved',
        transactions,
        total: transactions.length
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  /**
   * Get user transaction statistics
   */
  getTransactionStats = (req, res) => {
    try {
      const userId = req.user.userId;
      const statement = transactionService.getStatement(userId, 1000); // Get many transactions for statistics

      const stats = {
        totalTransactions: statement.transactions.length,
        totalSent: statement.transactions
          .filter(t => t.operationType === 'sent')
          .reduce((sum, t) => sum + t.amount, 0),
        totalReceived: statement.transactions
          .filter(t => t.operationType === 'received')
          .reduce((sum, t) => sum + t.amount, 0),
        currentBalance: statement.user.currentBalance
      };

      res.json({
        message: 'Statistics calculated',
        user: statement.user,
        statistics: stats
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
}

const transactionController = new TransactionController();

module.exports = {
  transactionController,
  validateTransfer,
  validateTransactionId,
  validateStatement
};