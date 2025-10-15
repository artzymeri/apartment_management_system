const { sequelize } = require('./config/database');
const City = require('./models/city.model');
require('dotenv').config();

const kosovoCities = [
  { id: 1, name: "Prishtina" },
  { id: 2, name: "Prizren" },
  { id: 3, name: "Peja" },
  { id: 4, name: "Gjakova" },
  { id: 5, name: "Mitrovica" },
  { id: 6, name: "Ferizaj" },
  { id: 7, name: "Gjilan" },
  { id: 8, name: "Vushtrri" },
  { id: 9, name: "Podujeva" },
  { id: 10, name: "Rahovec" },
  { id: 11, name: "Suhareka" },
  { id: 12, name: "Malisheva" },
  { id: 13, name: "Lipjan" },
  { id: 14, name: "Kamenica" },
  { id: 15, name: "Skenderaj" },
  { id: 16, name: "Kacanik" },
  { id: 17, name: "Decan" },
  { id: 18, name: "Istog" },
  { id: 19, name: "Dragash" },
  { id: 20, name: "Kline" },
  { id: 21, name: "Shtime" },
  { id: 22, name: "Obiliq" },
  { id: 23, name: "Fushe Kosove" },
  { id: 24, name: "Zvecan" },
  { id: 25, name: "Leposavic" },
  { id: 26, name: "Zubin Potok" },
  { id: 27, name: "Junik" },
  { id: 28, name: "Hani i Elezit" },
  { id: 29, name: "Mamushë" },
  { id: 30, name: "Shtërpcë" },
  { id: 31, name: "Gracanica" },
  { id: 32, name: "Partesh" },
  { id: 33, name: "Ranillug" },
  { id: 34, name: "Kllokot" }
];

const initializeCities = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Check if cities table exists by querying it
    console.log('Checking if cities table exists...');
    try {
      await sequelize.query('SELECT 1 FROM cities LIMIT 1');
      console.log('Cities table already exists.');
    } catch (error) {
      // Table doesn't exist, create it
      console.log('Cities table does not exist. Creating...');
      await City.sync();
      console.log('Cities table created successfully.');
    }

    // Check if cities are already populated
    const count = await City.count();

    if (count === 0) {
      console.log('Cities table is empty. Inserting Kosovo cities...');

      // Insert cities with specific IDs
      for (const city of kosovoCities) {
        await sequelize.query(
          'INSERT INTO cities (id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name)',
          {
            replacements: [city.id, city.name]
          }
        );
      }

      console.log(`Successfully inserted ${kosovoCities.length} cities.`);
    } else {
      console.log(`Cities table already has ${count} entries. Skipping insertion.`);
    }

    console.log('City initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing cities:', error);
    process.exit(1);
  }
};

initializeCities();

