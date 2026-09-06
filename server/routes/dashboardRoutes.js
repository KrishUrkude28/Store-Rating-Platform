const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');

// Admin Dashboard stats (ADMIN-001 / Section 48: GET /api/admin/dashboard)
router.get(['/admin', '/admin/dashboard'], authenticate, authorizeRole('ADMIN'), dashboardController.getAdminDashboard);

// Store Owner Dashboard (OWNER-001, OWNER-002 / Section 48: GET /api/owner/dashboard)
router.get(['/owner', '/owner/dashboard'], authenticate, authorizeRole('STORE_OWNER'), dashboardController.getOwnerDashboard);

module.exports = router;
