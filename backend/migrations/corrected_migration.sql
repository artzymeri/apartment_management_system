-- ============================================================================
-- CORRECTED MIGRATION: privileged -> property_manager
-- Date: 2025-10-15
-- Description: Fixed migration that only updates existing columns
-- ============================================================================

USE apartment_management;

-- ============================================================================
-- STEP 1: Show current state
-- ============================================================================
SELECT '=== BEFORE MIGRATION ===' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role;
DESCRIBE properties;

-- ============================================================================
-- STEP 2: Update existing user data
-- ============================================================================
SELECT '=== Updating user data ===' as status;

UPDATE users
SET role = 'property_manager'
WHERE role = 'privileged';

SELECT CONCAT('Updated ', ROW_COUNT(), ' user records') as result;

-- ============================================================================
-- STEP 3: Modify ENUM column in users table
-- ============================================================================
SELECT '=== Modifying users table ENUM ===' as status;

ALTER TABLE users
MODIFY COLUMN role ENUM('admin', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

SELECT 'Users table role ENUM updated successfully' as result;

-- ============================================================================
-- STEP 4: Rename privileged_user_id column in properties table
-- ============================================================================
SELECT '=== Renaming column in properties table ===' as status;

ALTER TABLE properties
CHANGE COLUMN privileged_user_id property_manager_user_id INT NULL;

SELECT 'Properties table column renamed successfully' as result;

-- ============================================================================
-- STEP 5: Verification
-- ============================================================================
SELECT '=== AFTER MIGRATION - VERIFICATION ===' as status;

SELECT role, COUNT(*) as count FROM users GROUP BY role;

SELECT 'Remaining privileged users (should be 0):' as check_description, COUNT(*) as count
FROM users WHERE role = 'privileged';

SHOW COLUMNS FROM users LIKE 'role';
SHOW COLUMNS FROM properties LIKE '%manager%';

SELECT '=== MIGRATION COMPLETED SUCCESSFULLY ===' as status;

