const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TenantPayment = sequelize.define('TenantPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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
  payment_month: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'First day of the month for this payment'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    allowNull: false,
    defaultValue: 'pending'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Actual date when payment was marked as paid'
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
  tableName: 'tenant_payments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['tenant_id', 'property_id', 'payment_month'],
      name: 'unique_tenant_property_month'
    },
    {
      fields: ['tenant_id'],
      name: 'idx_tenant_id'
    },
    {
      fields: ['property_id'],
      name: 'idx_property_id'
    },
    {
      fields: ['payment_month'],
      name: 'idx_payment_month'
    },
    {
      fields: ['status'],
      name: 'idx_status'
    }
  ]
});

module.exports = TenantPayment;

