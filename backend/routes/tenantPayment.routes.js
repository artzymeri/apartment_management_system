const express = require('express');
const router = express.Router();
const tenantPaymentController = require('../controllers/tenantPayment.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// Get payments for a specific tenant (property manager or admin only)
router.get(
  '/tenant/:tenantId',
  verifyToken,
  authorizeRoles('property_manager', 'admin', 'tenant'),
  tenantPaymentController.getTenantPayments
);

// Get payments for property manager's properties
router.get(
  '/property-manager',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.getPropertyManagerPayments
);

// Get payment statistics for property manager
router.get(
  '/statistics',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.getPaymentStatistics
);

// Update payment status
router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.updatePaymentStatus
);

// Bulk update payment statuses
router.patch(
  '/',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.bulkUpdatePayments
);

// Generate future payment records (for advance payments)
router.post(
  '/generate-future',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.generateFuturePayments
);

// Ensure payment records exist for specific month (creates if missing)
router.post(
  '/ensure-records',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.ensurePaymentRecords
);

// Update payment date
router.patch(
  '/:id/payment-date',
  verifyToken,
  authorizeRoles('property_manager'),
  tenantPaymentController.updatePaymentDate
);

module.exports = router;
