const City = require('../models/city.model');

// Get all cities
const getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cities'
    });
  }
};

// Create a new city
const createCity = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City name is required'
      });
    }

    const city = await City.create({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: city
    });
  } catch (error) {
    console.error('Create city error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'City already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create city'
    });
  }
};

// Delete a city
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    await city.destroy();

    res.status(200).json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete city'
    });
  }
};

// Update a city
const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City name is required'
      });
    }

    const city = await City.findByPk(id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    await city.update({ name: name.trim() });

    res.status(200).json({
      success: true,
      message: 'City updated successfully',
      data: city
    });
  } catch (error) {
    console.error('Update city error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'City name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update city'
    });
  }
};

module.exports = {
  getAllCities,
  createCity,
  deleteCity,
  updateCity
};
