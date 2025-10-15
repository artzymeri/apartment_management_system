-- Migration: Create property_managers junction table for many-to-many relationship
-- Date: 2025-10-14

-- Create the property_managers junction table
CREATE TABLE IF NOT EXISTS property_managers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraints
  CONSTRAINT fk_property_managers_property
    FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_property_managers_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Ensure unique property-manager combinations
  UNIQUE KEY unique_property_user (property_id, user_id),

  -- Indexes for performance
  INDEX idx_property_id (property_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Migrate existing data from privileged_user_id to the new junction table
-- This will copy any existing single manager assignments to the new many-to-many table
INSERT INTO property_managers (property_id, user_id, created_at)
SELECT id, privileged_user_id, NOW()
FROM properties
WHERE privileged_user_id IS NOT NULL
ON DUPLICATE KEY UPDATE property_managers.created_at = property_managers.created_at;

-- Note: The privileged_user_id column is kept for backward compatibility
-- but should not be used going forward. It can be removed in a future migration
-- after confirming the new system works correctly.
