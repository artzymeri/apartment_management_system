-- Migration: Convert floors to floor range (floors_from and floors_to)
-- Date: October 16, 2025
-- Description: Replace single floors column with floors_from and floors_to to support floor ranges

-- Step 1: Drop the old floors column (if exists)
ALTER TABLE properties DROP COLUMN IF EXISTS floors;

-- Step 2: Add new floor range columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floors_from SMALLINT NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floors_to SMALLINT NULL;

-- Note: Validation for range -20 to 200 is handled at the application level
-- floors_from: Starting floor of the property (can be negative for underground)
-- floors_to: Ending floor of the property
-- Both columns are optional (NULL allowed)
