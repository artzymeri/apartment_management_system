const db = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Get all register requests with filtering
exports.getAllRegisterRequests = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const where = {};

    // Search filter (name, surname, or email)
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { surname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.RegisterRequest.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get register requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching register requests',
      error: error.message
    });
  }
};

// Get single register request by ID
exports.getRegisterRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await db.RegisterRequest.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Register request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get register request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching register request',
      error: error.message
    });
  }
};

// Approve register request (create user and delete request)
exports.approveRegisterRequest = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { role = 'tenant', property_ids = [], expiry_date } = req.body;

    const request = await db.RegisterRequest.findByPk(id);

    if (!request) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Register request not found'
      });
    }

    if (request.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Check if email already exists in users table
    const existingUser = await db.User.findOne({ where: { email: request.email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email is already used'
      });
    }

    // Check if phone number already exists in users table (if provided)
    if (request.number) {
      const existingUserByPhone = await db.User.findOne({ where: { number: request.number } });
      if (existingUserByPhone) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Phone number is already used'
        });
      }
    }

    // Prepare user data
    const userData = {
      name: request.name,
      surname: request.surname,
      email: request.email,
      password: request.password, // Already hashed from registration
      number: request.number,
      role: role,
      property_ids: property_ids
    };

    // Add expiry_date only for property_manager users
    if (role === 'property_manager') {
      userData.expiry_date = expiry_date || null;
    }

    // Create new user with the register request data
    const newUser = await db.User.create(userData, { transaction });

    // Delete the request from register_requests table
    await request.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Register request approved and user created successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Approve register request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving register request',
      error: error.message
    });
  }
};

// Reject register request (delete it from database)
exports.rejectRegisterRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await db.RegisterRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Register request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Delete the request from database
    await request.destroy();

    res.status(200).json({
      success: true,
      message: 'Register request rejected and deleted successfully'
    });
  } catch (error) {
    console.error('Reject register request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting register request',
      error: error.message
    });
  }
};

// Delete register request
exports.deleteRegisterRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await db.RegisterRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Register request not found'
      });
    }

    await request.destroy();

    res.status(200).json({
      success: true,
      message: 'Register request deleted successfully'
    });
  } catch (error) {
    console.error('Delete register request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting register request',
      error: error.message
    });
  }
};
