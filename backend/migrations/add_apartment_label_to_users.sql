-- Add apartment_label column to users table
-- This column is required for tenants to specify their apartment label
ALTER TABLE users ADD COLUMN apartment_label VARCHAR(50) NULL;

-- Comment explaining the field
ALTER TABLE users MODIFY apartment_label VARCHAR(50) NULL COMMENT 'Apartment/unit label for tenant (e.g., A1, B23, etc.)';

