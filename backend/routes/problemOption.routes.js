const express = require('express');
const router = express.Router();
const problemOptionController = require('../controllers/problemOption.controller');
const { verifyToken, isAdminOrPropertyManager } = require('../middleware/auth.middleware');

// All routes require authentication and property manager role
router.use(verifyToken, isAdminOrPropertyManager);

// Problem option CRUD routes
router.get('/', problemOptionController.getMyProblemOptions);
router.post('/', problemOptionController.createProblemOption);
router.put('/:id', problemOptionController.updateProblemOption);
router.delete('/:id', problemOptionController.deleteProblemOption);

// Property-specific routes
router.get('/property/:propertyId', problemOptionController.getPropertyProblemOptions);
router.post('/property/:propertyId/assign', problemOptionController.assignProblemOptionsToProperty);

module.exports = router;
