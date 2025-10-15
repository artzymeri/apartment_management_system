-- Test data for register_requests table
-- Run this SQL in your database to create sample registration requests

-- Create the register_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS register_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  number VARCHAR(20),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample pending registration requests
INSERT INTO register_requests (name, surname, email, password, number, status) VALUES
('John', 'Doe', 'john.doe@example.com', '$2b$10$sampleHashedPassword1', '+1234567890', 'pending'),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$10$sampleHashedPassword2', '+1234567891', 'pending'),
('Bob', 'Johnson', 'bob.johnson@example.com', '$2b$10$sampleHashedPassword3', '+1234567892', 'pending'),
('Alice', 'Williams', 'alice.williams@example.com', '$2b$10$sampleHashedPassword4', '+1234567893', 'approved'),
('Charlie', 'Brown', 'charlie.brown@example.com', '$2b$10$sampleHashedPassword5', '+1234567894', 'rejected');

-- View all register requests
SELECT * FROM register_requests ORDER BY created_at DESC;

