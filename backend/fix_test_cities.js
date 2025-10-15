const { sequelize } = require('./config/database');
require('dotenv').config();

const cleanupTestCities = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');

    // Step 1: Find properties using test cities
    console.log('Step 1: Finding properties using test cities (35, 36)...');
    const [properties] = await sequelize.query(
      'SELECT id, title, city_id FROM properties WHERE city_id IN (35, 36)'
    );

    if (properties.length > 0) {
      console.log(`Found ${properties.length} properties using test cities:`);
      properties.forEach(p => console.log(`  - Property ${p.id}: "${p.title}" (city_id: ${p.city_id})`));

      // Step 2: Update properties to use Prishtina
      console.log('\nStep 2: Updating properties to use Prishtina (city_id: 1)...');
      const [updateResult] = await sequelize.query(
        'UPDATE properties SET city_id = 1 WHERE city_id IN (35, 36)'
      );
      console.log(`✓ Updated ${properties.length} properties`);
    } else {
      console.log('No properties found using test cities');
    }

    // Step 3: Delete test cities
    console.log('\nStep 3: Deleting test cities...');
    await sequelize.query('DELETE FROM cities WHERE id = 35');
    console.log('✓ Deleted city ID 35 ("City")');

    await sequelize.query('DELETE FROM cities WHERE id = 36');
    console.log('✓ Deleted city ID 36 ("Test")');

    // Step 4: Verify cleanup
    console.log('\nStep 4: Verifying cleanup...');
    const [remainingTestCities] = await sequelize.query(
      'SELECT id, name FROM cities WHERE id IN (35, 36)'
    );

    if (remainingTestCities.length === 0) {
      console.log('✓ Test cities successfully removed');
    } else {
      console.log('⚠ Test cities still exist:', remainingTestCities);
    }

    const [cityCount] = await sequelize.query('SELECT COUNT(*) as count FROM cities');
    console.log(`\n✅ SUCCESS: Database now has ${cityCount[0].count} cities (only legitimate Kosovo cities)`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.parent) {
      console.error('SQL Error:', error.parent.sqlMessage);
    }
    await sequelize.close();
    process.exit(1);
  }
};

cleanupTestCities();

