-- Fix payment_month dates that are stored as last day of month instead of first day
-- This fixes the timezone bug where dates were stored incorrectly

-- Update all payment records to use the first day of the next month
-- (since they were incorrectly stored as the last day of the previous month)
UPDATE tenant_payments
SET payment_month = DATE_ADD(payment_month, INTERVAL 1 DAY)
WHERE DAY(payment_month) > 1;

-- Verify the changes
SELECT id, tenant_id, property_id, payment_month, amount, status
FROM tenant_payments
ORDER BY payment_month DESC
LIMIT 20;

