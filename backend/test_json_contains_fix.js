const db = require('./models');
const { Op } = require('sequelize');

async function testFixedJSONContains() {
  try {
    console.log('=== Testing Fixed JSON_CONTAINS Query ===\n');

    const managedPropertyIds = [3];

    console.log('Testing with property IDs:', managedPropertyIds);

    // Use Sequelize.literal for JSON_CONTAINS (the fix)
    const jsonContainsConditions = managedPropertyIds.map(propId =>
      db.sequelize.literal(`JSON_CONTAINS(property_ids, '${propId}', '$')`)
    );

    const where = {
      role: 'tenant',
      [Op.or]: jsonContainsConditions
    };

    console.log('\nExecuting query with JSON_CONTAINS...');
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'surname', 'email', 'property_ids', 'floor_assigned'],
      logging: console.log // Show the SQL
    });

    console.log('\n=== RESULTS ===');
    console.log('Total count:', count);
    console.log('Tenants found:');
    rows.forEach(tenant => {
      console.log(`  - ${tenant.name} ${tenant.surname} (${tenant.email})`);
      console.log(`    Property IDs: ${JSON.stringify(tenant.property_ids)}`);
      console.log(`    Floor: ${tenant.floor_assigned}`);
    });

    console.log('\n=== SUCCESS! ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFixedJSONContains();

