const express = require('express');
const router = express.Router();
const spendingConfigController = require('../controllers/spendingConfig.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// All routes require property_manager role
router.use(verifyToken);
router.use(authorizeRoles('property_manager'));

// CRUD routes
router.get('/', spendingConfigController.getMySpendingConfigs);
router.post('/', spendingConfigController.createSpendingConfig);
router.put('/:id', spendingConfigController.updateSpendingConfig);
router.delete('/:id', spendingConfigController.deleteSpendingConfig);

// Property assignment routes
router.get('/property/:propertyId', spendingConfigController.getPropertySpendingConfigs);
router.post('/property/:propertyId/assign', spendingConfigController.assignSpendingConfigsToProperty);

module.exports = router;

