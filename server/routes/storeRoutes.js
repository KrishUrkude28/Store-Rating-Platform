const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateStoreCreation } = require('../middleware/validate');

// Create Store is restricted to Administrator (ADMIN-007)
router.post('/', authenticate, authorizeRole('ADMIN'), validateStoreCreation, storeController.createStore);

// Get Stores is available to all authenticated users (ADMIN-008 & USER-001)
router.get('/', authenticate, storeController.getStores);

// Get single Store by ID
router.get('/:id', authenticate, storeController.getStoreById);

module.exports = router;
