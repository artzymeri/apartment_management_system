const express = require('express');
const router = express.Router();
const { verifyToken, isAdminOrPropertyManager } = require('../middleware/auth.middleware');
const propertyManagerDashboardController = require('../controllers/propertyManagerDashboard.controller');

// All routes require authentication and property_manager or admin role
router.use(verifyToken);
router.use(isAdminOrPropertyManager);

// Get main dashboard data
router.get('/', propertyManagerDashboardController.getPropertyManagerDashboardData);

// Get sidebar badge counts
router.get('/sidebar-counts', propertyManagerDashboardController.getSidebarCounts);

// Get detailed payments data
router.get('/payments', propertyManagerDashboardController.getPropertyManagerPayments);

module.exports = router;
