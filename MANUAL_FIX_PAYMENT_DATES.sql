-- MANUAL FIX FOR PAYMENT DATES
-- Run this SQL directly in your MySQL database

-- Step 1: View current incorrect dates
SELECT id, tenant_id, property_id, payment_month, amount, status
FROM tenant_payments
ORDER BY payment_month DESC;

-- Step 2: Fix the dates (add 1 day to convert last-day-of-month to first-day-of-next-month)
UPDATE tenant_payments
SET payment_month = DATE_ADD(payment_month, INTERVAL 1 DAY)
WHERE DAY(payment_month) > 1;

-- Step 3: Verify the fix
SELECT id, tenant_id, property_id, payment_month, amount, status
FROM tenant_payments
ORDER BY payment_month DESC;

-- Expected results:
-- 2025-09-30 -> 2025-10-01 (September 30 -> October 1)
-- 2025-08-31 -> 2025-09-01 (August 31 -> September 1)

