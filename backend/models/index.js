const { sequelize } = require('../config/database');
const User = require('./user.model');
const RegisterRequest = require('./registerRequest.model');
const Property = require('./property.model');
const PropertyManager = require('./propertyManager.model');
const City = require('./city.model');

const db = {};

db.sequelize = sequelize;
db.User = User;
db.RegisterRequest = RegisterRequest;
db.Property = Property;
db.PropertyManager = PropertyManager;
db.City = City;

// Define relationships
// Property belongs to User (property manager) - DEPRECATED, kept for backward compatibility
Property.belongsTo(User, {
  foreignKey: 'property_manager_user_id',
  as: 'manager'
});

// User has many Properties - DEPRECATED
User.hasMany(Property, {
  foreignKey: 'property_manager_user_id',
  as: 'managedProperties'
});

// Many-to-Many: Property has many Managers (Users) through PropertyManager
Property.belongsToMany(User, {
  through: PropertyManager,
  foreignKey: 'property_id',
  otherKey: 'user_id',
  as: 'managers'
});

// Many-to-Many: User (manager) has many Properties through PropertyManager
User.belongsToMany(Property, {
  through: PropertyManager,
  foreignKey: 'user_id',
  otherKey: 'property_id',
  as: 'managedPropertiesMany'
});

// City relationship with Property
Property.belongsTo(City, {
  foreignKey: 'city_id',
  as: 'cityDetails'
});

City.hasMany(Property, {
  foreignKey: 'city_id',
  as: 'properties'
});

module.exports = db;
