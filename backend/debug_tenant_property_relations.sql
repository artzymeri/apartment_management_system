-- Debug script to check tenant and property manager relationships

-- 1. Check all property managers and their assigned properties
SELECT
    u.id as manager_id,
    u.name,
    u.surname,
    u.email,
    u.role,
    pm.property_id,
    p.name as property_name
FROM users u
LEFT JOIN property_managers pm ON u.id = pm.user_id
LEFT JOIN properties p ON pm.property_id = p.id
WHERE u.role = 'property_manager'
ORDER BY u.id, pm.property_id;

-- 2. Check all tenants and their assigned properties
SELECT
    id as tenant_id,
    name,
    surname,
    email,
    role,
    property_ids,
    floor_assigned
FROM users
WHERE role = 'tenant'
ORDER BY id;

-- 3. Check property_managers junction table
SELECT * FROM property_managers ORDER BY user_id, property_id;

-- 4. Check all properties
SELECT
    id,
    name,
    address,
    property_manager_user_id as deprecated_manager_id
FROM properties
ORDER BY id;

-- 5. Check if there are tenants with property_id 3
SELECT
    id,
    name,
    surname,
    email,
    property_ids
FROM users
WHERE role = 'tenant'
AND JSON_CONTAINS(property_ids, '3', '$')
ORDER BY id;

-- 6. Check property managers assigned to property 3
SELECT
    pm.id,
    pm.user_id as manager_user_id,
    pm.property_id,
    u.name as manager_name,
    u.email as manager_email,
    p.name as property_name
FROM property_managers pm
JOIN users u ON pm.user_id = u.id
JOIN properties p ON pm.property_id = p.id
WHERE pm.property_id = 3;

