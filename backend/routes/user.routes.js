const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin, isAdminOrPropertyManager } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Update own profile (any authenticated user)
router.put('/profile/me', userController.updateOwnProfile);

// Get tenants for property manager (filtered by their managed properties)
router.get('/tenants', isAdminOrPropertyManager, userController.getTenantsForPropertyManager);

// Get single tenant by ID for property manager
router.get('/tenants/:id', isAdminOrPropertyManager, userController.getTenantByIdForPropertyManager);

// Update tenant for property manager
router.put('/tenants/:id', isAdminOrPropertyManager, userController.updateTenantForPropertyManager);

// Delete tenant for property manager
router.delete('/tenants/:id', isAdminOrPropertyManager, userController.deleteTenantForPropertyManager);

// Create user (admin or property_manager can create users)
router.post('/', isAdminOrPropertyManager, userController.createUser);

// Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// Get single user by ID (admin only)
router.get('/:id', isAdmin, userController.getUserById);

// Update user (admin only)
router.put('/:id', isAdmin, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;
