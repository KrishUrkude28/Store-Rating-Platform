const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validatePasswordChange } = require('../middleware/validate');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/change-password', authenticate, validatePasswordChange, authController.changePassword);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
