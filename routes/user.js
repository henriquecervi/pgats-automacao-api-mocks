const express = require('express');
const router = express.Router();
const { userController, validateUpdate, validateId } = require('../controllers/userController');
const authService = require('../services/authService');

const authenticate = authService.authenticate;


router.get('/', authenticate, userController.getAllUsers);


router.get('/me', authenticate, userController.getMyProfile);


router.get('/balance', authenticate, userController.getBalance);


router.get('/:id', authenticate, validateId, userController.getUserById);


router.put('/:id', authenticate, validateId, validateUpdate, userController.updateUser);


router.post('/beneficiaries', authenticate, userController.addBeneficiary);


router.delete('/beneficiaries/:beneficiaryId', authenticate, userController.removeBeneficiary);

module.exports = router;