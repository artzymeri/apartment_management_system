const { sequelize } = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_monthly_rate_to_users.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    console.log('Running migration: add_monthly_rate_to_users.sql');
    console.log('SQL:', migrationSQL);

    // Execute the migration
    await sequelize.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('Added monthly_rate column to users table');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ All migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
