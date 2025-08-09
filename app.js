const express = require('express');
const { seedDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const transactionRoutes = require('./routes/transaction');
const systemRoutes = require('./routes/system');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/', systemRoutes);

// Middleware for handling not found routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist in this API`,
    availableEndpoints: {
      documentation: '/api-docs',
      health: '/health',
      auth: ['/auth/register', '/auth/login', '/auth/verify'],
      users: ['/users', '/users/{id}', '/users/me', '/users/balance', '/users/beneficiaries'],
      transactions: ['/transactions/transfer', '/transactions/statement', '/transactions/{id}', '/transactions/stats']
    }
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again later.'
  });
});

// Initialize sample data
seedDatabase();

module.exports = app;