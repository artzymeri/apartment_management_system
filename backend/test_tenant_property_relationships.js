const db = require('./models');
const { Op } = require('sequelize');

async function testTenantPropertyRelationships() {
  try {
    console.log('=== Testing Tenant-Property Manager Relationships ===\n');

    // 1. Check all property managers and their properties
    console.log('1. Property Managers and their assigned properties:');
    const propertyManagers = await db.User.findAll({
      where: { role: 'property_manager' },
      attributes: ['id', 'name', 'surname', 'email', 'property_ids']
    });

    for (const pm of propertyManagers) {
      console.log(`\n  Manager: ${pm.name} ${pm.surname} (ID: ${pm.id})`);
      console.log(`  Email: ${pm.email}`);
      console.log(`  Legacy property_ids field:`, pm.property_ids);

      // Get properties from junction table
      const managedProps = await db.PropertyManager.findAll({
        where: { user_id: pm.id },
        attributes: ['property_id']
      });

      console.log(`  Properties from junction table:`, managedProps.map(mp => mp.property_id));
    }

    // 2. Check all tenants and their properties
    console.log('\n\n2. Tenants and their assigned properties:');
    const tenants = await db.User.findAll({
      where: { role: 'tenant' },
      attributes: ['id', 'name', 'surname', 'email', 'property_ids', 'floor_assigned']
    });

    for (const tenant of tenants) {
      console.log(`\n  Tenant: ${tenant.name} ${tenant.surname} (ID: ${tenant.id})`);
      console.log(`  Email: ${tenant.email}`);
      console.log(`  Property IDs:`, tenant.property_ids);
      console.log(`  Floor:`, tenant.floor_assigned);
    }

    // 3. Test the overlap query for property ID 3
    console.log('\n\n3. Testing overlap query for property ID 3:');
    const managersForProperty3 = await db.PropertyManager.findAll({
      where: { property_id: 3 },
      attributes: ['user_id', 'property_id']
    });

    console.log('  Managers assigned to property 3:', managersForProperty3.map(m => ({
      manager_id: m.user_id,
      property_id: m.property_id
    })));

    // Find tenants with property 3
    const tenantsWithProperty3 = await db.User.findAll({
      where: {
        role: 'tenant',
        property_ids: {
          [Op.overlap]: [3]
        }
      },
      attributes: ['id', 'name', 'surname', 'email', 'property_ids']
    });

    console.log('\n  Tenants with property ID 3 (using overlap):', tenantsWithProperty3.map(t => ({
      tenant_id: t.id,
      name: `${t.name} ${t.surname}`,
      email: t.email,
      property_ids: t.property_ids
    })));

    // 4. Check property_managers junction table
    console.log('\n\n4. All entries in property_managers junction table:');
    const allJunctionEntries = await db.PropertyManager.findAll({
      attributes: ['id', 'user_id', 'property_id']
    });
    console.log(allJunctionEntries.map(entry => entry.toJSON()));

    // 5. Check all properties
    console.log('\n\n5. All properties:');
    const allProperties = await db.Property.findAll({
      attributes: ['id', 'name', 'address']
    });
    console.log(allProperties.map(p => ({ id: p.id, name: p.name })));

    console.log('\n=== Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error testing relationships:', error);
    process.exit(1);
  }
}

testTenantPropertyRelationships();
