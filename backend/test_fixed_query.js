const db = require('./models');
const { Op } = require('sequelize');

async function testFixedQuery() {
  try {
    console.log('=== Testing Fixed MySQL JSON Query ===\n');

    const managedPropertyIds = [3];

    console.log('Testing with property IDs:', managedPropertyIds);

    // Old query (doesn't work with MySQL)
    console.log('\n1. OLD Query (Op.overlap - PostgreSQL only):');
    try {
      const oldResults = await db.User.findAll({
        where: {
          role: 'tenant',
          property_ids: {
            [Op.overlap]: managedPropertyIds
          }
        },
        attributes: ['id', 'name', 'email', 'property_ids']
      });
      console.log('Results:', oldResults.length);
    } catch (error) {
      console.log('Error:', error.message);
    }

    // New query (works with MySQL)
    console.log('\n2. NEW Query (Op.like - MySQL compatible):');
    const newResults = await db.User.findAll({
      where: {
        role: 'tenant',
        [Op.or]: managedPropertyIds.map(propId => ({
          property_ids: {
            [Op.like]: `%${propId}%`
          }
        }))
      },
      attributes: ['id', 'name', 'email', 'property_ids']
    });
    console.log('Results:', newResults.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      property_ids: t.property_ids
    })));

    console.log('\n=== Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFixedQuery();

