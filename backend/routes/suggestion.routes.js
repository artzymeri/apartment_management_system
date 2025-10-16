const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestion.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Tenant routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles('tenant'),
  suggestionController.createSuggestion
);

router.get(
  '/my-suggestions',
  authenticateToken,
  authorizeRoles('tenant'),
  suggestionController.getTenantSuggestions
);

router.get(
  '/properties',
  authenticateToken,
  authorizeRoles('tenant'),
  suggestionController.getTenantProperties
);

// Property Manager routes
router.get(
  '/manager',
  authenticateToken,
  authorizeRoles('property_manager'),
  suggestionController.getPropertyManagerSuggestions
);

router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('property_manager'),
  suggestionController.updateSuggestionStatus
);

module.exports = router;

