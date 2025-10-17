const express = require('express');
const router = express.Router();
const monthlyReportController = require('../controllers/monthlyReport.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// All routes require authentication and property manager role
router.use(verifyToken);

// Tenant-specific routes
router.get('/tenant/my-reports', authorizeRoles('tenant'), monthlyReportController.getTenantPropertyReports);
router.get('/download/:reportId', authorizeRoles('property_manager', 'tenant'), monthlyReportController.downloadMonthlyReportPdf);

// Property manager routes
router.use(authorizeRoles('property_manager'));

// Get report preview (without saving)
router.get('/preview', monthlyReportController.getReportPreview);

// Generate or update a monthly report
router.post('/generate', monthlyReportController.generateMonthlyReport);

// Get all reports across all managed properties
router.get('/all', monthlyReportController.getAllMyReports);

// Get monthly reports for a specific property
router.get('/property/:propertyId', monthlyReportController.getPropertyReports);

// Get detailed monthly report by ID
router.get('/:reportId', monthlyReportController.getMonthlyReportDetail);

// Update a monthly report
router.put('/:reportId', monthlyReportController.updateMonthlyReport);

// Delete a monthly report
router.delete('/:reportId', monthlyReportController.deleteMonthlyReport);

module.exports = router;
