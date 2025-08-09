const express = require('express');
const router = express.Router();
const { transactionController, validateTransfer, validateTransactionId, validateStatement } = require('../controllers/transactionController');
const authService = require('../services/authService');

const authenticate = authService.authenticate;


router.post('/transfer', authenticate, validateTransfer, transactionController.createTransfer);


router.get('/statement', authenticate, validateStatement, transactionController.getStatement);


router.get('/:id', authenticate, validateTransactionId, transactionController.getTransactionById);


router.get('/', authenticate, transactionController.getAllTransactions);


router.get('/stats', authenticate, transactionController.getTransactionStats);

module.exports = router;