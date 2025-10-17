-- Create tenant_payments table to track monthly payments
CREATE TABLE IF NOT EXISTS tenant_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  property_id INT NOT NULL,
  payment_month DATE NOT NULL COMMENT 'First day of the month for this payment',
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
  payment_date DATE NULL COMMENT 'Actual date when payment was marked as paid',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_tenant_property_month (tenant_id, property_id, payment_month),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_property_id (property_id),
  INDEX idx_payment_month (payment_month),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

