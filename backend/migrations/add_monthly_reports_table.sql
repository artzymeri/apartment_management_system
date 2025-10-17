-- Create monthly_reports table
CREATE TABLE IF NOT EXISTS monthly_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  report_month DATE NOT NULL COMMENT 'First day of the month for this report',
  generated_by_user_id INT NOT NULL,
  total_budget DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT 'Total collected from paid tenants',
  total_tenants INT NOT NULL DEFAULT 0,
  paid_tenants INT NOT NULL DEFAULT 0,
  pending_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  spending_breakdown JSON NULL COMMENT 'JSON array of spending allocations per config',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_monthly_reports_property
    FOREIGN KEY (property_id) REFERENCES properties(id)
    ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT fk_monthly_reports_user
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT unique_property_month_report
    UNIQUE (property_id, report_month)
);

-- Create indexes for better query performance
CREATE INDEX idx_report_property_id ON monthly_reports(property_id);
CREATE INDEX idx_report_month ON monthly_reports(report_month);
CREATE INDEX idx_generated_by_user_id ON monthly_reports(generated_by_user_id);

