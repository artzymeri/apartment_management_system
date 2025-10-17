const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPaymentMonthDates() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'apartment_management'
    });

    console.log('Connected to database');

    // First, show current payment records
    console.log('\n=== CURRENT PAYMENT RECORDS (BEFORE FIX) ===');
    const [beforeRecords] = await connection.execute(
      'SELECT id, tenant_id, property_id, payment_month, amount, status FROM tenant_payments ORDER BY payment_month DESC'
    );
    console.table(beforeRecords);

    // Count records that need fixing (where day is not the 1st)
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM tenant_payments WHERE DAY(payment_month) > 1'
    );
    const recordsToFix = countResult[0].count;

    console.log(`\n Found ${recordsToFix} payment record(s) with incorrect dates (not on 1st of month)`);

    if (recordsToFix === 0) {
      console.log('No records need fixing. All payment dates are already correct.');
      return;
    }

    // Ask for confirmation
    console.log('\nThis will update payment_month by adding 1 day to fix the timezone bug.');
    console.log('Example: 2025-09-30 (Sept 30) -> 2025-10-01 (Oct 1)');
    console.log('         2025-08-31 (Aug 31)  -> 2025-09-01 (Sept 1)');

    // Perform the update
    console.log('\nExecuting update...');
    const [updateResult] = await connection.execute(
      'UPDATE tenant_payments SET payment_month = DATE_ADD(payment_month, INTERVAL 1 DAY) WHERE DAY(payment_month) > 1'
    );

    console.log(`✓ Updated ${updateResult.affectedRows} record(s)`);

    // Show updated records
    console.log('\n=== UPDATED PAYMENT RECORDS (AFTER FIX) ===');
    const [afterRecords] = await connection.execute(
      'SELECT id, tenant_id, property_id, payment_month, amount, status FROM tenant_payments ORDER BY payment_month DESC'
    );
    console.table(afterRecords);

    console.log('\n✓ Migration completed successfully!');
    console.log('All payment dates are now stored correctly as the 1st of each month.');

  } catch (error) {
    console.error('Error fixing payment dates:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the migration
fixPaymentMonthDates()
  .then(() => {
    console.log('\n=== MIGRATION COMPLETE ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== MIGRATION FAILED ===');
    console.error(error);
    process.exit(1);
  });

