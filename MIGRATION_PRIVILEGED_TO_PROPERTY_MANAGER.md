# Complete Migration: privileged → property_manager

## Date: October 15, 2025

This document outlines the complete migration from 'privileged' to 'property_manager' throughout the entire application.

---

## What Was Changed

### 1. Database Schema Changes
- **users table**: Role ENUM updated from `('admin', 'privileged', 'tenant')` to `('admin', 'property_manager', 'tenant')`
- **register_requests table**: Role ENUM updated from `('admin', 'privileged', 'tenant')` to `('admin', 'property_manager', 'tenant')`
- **properties table**: Column renamed from `privileged_user_id` to `property_manager_user_id`

### 2. Database Data Changes
- All existing users with role='privileged' → role='property_manager'
- All existing register_requests with role='privileged' → role='property_manager'

### 3. Backend Code Changes

#### Models:
- `user.model.js`: ENUM updated to use 'property_manager'
- `property.model.js`: Column renamed to `property_manager_user_id`
- `propertyManager.model.js`: Junction table (no changes needed)
- `models/index.js`: Foreign key updated to `property_manager_user_id`

#### Controllers:
- `auth.controller.js`: Expiry check updated for 'property_manager' role
- `user.controller.js`: User update logic uses 'property_manager'
- `registerRequest.controller.js`: Approval process uses 'property_manager'
- `property.controller.js`: All manager-related logic uses 'property_manager'

#### Middleware:
- `auth.middleware.js`: `isPrivilegedOrAdmin` now checks for 'property_manager' role

#### SQL Files:
- `migrations/add_expiry_date_to_users.sql`: Updated comments and queries
- `test_users.sql`: Test user role updated to 'property_manager'

### 4. Frontend Code Changes

#### Folder Structure:
- `/app/privileged` → `/app/property_manager`
- `PrivilegedLayout.tsx` → `PropertyManagerLayout.tsx`

#### Type Definitions:
- `lib/user-api.ts`: User role type updated
- `lib/property-api.ts`: Property interface updated (property_manager_user_id)
- `contexts/AuthContext.tsx`: Role types and routing updated
- `hooks/useUsers.ts`: Role type definitions updated

#### Components:
- `ProtectedRoute.tsx`: Allowed roles updated
- `PropertyManagerLayout.tsx`: Navigation paths updated to /property_manager/*
- `layouts/index.ts`: Export updated to PropertyManagerLayout

#### Pages Updated (18 files):
- `/property_manager/page.tsx`
- `/property_manager/properties/page.tsx`
- `/property_manager/properties/[id]/page.tsx`
- `/admin/page.tsx`
- `/admin/users/page.tsx`
- `/admin/users/edit/[id]/page.tsx`
- `/admin/register-requests/page.tsx`
- `/admin/properties/create/page.tsx`
- `/admin/properties/edit/[id]/page.tsx`
- `/settings/page.tsx`
- `/page.tsx`
- And more...

---

## How to Run the Migration

### Option 1: Using the provided script (Recommended)

```bash
cd /Users/artz./Desktop/Private/apartment_management/backend/migrations
./run_migration.sh
```

The script will:
1. Ask for your MySQL credentials
2. Run the complete migration
3. Show verification results
4. Confirm success

### Option 2: Manual execution

```bash
cd /Users/artz./Desktop/Private/apartment_management/backend/migrations
mysql -u your_username -p apartment_management < complete_privileged_to_property_manager_migration.sql
```

---

## Post-Migration Steps

### 1. Restart Backend Server
```bash
cd /Users/artz./Desktop/Private/apartment_management/backend
# Stop the server if running (Ctrl+C)
npm start
# or
node server.js
```

### 2. Rebuild Frontend (if necessary)
```bash
cd /Users/artz./Desktop/Private/apartment_management/frontend
rm -rf .next
npm run build
npm run dev
```

### 3. Clear Browser Cache
- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

### 4. Test the Application
- Log in as a property manager user
- Verify the URL is `/property_manager` (not `/privileged`)
- Check user management works correctly
- Verify property assignment to managers works

---

## Verification Checklist

After migration, verify:

- [ ] All users with role='privileged' are now role='property_manager'
- [ ] No 'privileged' entries remain in users table
- [ ] No 'privileged' entries remain in register_requests table
- [ ] Properties table has `property_manager_user_id` column
- [ ] Users table role ENUM shows: admin, property_manager, tenant
- [ ] Backend server starts without errors
- [ ] Frontend builds without errors
- [ ] Property manager users can log in
- [ ] Property manager dashboard shows at /property_manager
- [ ] User creation/editing with property_manager role works
- [ ] Property assignment to managers works

---

## Rollback (Emergency Only)

If you need to rollback (NOT RECOMMENDED after running), you would need to:

1. Manually update all 'property_manager' back to 'privileged' in the database
2. Revert the code changes using git
3. Restart servers

**Note**: It's better to fix issues forward rather than rollback.

---

## Files Changed Summary

### Backend (10 files):
- models/user.model.js
- models/property.model.js
- models/index.js
- controllers/auth.controller.js
- controllers/user.controller.js
- controllers/registerRequest.controller.js
- controllers/property.controller.js
- middleware/auth.middleware.js
- migrations/*.sql (3 new files)
- test_users.sql

### Frontend (20+ files):
- All files in /app/property_manager/* (renamed folder)
- PropertyManagerLayout.tsx (renamed file)
- Multiple admin pages
- Context, hooks, and lib files
- Type definitions

### New Migration Files:
1. `rename_privileged_to_property_manager.sql` (basic)
2. `update_enum_privileged_to_property_manager.sql` (with ENUM update)
3. `complete_privileged_to_property_manager_migration.sql` (comprehensive - USE THIS ONE)
4. `run_migration.sh` (automated script)

---

## Support

If you encounter any issues:

1. Check the backend logs for errors
2. Check the browser console for frontend errors
3. Verify the database changes were applied correctly:
   ```sql
   SHOW COLUMNS FROM users LIKE 'role';
   SELECT DISTINCT role FROM users;
   SHOW COLUMNS FROM properties LIKE '%manager%';
   ```

---

## Migration Complete! 🎉

After running the migration and following the post-migration steps, your application will be fully updated with 'property_manager' instead of 'privileged' everywhere.

