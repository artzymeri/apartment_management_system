const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PropertySpendingConfig = sequelize.define('PropertySpendingConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  spending_config_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spending_configs',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'property_spending_configs',
  timestamps: false,
  underscored: true
});

module.exports = PropertySpendingConfig;

