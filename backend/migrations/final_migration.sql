-- ============================================================================
-- FINAL CORRECTED MIGRATION: privileged -> property_manager
-- Date: 2025-10-15
-- IMPORTANT: This migration modifies ENUM first, then updates data
-- ============================================================================

USE apartment_management;

-- ============================================================================
-- STEP 1: Show current state
-- ============================================================================
SELECT '=== BEFORE MIGRATION ===' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- ============================================================================
-- STEP 2: Modify ENUM column FIRST to accept 'property_manager'
-- ============================================================================
SELECT '=== Modifying users table ENUM to accept property_manager ===' as status;

ALTER TABLE users
MODIFY COLUMN role ENUM('admin', 'privileged', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

SELECT 'Users table role ENUM expanded successfully' as result;

-- ============================================================================
-- STEP 3: NOW update existing user data
-- ============================================================================
SELECT '=== Updating user data ===' as status;

UPDATE users
SET role = 'property_manager'
WHERE role = 'privileged';

SELECT CONCAT('Updated ', ROW_COUNT(), ' user records') as result;

-- ============================================================================
-- STEP 4: Remove 'privileged' from ENUM (now that all data is migrated)
-- ============================================================================
SELECT '=== Removing privileged from ENUM ===' as status;

ALTER TABLE users
MODIFY COLUMN role ENUM('admin', 'property_manager', 'tenant') NOT NULL DEFAULT 'tenant';

SELECT 'Removed privileged from ENUM successfully' as result;

-- ============================================================================
-- STEP 5: Rename privileged_user_id column in properties table
-- ============================================================================
SELECT '=== Renaming column in properties table ===' as status;

ALTER TABLE properties
CHANGE COLUMN privileged_user_id property_manager_user_id INT NULL;

SELECT 'Properties table column renamed successfully' as result;

-- ============================================================================
-- STEP 6: Verification
-- ============================================================================
SELECT '=== AFTER MIGRATION - VERIFICATION ===' as status;

SELECT 'User roles after migration:' as info;
SELECT role, COUNT(*) as count FROM users GROUP BY role;

SELECT 'Check for remaining privileged users:' as info;
SELECT COUNT(*) as remaining_privileged_count FROM users WHERE role = 'privileged';

SELECT 'Users table structure:' as info;
SHOW COLUMNS FROM users LIKE 'role';

SELECT 'Properties table structure:' as info;
SHOW COLUMNS FROM properties LIKE '%manager%';

SELECT '=== ✓ MIGRATION COMPLETED SUCCESSFULLY ===' as status;
SELECT NOW() as completed_at;

