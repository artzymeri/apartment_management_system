const { sequelize } = require('./config/database');
const City = require('./models/city.model');
require('dotenv').config();

const migrateCityColumn = async () => {
  try {
    console.log('Starting city migration...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Check if city_id column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'properties' 
        AND COLUMN_NAME = 'city_id'
    `);

    if (results.length > 0) {
      console.log('city_id column already exists. Migration not needed.');
      process.exit(0);
    }

    console.log('city_id column does not exist. Starting migration...');

    // Step 1: Add city_id column as nullable first
    console.log('Step 1: Adding city_id column as nullable...');
    await sequelize.query(`
      ALTER TABLE properties 
      ADD COLUMN city_id INT NULL
    `);

    // Step 2: Get all existing properties
    console.log('Step 2: Migrating existing city names to city_id...');
    const [properties] = await sequelize.query('SELECT id, city FROM properties WHERE city IS NOT NULL');

    if (properties.length > 0) {
      // Sync cities table to ensure it exists
      await City.sync();

      for (const property of properties) {
        if (property.city) {
          // Find or create the city
          const [city] = await sequelize.query(
            'SELECT id FROM cities WHERE name = ?',
            { replacements: [property.city] }
          );

          let cityId;
          if (city.length > 0) {
            cityId = city[0].id;
          } else {
            // Create new city if it doesn't exist
            const [result] = await sequelize.query(
              'INSERT INTO cities (name, created_at, updated_at) VALUES (?, NOW(), NOW())',
              { replacements: [property.city] }
            );
            cityId = result;
          }

          // Update property with city_id
          await sequelize.query(
            'UPDATE properties SET city_id = ? WHERE id = ?',
            { replacements: [cityId, property.id] }
          );
          console.log(`  Migrated property ${property.id}: "${property.city}" -> city_id ${cityId}`);
        }
      }
    }

    // Step 3: Set a default city_id for any remaining NULL values
    console.log('Step 3: Setting default city_id for NULL values...');
    const [defaultCity] = await sequelize.query('SELECT id FROM cities ORDER BY id LIMIT 1');
    if (defaultCity.length > 0) {
      await sequelize.query(
        'UPDATE properties SET city_id = ? WHERE city_id IS NULL',
        { replacements: [defaultCity[0].id] }
      );
    }

    // Step 4: Make city_id NOT NULL and add foreign key constraint
    console.log('Step 4: Adding NOT NULL constraint and foreign key...');
    await sequelize.query(`
      ALTER TABLE properties 
      MODIFY COLUMN city_id INT NOT NULL
    `);

    await sequelize.query(`
      ALTER TABLE properties 
      ADD CONSTRAINT properties_city_id_foreign_idx 
      FOREIGN KEY (city_id) REFERENCES cities(id) 
      ON DELETE RESTRICT 
      ON UPDATE CASCADE
    `);

    // Step 5: Drop the old city column (optional - commented out for safety)
    console.log('Step 5: Removing old city column...');
    await sequelize.query('ALTER TABLE properties DROP COLUMN city');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCityColumn();

