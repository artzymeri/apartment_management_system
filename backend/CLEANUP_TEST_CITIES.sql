-- =================================================================
-- CLEANUP TEST CITIES SCRIPT
-- This script removes test cities (ID 35 and 36) from the database
-- by first updating any properties that reference them
-- =================================================================

-- Step 1: Show current situation
SELECT '=== STEP 1: Current Test Cities ===' as '';
SELECT id, name, created_at FROM cities WHERE id IN (35, 36);

-- Step 2: Show properties that need updating
SELECT '=== STEP 2: Properties Using Test Cities ===' as '';
SELECT id, title, city_id FROM properties WHERE city_id IN (35, 36);

-- Step 3: Update properties to use Prishtina (id=1) instead
SELECT '=== STEP 3: Updating Properties to Use Prishtina ===' as '';
UPDATE properties SET city_id = 1 WHERE city_id IN (35, 36);
SELECT CONCAT('Updated ', ROW_COUNT(), ' properties') as result;

-- Step 4: Delete test city with ID 35
SELECT '=== STEP 4: Deleting City ID 35 ===' as '';
DELETE FROM cities WHERE id = 35;
SELECT CONCAT('Deleted city ID 35 - Affected rows: ', ROW_COUNT()) as result;

-- Step 5: Delete test city with ID 36
SELECT '=== STEP 5: Deleting City ID 36 ===' as '';
DELETE FROM cities WHERE id = 36;
SELECT CONCAT('Deleted city ID 36 - Affected rows: ', ROW_COUNT()) as result;

-- Step 6: Verify cleanup
SELECT '=== STEP 6: Verification ===' as '';
SELECT COUNT(*) as total_cities FROM cities;
SELECT id, name FROM cities WHERE id >= 30 ORDER BY id;

SELECT '=== CLEANUP COMPLETE ===' as '';

