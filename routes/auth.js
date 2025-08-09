const express = require('express');
const router = express.Router();
const { authController, validateRegister, validateLogin } = require('../controllers/authController');


router.post('/register', validateRegister, authController.register);


router.post('/login', validateLogin, authController.login);


const authService = require('../services/authService');
const authenticate = authService.authenticate;

router.get('/verify', authenticate, authController.verifyToken);

module.exports = router;