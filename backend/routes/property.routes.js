const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Get managers (property_manager users) for dropdown - MUST be before /:id route
router.get('/managers/list', isAdmin, propertyController.getManagers);

// Get all properties
router.get('/', propertyController.getAllProperties);

// Get single property by ID
router.get('/:id', propertyController.getPropertyById);

// Create property (admin only)
router.post('/', isAdmin, propertyController.createProperty);

// Update property (admin only)
router.put('/:id', isAdmin, propertyController.updateProperty);

// Delete property (admin only)
router.delete('/:id', isAdmin, propertyController.deleteProperty);

module.exports = router;
