const db = require('../models');
const SpendingConfig = db.SpendingConfig;
const Property = db.Property;

// Get all spending configs created by the current property manager
exports.getMySpendingConfigs = async (req, res) => {
  try {
    const userId = req.user.id;

    const spendingConfigs = await SpendingConfig.findAll({
      where: { created_by_user_id: userId },
      include: [{
        model: Property,
        as: 'properties',
        attributes: ['id', 'name', 'address'],
        through: { attributes: [] }
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(spendingConfigs);
  } catch (error) {
    console.error('Get spending configs error:', error);
    res.status(500).json({ message: 'Error fetching spending configs', error: error.message });
  }
};

// Create a new spending config
exports.createSpendingConfig = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const spendingConfig = await SpendingConfig.create({
      title: title.trim(),
      description: description?.trim() || null,
      created_by_user_id: userId
    });

    res.status(201).json(spendingConfig);
  } catch (error) {
    console.error('Create spending config error:', error);
    res.status(500).json({ message: 'Error creating spending config', error: error.message });
  }
};

// Update a spending config
exports.updateSpendingConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const spendingConfig = await SpendingConfig.findOne({
      where: { id, created_by_user_id: userId }
    });

    if (!spendingConfig) {
      return res.status(404).json({ message: 'Spending config not found or unauthorized' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    await spendingConfig.update({
      title: title.trim(),
      description: description?.trim() || null
    });

    res.status(200).json(spendingConfig);
  } catch (error) {
    console.error('Update spending config error:', error);
    res.status(500).json({ message: 'Error updating spending config', error: error.message });
  }
};

// Delete a spending config
exports.deleteSpendingConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const spendingConfig = await SpendingConfig.findOne({
      where: { id, created_by_user_id: userId }
    });

    if (!spendingConfig) {
      return res.status(404).json({ message: 'Spending config not found or unauthorized' });
    }

    await spendingConfig.destroy();

    res.status(200).json({ message: 'Spending config deleted successfully' });
  } catch (error) {
    console.error('Delete spending config error:', error);
    res.status(500).json({ message: 'Error deleting spending config', error: error.message });
  }
};

// Get spending configs for a specific property
exports.getPropertySpendingConfigs = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Verify user manages this property
    const property = await Property.findOne({
      where: { id: propertyId },
      include: [{
        model: db.User,
        as: 'managers',
        where: { id: userId },
        through: { attributes: [] }
      }]
    });

    if (!property) {
      return res.status(403).json({ message: 'Unauthorized to access this property' });
    }

    const spendingConfigs = await SpendingConfig.findAll({
      include: [{
        model: Property,
        as: 'properties',
        where: { id: propertyId },
        through: { attributes: [] }
      }]
    });

    res.status(200).json(spendingConfigs);
  } catch (error) {
    console.error('Get property spending configs error:', error);
    res.status(500).json({ message: 'Error fetching property spending configs', error: error.message });
  }
};

// Assign spending configs to a property
exports.assignSpendingConfigsToProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { spendingConfigIds } = req.body;
    const userId = req.user.id;

    // Verify user manages this property
    const property = await Property.findOne({
      where: { id: propertyId },
      include: [{
        model: db.User,
        as: 'managers',
        where: { id: userId },
        through: { attributes: [] }
      }]
    });

    if (!property) {
      return res.status(403).json({ message: 'Unauthorized to manage this property' });
    }

    if (!Array.isArray(spendingConfigIds)) {
      return res.status(400).json({ message: 'spendingConfigIds must be an array' });
    }

    // Get all spending configs created by this user
    const userSpendingConfigs = await SpendingConfig.findAll({
      where: { created_by_user_id: userId },
      attributes: ['id']
    });

    const userSpendingConfigIds = userSpendingConfigs.map(sc => sc.id);

    // Filter to only include spending configs that belong to this user
    const validSpendingConfigIds = spendingConfigIds.filter(id =>
      userSpendingConfigIds.includes(id)
    );

    // Set the spending configs for this property
    await property.setSpendingConfigs(validSpendingConfigIds);

    res.status(200).json({
      message: 'Spending configs assigned successfully',
      assignedCount: validSpendingConfigIds.length
    });
  } catch (error) {
    console.error('Assign spending configs error:', error);
    res.status(500).json({ message: 'Error assigning spending configs', error: error.message });
  }
};

