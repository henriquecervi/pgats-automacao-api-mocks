const { body, param, validationResult } = require('express-validator');
const userService = require('../services/userService');

/**
 * Validations for user update
 */
const validateUpdate = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be in a valid format'),
  body('beneficiaries')
    .optional()
    .isArray()
    .withMessage('Beneficiaries must be an array')
];

/**
 * Validations for ID parameters
 */
const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
];

class UserController {

  /**
   * Get all users
   */
  getAllUsers = (req, res) => {
    try {
      const users = userService.getAllUsers();
      res.json({
        message: 'Users found',
        users,
        total: users.length
      });
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Get user by ID
   */
  getUserById = (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid ID',
          details: errors.array()
        });
      }

      const { id: userId } = req.params;
      const user = userService.getUserById(userId);

      res.json({
        message: 'User found',
        user
      });
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Get logged user profile
   */
  getMyProfile = (req, res) => {
    try {
      const userId = req.user.userId;
      const user = userService.getUserById(userId);

      res.json({
        message: 'User profile',
        user
      });
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Update user data
   */
  updateUser = (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const userId = parseInt(req.params.id);
    const updates = req.body;

    // Check if the user is trying to update their own profile or is admin
    if (req.user.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied. You can only update your own profile'
      });
    }

    try {
      const updatedUser = userService.updateUser(userId, updates);
      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 400;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Add beneficiary
   */
  addBeneficiary = (req, res) => {
    const userId = req.user.userId;
    const { beneficiaryId } = req.body;

    if (!beneficiaryId) {
      return res.status(400).json({
        error: 'Beneficiary ID is required'
      });
    }

    try {
      const updatedUser = userService.addBeneficiary(userId, beneficiaryId);
      res.json({
        message: 'Beneficiary added successfully',
        user: updatedUser
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Remove beneficiary
   */
  removeBeneficiary = (req, res) => {
    const userId = req.user.userId;
    const { beneficiaryId } = req.params;

    if (!beneficiaryId) {
      return res.status(400).json({
        error: 'Beneficiary ID is required'
      });
    }

    try {
      const updatedUser = userService.removeBeneficiary(userId, beneficiaryId);
      res.json({
        message: 'Beneficiary removed successfully',
        user: updatedUser
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }

  /**
   * Get user balance
   */
  getBalance = (req, res) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    try {
      const userId = req.user.userId;
      const result = userService.getUserBalance(userId);
      res.json(result);
    } catch (error) {

      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({
        error: error.message
      });
    }
  }
}

const userController = new UserController();

module.exports = {
  userController,
  validateUpdate,
  validateId
};