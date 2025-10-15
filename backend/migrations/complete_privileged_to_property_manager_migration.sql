-- ============================================================================
-- COMPLETE MIGRATION: privileged -> property_manager
-- Date: 2025-10-15
-- Description: This migration completely renames 'privileged' to 'property_manager'
--              in both data and database schema
-- ============================================================================

USE apartment_management;

-- ============================================================================
-- STEP 1: Backup existing data counts (for verification)
-- ============================================================================
SELECT '=== BEFORE MIGRATION ===' as status;
SELECT 'Users by role:' as info, role, COUNT(*) as count FROM users GROUP BY role;
SELECT 'Register requests by role:' as info, role, COUNT(*) as count FROM register_requests GROUP BY role;

-- ============================================================================
-- STEP 2: Update existing user data
-- ============================================================================
SELECT '=== Updating user data ===' as status;

-- Update users table - change role from 'privileged' to 'property_manager'
UPDATE users
SET role = 'property_manager'
WHERE role = 'privileged';

SELECT CONCAT('Updated ', ROW_COUNT(), ' user records') as result;

-- ============================================================================
-- STEP 3: Update existing register_requests data
-- ============================================================================
SELECT '=== Updating register_requests data ===' as status;

-- Update register_requests table - change role from 'privileged' to 'property_manager'
UPDATE register_requests
SET role = 'property_manager'
WHERE role = 'privileged';

SELECT CONCAT('Updated ', ROW_COUNT(), ' register request records') as result;

-- ============================================================================
-- STEP 4: Modify ENUM columns in users table
-- ============================================================================
SELECT '=== Modifying users table schema ===' as status;

-- Modify the role column ENUM to use 'property_manager' instead of 'privileged'
ALTER TABLE users
MODIFY COLUMN role ENUM('admin', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

SELECT 'Users table role ENUM updated successfully' as result;

-- ============================================================================
-- STEP 5: Modify ENUM columns in register_requests table
-- ============================================================================
SELECT '=== Modifying register_requests table schema ===' as status;

-- Modify the role column ENUM
ALTER TABLE register_requests
MODIFY COLUMN role ENUM('admin', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

SELECT 'Register_requests table role ENUM updated successfully' as result;

-- ============================================================================
-- STEP 6: Rename privileged_user_id column in properties table
-- ============================================================================
SELECT '=== Renaming privileged_user_id column in properties table ===' as status;

-- Rename the column for consistency (optional but recommended)
ALTER TABLE properties
CHANGE COLUMN privileged_user_id property_manager_user_id INT NULL;

SELECT 'Properties table column renamed successfully' as result;

-- ============================================================================
-- STEP 7: Update property_managers table comment (if exists)
-- ============================================================================
-- This table links properties to property managers, ensuring the naming is consistent

-- ============================================================================
-- STEP 8: Verification - Show updated data
-- ============================================================================
SELECT '=== AFTER MIGRATION - VERIFICATION ===' as status;

-- Show users by role
SELECT 'Users by role (AFTER):' as info, role, COUNT(*) as count
FROM users
GROUP BY role;

-- Show register requests by role
SELECT 'Register requests by role (AFTER):' as info, role, COUNT(*) as count
FROM register_requests
GROUP BY role;

-- Verify no 'privileged' records remain
SELECT 'Remaining privileged users (should be 0):' as check_description, COUNT(*) as count
FROM users
WHERE role = 'privileged';

SELECT 'Remaining privileged requests (should be 0):' as check_description, COUNT(*) as count
FROM register_requests
WHERE role = 'privileged';

-- Show updated table structure
SELECT '=== Updated table structures ===' as status;
SHOW COLUMNS FROM users LIKE 'role';
SHOW COLUMNS FROM register_requests LIKE 'role';
SHOW COLUMNS FROM properties LIKE '%manager%';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
SELECT '=== MIGRATION COMPLETED SUCCESSFULLY ===' as status;
SELECT NOW() as completed_at;

