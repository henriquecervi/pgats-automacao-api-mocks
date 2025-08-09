const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');

/**
 * Validations for registration
 */
const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email')
    .isEmail()
    .withMessage('Email must be in a valid format')
];

/**
 * Validations for login
 */
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

class AuthController {

  /**
   * Register new user
   */
  register = async (req, res) => {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados de entrada inválidos',
          details: errors.array()
        });
      }

      const { username, password, email } = req.body;
      const user = await authService.register({ username, password, email });

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  /**
   * Login
   */
  login = async (req, res) => {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados de entrada inválidos',
          details: errors.array()
        });
      }

      const { username, password } = req.body;
      const result = await authService.login({ username, password });

      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      res.status(401).json({
        error: error.message
      });
    }
  }

  /**
   * Verify token (endpoint to validate if the token is valid)
   */
  verifyToken = (req, res) => {
    // If we got here, the token is valid (passed through authentication middleware)
    res.json({
              message: 'Valid token',
      user: req.user
    });
  }
}

const authController = new AuthController();

module.exports = {
  authController,
  validateRegister,
  validateLogin
};