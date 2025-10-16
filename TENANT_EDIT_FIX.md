# Fix: Tenant Edit Access for Property Managers

## Issue
Property Managers were getting "Tenant not found or invalid tenant ID" error when trying to edit tenants because they were calling admin-only endpoints.

## Root Cause
The tenant edit page was using:
- `GET /api/users/:id` - Admin only ❌
- `PUT /api/users/:id` - Admin only ❌

Property Managers don't have access to these endpoints, resulting in 403 Forbidden errors.

## Solution
Created dedicated endpoints for Property Managers to access their tenants:

### Backend Changes

#### 1. New Controller Methods (`backend/controllers/user.controller.js`)

**getTenantByIdForPropertyManager**
- Fetches a single tenant by ID
- Validates tenant is linked to manager's properties
- Returns 404 if tenant doesn't belong to any managed properties

**updateTenantForPropertyManager**
- Updates tenant information
- Validates tenant belongs to manager's properties
- Validates new property assignments (must be managed by this manager)
- Includes email/phone uniqueness checks
- Handles password hashing if provided

#### 2. New Routes (`backend/routes/user.routes.js`)
- `GET /api/users/tenants/:id` - Get single tenant (Property Manager accessible)
- `PUT /api/users/tenants/:id` - Update tenant (Property Manager accessible)

### Frontend Changes

#### 3. New API Methods (`frontend/lib/user-api.ts`)
- `getTenantById(id)` - Calls `/api/users/tenants/:id`
- `updateTenant(id, data)` - Calls `PUT /api/users/tenants/:id`

#### 4. New Hooks (`frontend/hooks/useUsers.ts`)
- `useTenant(id)` - Fetches single tenant for property managers
- `useUpdateTenant()` - Updates tenant using property manager endpoint

#### 5. Updated Edit Page (`frontend/app/property_manager/tenants/edit/[id]/page.tsx`)
- Changed from `useUser()` to `useTenant()`
- Changed from `useUpdateUser()` to `useUpdateTenant()`
- Now uses property manager-accessible endpoints

## Security Features

### Access Control
✅ Property Managers can only view/edit tenants assigned to their managed properties
✅ Property Managers can only assign tenants to properties they manage
✅ All operations validate property ownership via the `property_managers` junction table

### Data Validation
✅ Email uniqueness check (users + register_requests tables)
✅ Phone number uniqueness check
✅ Password hashing (bcrypt with 10 salt rounds)
✅ Property assignment validation

## API Endpoints Summary

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/users/tenants` | GET | Property Manager/Admin | List all managed tenants |
| `/api/users/tenants/:id` | GET | Property Manager/Admin | Get single tenant details |
| `/api/users/tenants/:id` | PUT | Property Manager/Admin | Update tenant |
| `/api/users/:id` | GET | Admin only | Get any user |
| `/api/users/:id` | PUT | Admin only | Update any user |

## Testing Verification
All files have been validated with no TypeScript or JavaScript errors.

## Result
✅ Property Managers can now successfully edit tenants assigned to their properties
✅ Access is properly restricted to only their managed tenants
✅ No more "Tenant not found or invalid tenant ID" errors for valid operations

