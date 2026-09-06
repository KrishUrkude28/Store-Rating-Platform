const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateUserCreation } = require('../middleware/validate');

// All user management routes are restricted to Administrator (ADMIN-002, 003, 004, 005, 006)
router.use(authenticate, authorizeRole('ADMIN'));

router.post('/', validateUserCreation, userController.createUser);
router.get('/', userController.getUsers);
router.get('/owners', userController.getStoreOwners);
router.get('/:id', userController.getUserDetails);

module.exports = router;
