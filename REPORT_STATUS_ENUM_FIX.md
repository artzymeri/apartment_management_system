o# Report Status ENUM Fix

## Issue
Property Managers were getting the following error when trying to update report status:
```
Error: "Data truncated for column 'status' at row 1"
Message: "Error updating report status"
```

## Root Cause
There was a mismatch between the database schema and the application code for the `reports.status` column:

**Database (incorrect):**
```sql
enum('pending','in_progress','resolved','closed')
```

**Application Code (correct):**
```sql
enum('pending','in_progress','resolved','rejected')
```

The database had `'closed'` as a status value, while the application code expected `'rejected'`. When the frontend sent `'rejected'` as a status update, the database rejected it because it wasn't a valid ENUM value.

## Solution
Created and executed a migration (`migrations/fix_reports_status_enum.sql`) that:
1. Updates any existing reports with status `'closed'` to `'rejected'`
2. Modifies the status column to use the correct ENUM values: `('pending', 'in_progress', 'resolved', 'rejected')`

## Migration Applied
Date: October 19, 2025

The migration successfully updated the database schema to align with the application code.

## Testing
After applying this fix, Property Managers should now be able to:
- Update report status to 'pending'
- Update report status to 'in_progress'
- Update report status to 'resolved'
- Update report status to 'rejected'

All status updates should now work without the "Data truncated" error.

