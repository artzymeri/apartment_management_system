const express = require('express');
const router = express.Router();
const propertyManagerDashboardController = require('../controllers/propertyManagerDashboard.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Get all property manager dashboard data in one call
router.get(
  '/',
  authenticateToken,
  authorizeRoles('property_manager'),
  propertyManagerDashboardController.getPropertyManagerDashboardData
);

module.exports = router;

