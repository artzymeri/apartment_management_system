const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Tenant routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles('tenant'),
  complaintController.createComplaint
);

router.get(
  '/my-complaints',
  authenticateToken,
  authorizeRoles('tenant'),
  complaintController.getTenantComplaints
);

router.get(
  '/properties',
  authenticateToken,
  authorizeRoles('tenant'),
  complaintController.getTenantProperties
);

// Property Manager routes
router.get(
  '/manager',
  authenticateToken,
  authorizeRoles('property_manager'),
  complaintController.getPropertyManagerComplaints
);

router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('property_manager'),
  complaintController.updateComplaintStatus
);

module.exports = router;

