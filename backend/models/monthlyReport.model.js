const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MonthlyReport = sequelize.define('MonthlyReport', {
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
  report_month: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'First day of the month for this report'
  },
  generated_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  total_budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total collected from paid tenants'
  },
  total_tenants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  paid_tenants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  pending_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  spending_breakdown: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON array of spending allocations per config'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'monthly_reports',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['property_id', 'report_month'],
      name: 'unique_property_month_report'
    },
    {
      fields: ['property_id'],
      name: 'idx_report_property_id'
    },
    {
      fields: ['report_month'],
      name: 'idx_report_month'
    },
    {
      fields: ['generated_by_user_id'],
      name: 'idx_generated_by_user_id'
    }
  ]
});

module.exports = MonthlyReport;

