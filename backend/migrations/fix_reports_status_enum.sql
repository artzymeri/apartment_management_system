-- Fix reports status enum: change 'closed' to 'rejected'
-- This migration aligns the database with the application code

-- First, update any existing 'closed' records to 'rejected'
UPDATE reports
SET status = 'rejected'
WHERE status = 'closed';

-- Then alter the column to use the correct enum values
ALTER TABLE reports
MODIFY COLUMN status ENUM('pending', 'in_progress', 'resolved', 'rejected')
NOT NULL DEFAULT 'pending';

