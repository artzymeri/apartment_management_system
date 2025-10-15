-- Migration: Rename 'privileged' role to 'property_manager'
-- This migration updates all existing user records with the 'privileged' role

-- Update users table - change role from 'privileged' to 'property_manager'
UPDATE users
SET role = 'property_manager'
WHERE role = 'privileged';

-- Update register_requests table - change role from 'privileged' to 'property_manager'
UPDATE register_requests
SET role = 'property_manager'
WHERE role = 'privileged';

-- Verify the changes
SELECT 'Users updated:' as message, COUNT(*) as count FROM users WHERE role = 'property_manager'
UNION ALL
SELECT 'Register requests updated:', COUNT(*) FROM register_requests WHERE role = 'property_manager'
UNION ALL
SELECT 'Remaining privileged users (should be 0):', COUNT(*) FROM users WHERE role = 'privileged'
UNION ALL
SELECT 'Remaining privileged requests (should be 0):', COUNT(*) FROM register_requests WHERE role = 'privileged';

