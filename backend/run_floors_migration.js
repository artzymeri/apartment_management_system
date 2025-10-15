const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    console.log('Running floors migration...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'add_floors_to_properties.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and filter out comments and empty lines
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sequelize.query(statement);
      }
    }

    console.log('Migration completed successfully!');

    // Verify the column was added
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'properties'
        AND COLUMN_NAME = 'floors';
    `);

    if (results.length > 0) {
      console.log('\nFloors column details:');
      console.log(results[0]);
    } else {
      console.log('\nWarning: Could not verify floors column.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();

