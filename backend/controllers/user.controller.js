const db = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Get all users with filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const where = {};

    // Search filter (name, surname, or email)
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { surname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Role filter - supports multiple roles (comma-separated)
    if (role) {
      const roles = role.split(',').filter(r => r.trim());
      if (roles.length > 0) {
        where.role = roles.length === 1 ? roles[0] : { [Op.in]: roles };
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.User.findAndCountAll({
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email, password, number, role, property_ids, expiry_date } = req.body;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      // Check in users table
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already used'
        });
      }

      // Check in register_requests table
      const existingRequest = await db.RegisterRequest.findOne({ where: { email } });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Email is already used'
        });
      }
    }

    // Check if phone number is being changed and if it already exists
    if (number && number !== user.number) {
      // Check in users table
      const existingUserByPhone = await db.User.findOne({ where: { number } });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already used'
        });
      }

      // Check in register_requests table
      const existingRequestByPhone = await db.RegisterRequest.findOne({ where: { number } });
      if (existingRequestByPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already used'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      number: number !== undefined ? number : user.number,
      role: role || user.role,
      property_ids: property_ids !== undefined ? property_ids : user.property_ids
    };

    // Handle expiry_date - only for privileged users
    if (role === 'privileged' || (user.role === 'privileged' && !role)) {
      updateData.expiry_date = expiry_date !== undefined ? expiry_date : user.expiry_date;
    } else {
      // Clear expiry_date if user is not privileged
      updateData.expiry_date = null;
    }

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Return user without password
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (req.user && req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Update own profile (for authenticated users)
exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated token
    const { name, surname, email, password, number, currentPassword } = req.body;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If changing password, verify current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }

      const existingRequest = await db.RegisterRequest.findOne({ where: { email } });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    // Check if phone number is being changed and if it already exists
    if (number && number !== user.number) {
      const existingUserByPhone = await db.User.findOne({ where: { number } });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }

      const existingRequestByPhone = await db.RegisterRequest.findOne({ where: { number } });
      if (existingRequestByPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      number: number !== undefined ? number : user.number
    };

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Return user without password
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
