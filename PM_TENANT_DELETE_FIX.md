# Property Manager Tenant Delete Permission Fix

## Problem
Property managers were getting a **403 Forbidden** error when trying to delete tenants, with a message about needing admin privileges.

## Root Cause
The delete endpoint was restricted to admins only:
```javascript
router.delete('/:id', isAdmin, userController.deleteUser);
```

Property managers could view, create, and update tenants but couldn't delete them.

## Solution Implemented

### 1. Backend Changes

#### Added New Route (`backend/routes/user.routes.js`)
```javascript
// Delete tenant for property manager
router.delete('/tenants/:id', isAdminOrPropertyManager, userController.deleteTenantForPropertyManager);
```

#### Added New Controller (`backend/controllers/user.controller.js`)
Created `deleteTenantForPropertyManager` function that:
- ✅ Verifies the user is a property manager or admin
- ✅ Checks that the tenant is assigned to one of the manager's properties
- ✅ Prevents deleting your own account
- ✅ Only allows property managers to delete tenants they manage
- ✅ Admins can delete any tenant (bypass property checks)

**Authorization Logic:**
- Property managers can **only** delete tenants assigned to their managed properties
- Must have at least one property where the tenant is assigned
- Returns 404 if tenant not found or not managed by the PM

### 2. Frontend Changes

#### Updated User API (`frontend/lib/user-api.ts`)
Added new method:
```typescript
async deleteTenant(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/users/tenants/${id}`, {
    method: 'DELETE',
    headers: this.getAuthHeaders(),
    credentials: 'include',
  });
  await handleApiResponse(response);
  return response.json();
}
```

#### Updated Hooks (`frontend/hooks/useUsers.ts`)
Added new mutation hook:
```typescript
export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userAPI.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

#### Updated Tenants Page (`frontend/app/property_manager/tenants/page.tsx`)
Changed from:
```typescript
import { useTenants, useDeleteUser } from "@/hooks/useUsers";
const deleteMutation = useDeleteUser();
```

To:
```typescript
import { useTenants, useDeleteTenant } from "@/hooks/useUsers";
const deleteMutation = useDeleteTenant();
```

## Testing
After deployment, property managers should be able to:
- ✅ Delete tenants assigned to their managed properties
- ✅ See success toast: "Tenant deleted successfully"
- ✅ Have the tenant list automatically refresh

Property managers should NOT be able to:
- ❌ Delete tenants not assigned to their properties (404 error)
- ❌ Delete their own account (400 error)
- ❌ Delete admin or other property manager accounts (404 error)

## API Endpoints Summary

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/users/:id` | DELETE | Admin only | Delete any user |
| `/api/users/tenants/:id` | DELETE | Admin + PM | Delete tenant (with property check for PMs) |

## Deployment
1. Deploy backend with the new route and controller
2. Deploy frontend with the updated hook usage
3. Test tenant deletion as a property manager
4. Verify 403 error is resolved

## Notes
- The original admin-only delete endpoint remains unchanged
- Both endpoints coexist - PMs use `/tenants/:id`, admins can use either
- All tenant deletions are properly scoped to managed properties for security

