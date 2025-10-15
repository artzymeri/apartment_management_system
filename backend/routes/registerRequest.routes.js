const express = require('express');
const router = express.Router();
const registerRequestController = require('../controllers/registerRequest.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Get all register requests
router.get('/', registerRequestController.getAllRegisterRequests);

// Get single register request
router.get('/:id', registerRequestController.getRegisterRequestById);

// Approve register request
router.post('/:id/approve', registerRequestController.approveRegisterRequest);

// Reject register request
router.post('/:id/reject', registerRequestController.rejectRegisterRequest);

// Delete register request
router.delete('/:id', registerRequestController.deleteRegisterRequest);

module.exports = router;
