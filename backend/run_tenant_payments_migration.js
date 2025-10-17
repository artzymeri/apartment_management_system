const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'apartment_management',
    multipleStatements: true
  });

  try {
    console.log('Connected to database');

    // Read and execute migration
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create_tenant_payments_table.sql'),
      'utf8'
    );

    console.log('Running migration...');
    await connection.query(migrationSQL);
    console.log('✓ Migration completed successfully');

    // Generate initial payment records for existing tenants
    console.log('\nGenerating initial payment records for existing tenants...');

    const [tenants] = await connection.query(`
      SELECT u.id as tenant_id, u.property_ids, u.monthly_rate, u.created_at, p.created_at as property_created_at
      FROM users u
      JOIN properties p ON JSON_CONTAINS(u.property_ids, CAST(p.id AS JSON), '$')
      WHERE u.role = 'tenant' 
        AND u.monthly_rate IS NOT NULL 
        AND u.monthly_rate > 0
    `);

    if (tenants.length === 0) {
      console.log('No tenants with monthly rates found. Migration complete.');
      await connection.end();
      return;
    }

    console.log(`Found ${tenants.length} tenant-property relationships`);

    // For each tenant, generate payment records from property creation date to current month
    for (const tenant of tenants) {
      const propertyIds = JSON.parse(tenant.property_ids);

      for (const propertyId of propertyIds) {
        // Get the property creation date
        const [properties] = await connection.query(
          'SELECT created_at FROM properties WHERE id = ?',
          [propertyId]
        );

        if (properties.length === 0) continue;

        const propertyCreatedAt = new Date(properties[0].created_at);
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

        while (currentPaymentMonth <= currentMonth) {
          const monthStr = currentPaymentMonth.toISOString().split('T')[0];

          // Check if record already exists
          const [existing] = await connection.query(
            'SELECT id FROM tenant_payments WHERE tenant_id = ? AND property_id = ? AND payment_month = ?',
            [tenant.tenant_id, propertyId, monthStr]
          );

          if (existing.length === 0) {
            // Insert payment record with pending status
            await connection.query(
              'INSERT INTO tenant_payments (tenant_id, property_id, payment_month, amount, status) VALUES (?, ?, ?, ?, ?)',
              [tenant.tenant_id, propertyId, monthStr, tenant.monthly_rate, 'pending']
            );
          }

          // Move to next month
          currentPaymentMonth.setMonth(currentPaymentMonth.getMonth() + 1);
        }
      }
    }

    console.log('✓ Initial payment records generated successfully');

    // Show summary
    const [summary] = await connection.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM tenant_payments
      GROUP BY status
    `);

    console.log('\nPayment Records Summary:');
    console.table(summary);

    await connection.end();
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    await connection.end();
    process.exit(1);
  }
}

runMigration();

