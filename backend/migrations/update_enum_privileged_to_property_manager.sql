-- Complete migration to change 'privileged' to 'property_manager'
-- This updates both data and database schema

-- Step 1: Update all user records with 'privileged' role to 'property_manager'
UPDATE users
SET role = 'property_manager'
WHERE role = 'privileged';

-- Step 2: Update all register_requests with 'privileged' role to 'property_manager'
UPDATE register_requests
SET role = 'property_manager'
WHERE role = 'privileged';

-- Step 3: Modify the ENUM type in users table to replace 'privileged' with 'property_manager'
ALTER TABLE users
MODIFY COLUMN role ENUM('admin', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

-- Step 4: Modify the ENUM type in register_requests table
ALTER TABLE register_requests
MODIFY COLUMN role ENUM('admin', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

-- Verification queries
SELECT 'Users with property_manager role:' as message, COUNT(*) as count
FROM users WHERE role = 'property_manager'
UNION ALL
SELECT 'Register requests with property_manager role:', COUNT(*)
FROM register_requests WHERE role = 'property_manager'
UNION ALL
SELECT 'CHECK - Remaining privileged users (should be 0):', COUNT(*)
FROM users WHERE role = 'privileged'
UNION ALL
SELECT 'CHECK - Remaining privileged requests (should be 0):', COUNT(*)
FROM register_requests WHERE role = 'privileged';

-- Show updated schema
SHOW COLUMNS FROM users LIKE 'role';
SHOW COLUMNS FROM register_requests LIKE 'role';

