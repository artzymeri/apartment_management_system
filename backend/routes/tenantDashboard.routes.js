const express = require('express');
const router = express.Router();
const tenantDashboardController = require('../controllers/tenantDashboard.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Get all tenant dashboard data in one call
router.get(
  '/',
  authenticateToken,
  authorizeRoles('tenant'),
  tenantDashboardController.getTenantDashboardData
);

module.exports = router;

