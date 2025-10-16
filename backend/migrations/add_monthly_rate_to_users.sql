-- Add monthly_rate column to users table
-- This column will store the monthly rent rate for tenants
ALTER TABLE users
ADD COLUMN monthly_rate DECIMAL(10, 2) NULL
COMMENT 'Monthly rent rate for tenants (applicable only to role=tenant)';

