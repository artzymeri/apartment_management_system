const express = require('express');
const router = express.Router();
const propertyManagerDashboardController = require('../controllers/propertyManagerDashboard.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Get sidebar badge counts (pending reports, complaints, suggestions)
// This must come BEFORE the root '/' route
router.get(
  '/sidebar-counts',
  authenticateToken,
  authorizeRoles('property_manager'),
  propertyManagerDashboardController.getSidebarCounts
);

// Get all property manager dashboard data in one call
router.get(
  '/',
  authenticateToken,
  authorizeRoles('property_manager'),
  propertyManagerDashboardController.getPropertyManagerDashboardData
);

module.exports = router;
