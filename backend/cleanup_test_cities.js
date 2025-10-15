const { sequelize } = require('./config/database');
require('dotenv').config();

const cleanupTestCities = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database...\n');

    // Find properties using the test cities
    const [properties] = await sequelize.query('SELECT id, title, city_id FROM properties WHERE city_id IN (35, 36)');

    console.log('Properties using test cities:');
    console.log(JSON.stringify(properties, null, 2));
    console.log(`\nFound ${properties.length} properties using test cities.`);

    if (properties.length > 0) {
      // Update these properties to use Prishtina (id=1) as default
      console.log('\nUpdating properties to use Prishtina (id=1)...');
      await sequelize.query('UPDATE properties SET city_id = 1 WHERE city_id IN (35, 36)');
      console.log(`✅ Updated ${properties.length} properties to use Prishtina`);
    }

    // Now delete the test cities
    console.log('\nDeleting test cities...');
    await sequelize.query('DELETE FROM cities WHERE id IN (35, 36)');
    console.log('✅ Successfully deleted test cities (ID 35: "City" and ID 36: "Test")');

    // Show final count
    const [result] = await sequelize.query('SELECT COUNT(*) as count FROM cities');
    console.log(`\n✅ Database now has ${result[0].count} cities (all legitimate Kosovo cities)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

cleanupTestCities();

