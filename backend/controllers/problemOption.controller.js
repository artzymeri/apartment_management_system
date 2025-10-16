const db = require('../models');
const ProblemOption = db.ProblemOption;
const PropertyProblemOption = db.PropertyProblemOption;
const Property = db.Property;
const PropertyManager = db.PropertyManager;

// Get all problem options created by the property manager
exports.getMyProblemOptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const problemOptions = await ProblemOption.findAll({
      where: { created_by_user_id: userId },
      order: [['created_at', 'DESC']],
      include: [{
        model: Property,
        as: 'properties',
        through: { attributes: [] }
      }]
    });

    res.status(200).json(problemOptions);
  } catch (error) {
    console.error('Error fetching problem options:', error);
    res.status(500).json({ message: 'Error fetching problem options', error: error.message });
  }
};

// Create a new problem option
exports.createProblemOption = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const problemOption = await ProblemOption.create({
      title: title.trim(),
      description: description?.trim() || null,
      created_by_user_id: userId
    });

    res.status(201).json(problemOption);
  } catch (error) {
    console.error('Error creating problem option:', error);
    res.status(500).json({ message: 'Error creating problem option', error: error.message });
  }
};

// Update a problem option
exports.updateProblemOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const problemOption = await ProblemOption.findOne({
      where: { id, created_by_user_id: userId }
    });

    if (!problemOption) {
      return res.status(404).json({ message: 'Problem option not found or unauthorized' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    await problemOption.update({
      title: title.trim(),
      description: description?.trim() || null
    });

    res.status(200).json(problemOption);
  } catch (error) {
    console.error('Error updating problem option:', error);
    res.status(500).json({ message: 'Error updating problem option', error: error.message });
  }
};

// Delete a problem option
exports.deleteProblemOption = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const problemOption = await ProblemOption.findOne({
      where: { id, created_by_user_id: userId }
    });

    if (!problemOption) {
      return res.status(404).json({ message: 'Problem option not found or unauthorized' });
    }

    await problemOption.destroy();

    res.status(200).json({ message: 'Problem option deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem option:', error);
    res.status(500).json({ message: 'Error deleting problem option', error: error.message });
  }
};

// Assign problem options to a property
exports.assignProblemOptionsToProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { problemOptionIds } = req.body;
    const userId = req.user.id;

    // Verify the user manages this property
    const isManager = await PropertyManager.findOne({
      where: { property_id: propertyId, user_id: userId }
    });

    if (!isManager) {
      return res.status(403).json({ message: 'Unauthorized: You do not manage this property' });
    }

    // Verify all problem options belong to the user
    const problemOptions = await ProblemOption.findAll({
      where: {
        id: problemOptionIds,
        created_by_user_id: userId
      }
    });

    if (problemOptions.length !== problemOptionIds.length) {
      return res.status(400).json({ message: 'Some problem options not found or unauthorized' });
    }

    // Remove existing assignments
    await PropertyProblemOption.destroy({
      where: { property_id: propertyId }
    });

    // Create new assignments
    if (problemOptionIds.length > 0) {
      const assignments = problemOptionIds.map(problemOptionId => ({
        property_id: propertyId,
        problem_option_id: problemOptionId
      }));

      await PropertyProblemOption.bulkCreate(assignments);
    }

    // Fetch updated property with problem options
    const property = await Property.findByPk(propertyId, {
      include: [{
        model: ProblemOption,
        as: 'problemOptions',
        through: { attributes: [] }
      }]
    });

    res.status(200).json(property);
  } catch (error) {
    console.error('Error assigning problem options:', error);
    res.status(500).json({ message: 'Error assigning problem options', error: error.message });
  }
};

// Get problem options for a specific property
exports.getPropertyProblemOptions = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Verify the user manages this property
    const isManager = await PropertyManager.findOne({
      where: { property_id: propertyId, user_id: userId }
    });

    if (!isManager) {
      return res.status(403).json({ message: 'Unauthorized: You do not manage this property' });
    }

    const property = await Property.findByPk(propertyId, {
      include: [{
        model: ProblemOption,
        as: 'problemOptions',
        through: { attributes: [] }
      }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property.problemOptions);
  } catch (error) {
    console.error('Error fetching property problem options:', error);
    res.status(500).json({ message: 'Error fetching property problem options', error: error.message });
  }
};
