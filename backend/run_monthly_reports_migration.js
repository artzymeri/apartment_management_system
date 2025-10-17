const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_monthly_reports_table.sql'),
      'utf8'
    );

    console.log('Running migration: add_monthly_reports_table.sql');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 60) + '...');
      await sequelize.query(statement);
      console.log('✓ Success');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('The monthly_reports table has been created.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    // Check if table already exists
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      console.log('ℹ️  The monthly_reports table already exists. Migration skipped.');
      process.exit(0);
    }

    process.exit(1);
  }
}

// Connect and run migration
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return runMigration();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
