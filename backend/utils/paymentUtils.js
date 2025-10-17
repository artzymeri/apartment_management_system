const db = require('../models');

/**
 * Generate payment records for a tenant from property creation date to current month
 * @param {number} tenantId - The tenant's user ID
 * @param {number} propertyId - The property ID
 * @param {number} monthlyRate - The monthly rate amount
 * @returns {Promise<number>} Number of payment records created
 */
async function generatePaymentRecords(tenantId, propertyId, monthlyRate) {
  try {
    if (!monthlyRate || monthlyRate <= 0) {
      console.log('No monthly rate set, skipping payment generation');
      return 0;
    }

    // Get the property creation date
    const property = await db.Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Get tenant creation date
    const tenant = await db.User.findByPk(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const propertyCreatedAt = new Date(property.created_at);
    const tenantCreatedAt = new Date(tenant.created_at);

    // Start from whichever is later: property creation or tenant creation
    const startDate = propertyCreatedAt > tenantCreatedAt ? propertyCreatedAt : tenantCreatedAt;

    // Get first day of the start month
    const firstPaymentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    // Get first day of current month
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Generate payment records for each month
    let currentPaymentMonth = new Date(firstPaymentMonth);
    let createdCount = 0;

    while (currentPaymentMonth <= currentMonth) {
      const monthStr = currentPaymentMonth.toISOString().split('T')[0];

      // Check if record already exists
      const [payment, created] = await db.TenantPayment.findOrCreate({
        where: {
          tenant_id: tenantId,
          property_id: propertyId,
          payment_month: monthStr
        },
        defaults: {
          amount: monthlyRate,
          status: 'pending'
        }
      });

      if (created) {
        createdCount++;
      }

      // Move to next month
      currentPaymentMonth.setMonth(currentPaymentMonth.getMonth() + 1);
    }

    return createdCount;
  } catch (error) {
    console.error('Error generating payment records:', error);
    throw error;
  }
}

/**
 * Update existing payment records amount when monthly rate changes
 * @param {number} tenantId - The tenant's user ID
 * @param {number} propertyId - The property ID
 * @param {number} newMonthlyRate - The new monthly rate amount
 * @returns {Promise<number>} Number of payment records updated
 */
async function updatePaymentRecordsAmount(tenantId, propertyId, newMonthlyRate) {
  try {
    if (!newMonthlyRate || newMonthlyRate <= 0) {
      return 0;
    }

    // Update only future and pending payments
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = currentMonth.toISOString().split('T')[0];

    const [updatedCount] = await db.TenantPayment.update(
      { amount: newMonthlyRate },
      {
        where: {
          tenant_id: tenantId,
          property_id: propertyId,
          payment_month: { [db.sequelize.Op.gte]: monthStr },
          status: 'pending'
        }
      }
    );

    return updatedCount;
  } catch (error) {
    console.error('Error updating payment records amount:', error);
    throw error;
  }
}

/**
 * Check and update overdue payments
 * Automatically marks pending payments as overdue if they're past due
 * @returns {Promise<number>} Number of payments marked as overdue
 */
async function updateOverduePayments() {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];

    const [updatedCount] = await db.TenantPayment.update(
      { status: 'overdue' },
      {
        where: {
          payment_month: { [db.sequelize.Op.lt]: lastMonthStr },
          status: 'pending'
        }
      }
    );

    return updatedCount;
  } catch (error) {
    console.error('Error updating overdue payments:', error);
    throw error;
  }
}

/**
 * Generate payment records for the new month (cron job function)
 * Should be run on the 1st of each month
 * @returns {Promise<Object>} Summary of generated payments
 */
async function generateNewMonthPayments() {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = currentMonth.toISOString().split('T')[0];

    // Get all active tenants with monthly rates
    const tenants = await db.User.findAll({
      where: {
        role: 'tenant',
        monthly_rate: { [db.sequelize.Op.gt]: 0 }
      }
    });

    let createdCount = 0;
    const errors = [];

    for (const tenant of tenants) {
      if (!tenant.property_ids || tenant.property_ids.length === 0) {
        continue;
      }

      for (const propertyId of tenant.property_ids) {
        try {
          // Check if payment already exists for this month
          const [payment, created] = await db.TenantPayment.findOrCreate({
            where: {
              tenant_id: tenant.id,
              property_id: propertyId,
              payment_month: monthStr
            },
            defaults: {
              amount: tenant.monthly_rate,
              status: 'pending'
            }
          });

          if (created) {
            createdCount++;
          }
        } catch (err) {
          errors.push({
            tenant_id: tenant.id,
            property_id: propertyId,
            error: err.message
          });
        }
      }
    }

    return {
      success: true,
      month: monthStr,
      created: createdCount,
      errors: errors
    };
  } catch (error) {
    console.error('Error generating new month payments:', error);
    throw error;
  }
}

module.exports = {
  generatePaymentRecords,
  updatePaymentRecordsAmount,
  updateOverduePayments,
  generateNewMonthPayments
};

