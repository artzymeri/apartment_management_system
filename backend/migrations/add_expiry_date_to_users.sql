-- Add expiry_date column to users table
-- This column is applicable only for property_manager users
ALTER TABLE users ADD COLUMN expiry_date DATE NULL;

-- Update existing property_manager users with random dates in the future (1-12 months from now)
UPDATE users
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL FLOOR(1 + RAND() * 12) MONTH)
WHERE role = 'property_manager' AND expiry_date IS NULL;
