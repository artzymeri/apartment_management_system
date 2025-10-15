-- Test Users for JWT Authentication System
-- All users have the password: 'password'
-- Bcrypt hash for 'password': $2b$10$rKzH.PJJ8OVQPx0QJ7FwM.XkJ4j5K4eZ0pZh0NjW9K6nQqxH3h7Uu

USE apartment_management;

-- Clear existing test users (optional)
-- DELETE FROM users WHERE email LIKE '%@test.com';

-- Insert Admin User
INSERT INTO users (name, surname, email, password, number, role, created_at, updated_at)
VALUES (
  'Admin',
  'User',
  'admin@test.com',
  '$2b$10$rKzH.PJJ8OVQPx0QJ7FwM.XkJ4j5K4eZ0pZh0NjW9K6nQqxH3h7Uu',
  '+1 (555) 100-0001',
  'admin',
  NOW(),
  NOW()
);

-- Insert Privileged/Manager User
INSERT INTO users (name, surname, email, password, number, role, created_at, updated_at)
VALUES (
  'Manager',
  'Smith',
  'manager@test.com',
  '$2b$10$rKzH.PJJ8OVQPx0QJ7FwM.XkJ4j5K4eZ0pZh0NjW9K6nQqxH3h7Uu',
  '+1 (555) 200-0002',
  'privileged',
  NOW(),
  NOW()
);

-- Insert Tenant User
INSERT INTO users (name, surname, email, password, number, role, created_at, updated_at)
VALUES (
  'John',
  'Tenant',
  'tenant@test.com',
  '$2b$10$rKzH.PJJ8OVQPx0QJ7FwM.XkJ4j5K4eZ0pZh0NjW9K6nQqxH3h7Uu',
  '+1 (555) 300-0003',
  'tenant',
  NOW(),
  NOW()
);

-- Verify inserts
SELECT id, name, surname, email, role, created_at
FROM users
WHERE email LIKE '%@test.com'
ORDER BY role;

-- Expected output:
-- | id | name    | surname | email             | role       | created_at          |
-- |----|---------|---------|-------------------|------------|---------------------|
-- | 1  | Admin   | User    | admin@test.com    | admin      | 2025-10-14 ...      |
-- | 2  | Manager | Smith   | manager@test.com  | privileged | 2025-10-14 ...      |
-- | 3  | John    | Tenant  | tenant@test.com   | tenant     | 2025-10-14 ...      |

