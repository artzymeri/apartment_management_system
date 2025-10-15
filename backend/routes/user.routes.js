const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// Get single user by ID (admin only)
router.get('/:id', isAdmin, userController.getUserById);

// Update user (admin only)
router.put('/:id', isAdmin, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;
