-- Cleanup test cities from database
-- First, update any properties using test cities to use Prishtina instead

USE apartment_management;

-- Show properties that need to be updated
SELECT 'Properties using test cities:' as info;
SELECT id, title, city_id FROM properties WHERE city_id IN (35, 36);

-- Update properties to use Prishtina (id=1)
UPDATE properties SET city_id = 1 WHERE city_id IN (35, 36);

-- Delete the test cities
DELETE FROM cities WHERE id = 35;
DELETE FROM cities WHERE id = 36;

-- Show final result
SELECT 'Cities after cleanup:' as info;
SELECT COUNT(*) as total_cities FROM cities;
SELECT id, name FROM cities WHERE id >= 30 ORDER BY id;

