#!/usr/bin/env node

const { sequelize } = require('./config/database');
const fs = require('fs');
require('dotenv').config();

const logFile = './cleanup_log.txt';
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

const cleanupTestCities = async () => {
  fs.writeFileSync(logFile, '=== Cleanup Test Cities Log ===\n');

  try {
    log('Connecting to database...');
    await sequelize.authenticate();
    log('✓ Connected\n');

    // Check current state
    log('Checking current cities...');
    const [allCities] = await sequelize.query('SELECT id, name FROM cities WHERE id >= 35 ORDER BY id');
    log(`Found ${allCities.length} cities with id >= 35:`);
    allCities.forEach(c => log(`  - ID ${c.id}: ${c.name}`));

    if (allCities.length === 0) {
      log('\n✅ No test cities found. Database is already clean!');
      await sequelize.close();
      return;
    }

    // Find affected properties
    log('\nChecking for properties using test cities (35, 36)...');
    const [properties] = await sequelize.query(
      'SELECT id, title, city_id FROM properties WHERE city_id IN (35, 36)'
    );

    log(`Found ${properties.length} properties using test cities`);
    if (properties.length > 0) {
      properties.forEach(p => log(`  - Property ${p.id}: "${p.title}" (city_id: ${p.city_id})`));

      log('\nUpdating properties to use Prishtina (city_id: 1)...');
      await sequelize.query('UPDATE properties SET city_id = 1 WHERE city_id IN (35, 36)');
      log(`✓ Updated ${properties.length} properties to use Prishtina`);
    }

    // Delete test cities
    log('\nDeleting test cities...');

    const testCityIds = allCities.map(c => c.id);
    for (const id of testCityIds) {
      try {
        await sequelize.query(`DELETE FROM cities WHERE id = ${id}`);
        log(`✓ Deleted city ID ${id}`);
      } catch (err) {
        log(`✗ Failed to delete city ID ${id}: ${err.message}`);
      }
    }

    // Verify
    log('\nVerifying cleanup...');
    const [remaining] = await sequelize.query('SELECT id, name FROM cities WHERE id >= 35');
    const [totalCount] = await sequelize.query('SELECT COUNT(*) as count FROM cities');

    if (remaining.length === 0) {
      log('✓ All test cities removed successfully');
      log(`✅ Database now has ${totalCount[0].count} cities (only Kosovo cities)\n`);
    } else {
      log('⚠ Some test cities still remain:');
      remaining.forEach(c => log(`  - ID ${c.id}: ${c.name}`));
    }

    await sequelize.close();
    log('\nCleanup completed!');

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    if (error.parent) {
      log(`SQL Error: ${error.parent.sqlMessage}`);
    }
    log(error.stack);
  }
};

cleanupTestCities().then(() => {
  console.log('\nLog written to: ' + logFile);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

