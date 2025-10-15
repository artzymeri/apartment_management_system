-- Migration: Add floor_assigned column to users table
-- This field will store the floor number where a tenant lives
-- Only applicable for users with role 'tenant'

-- Add the floor_assigned column
ALTER TABLE users ADD COLUMN floor_assigned SMALLINT NULL;

-- Add an index for better query performance
CREATE INDEX idx_users_floor_assigned ON users(floor_assigned);
