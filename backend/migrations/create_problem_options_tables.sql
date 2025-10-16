-- Create problem_options table
CREATE TABLE IF NOT EXISTS problem_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_created_by (created_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create property_problem_options junction table (many-to-many relation)
CREATE TABLE IF NOT EXISTS property_problem_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  problem_option_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (problem_option_id) REFERENCES problem_options(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_property_problem (property_id, problem_option_id),
  INDEX idx_property (property_id),
  INDEX idx_problem_option (problem_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

