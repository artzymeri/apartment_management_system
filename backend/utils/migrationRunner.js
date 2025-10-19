const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

/**
 * Creates a table to track executed migrations
 */
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sequelize.query(query);
  console.log('✓ Migrations tracking table ready');
}

/**
 * Gets list of already executed migrations
 */
async function getExecutedMigrations() {
  try {
    const [results] = await sequelize.query('SELECT filename FROM migrations ORDER BY filename');
    return results.map(row => row.filename);
  } catch (error) {
    return [];
  }
}

/**
 * Marks a migration as executed
 */
async function markMigrationAsExecuted(filename) {
  await sequelize.query('INSERT INTO migrations (filename) VALUES (?)', {
    replacements: [filename]
  });
}

/**
 * Runs all pending migrations
 */
async function runMigrations() {
  try {
    console.log('\n🔄 Checking for pending migrations...\n');

    // Create migrations tracking table if it doesn't exist
    await createMigrationsTable();

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Get all migration files from the migrations directory
    const migrationsDir = path.join(__dirname, '../migrations');
    const allMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order

    // Find pending migrations
    const pendingMigrations = allMigrationFiles.filter(
      file => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✓ No pending migrations. Database is up to date.\n');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s):\n`);

    let successCount = 0;
    let failCount = 0;
    const failedMigrations = [];

    // Execute each pending migration
    for (const filename of pendingMigrations) {
      try {
        console.log(`  ⏳ Running: ${filename}`);

        const filePath = path.join(migrationsDir, filename);
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split by semicolons and execute each statement separately
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
          await sequelize.query(statement);
        }

        // Mark as executed only if successful
        await markMigrationAsExecuted(filename);
        console.log(`  ✓ Completed: ${filename}`);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Failed: ${filename}`);
        console.error(`  Error: ${error.message}`);
        failCount++;
        failedMigrations.push({ filename, error: error.message });

        // Check if it's a "safe" error (already exists)
        const safeErrors = [
          'Duplicate column name',
          'Duplicate key name',
          'Duplicate index name',
          'already exists'
        ];

        const isSafeError = safeErrors.some(msg => error.message.includes(msg));

        if (isSafeError) {
          console.log(`  ℹ️  Migration already applied, marking as executed.`);
          await markMigrationAsExecuted(filename);
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  ✓ Successful: ${successCount}`);
    console.log(`  ✗ Failed: ${failCount}`);

    if (failedMigrations.length > 0) {
      console.log(`\n⚠️  Failed migrations (not marked as executed):`);
      failedMigrations.forEach(({ filename, error }) => {
        console.log(`  - ${filename}: ${error}`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('\n✗ Migration error:', error.message);
    throw error;
  }
}

module.exports = { runMigrations };
