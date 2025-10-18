const jwt = require('jsonwebtoken');
const db = require('../models');

// Verify JWT token from cookies or Authorization header
exports.verifyToken = async (req, res, next) => {
  try {
    // Check for token in cookies first, then in Authorization header
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
      // Extract token from "Bearer TOKEN" format
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is admin or property_manager
exports.isAdminOrPropertyManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'property_manager') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Property Manager privileges required.'
    });
  }
  next();
};

// Check if user is property_manager or admin
exports.isPrivilegedOrAdmin = (req, res, next) => {
  if (req.user.role !== 'property_manager' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Property manager or admin privileges required.'
    });
  }
  next();
};

// Check if user is the owner or admin
exports.isOwnerOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });
  }
  next();
};

// Generic role authorization middleware
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Alias for compatibility
exports.authenticateToken = exports.verifyToken;
