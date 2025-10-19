# PM Layout Bell Icon Removal & Sidebar Badges Feature

## Summary
This feature removes the bell icon from the Property Manager Layout header and adds badge notifications to the sidebar for Reports, Complaints, and Suggestions (similar to the Admin Layout's register requests badge).

## Changes Made

### Backend Changes

#### 1. **New Controller Function** (`backend/controllers/propertyManagerDashboard.controller.js`)
- Added `getSidebarCounts()` function that fetches counts of pending reports, complaints, and suggestions
- Returns: `{ pendingReports, pendingComplaints, pendingSuggestions }`
- Only counts items with `status: 'pending'` for the properties managed by the logged-in property manager

#### 2. **New Route** (`backend/routes/propertyManagerDashboard.routes.js`)
- Added GET `/api/property-manager-dashboard/sidebar-counts` endpoint
- Protected with authentication and property_manager role authorization

### Frontend Changes

#### 3. **New API Module** (`frontend/lib/property-manager-dashboard-api.ts`)
- Created `getSidebarCounts()` function to fetch badge counts from backend
- Created `getPropertyManagerDashboardData()` function for future use

#### 4. **New Hook** (`frontend/hooks/usePropertyManagerSidebarCounts.ts`)
- Created `usePropertyManagerSidebarCounts()` hook using React Query
- Auto-refreshes every 30 seconds to keep counts updated
- Returns `{ pendingReports, pendingComplaints, pendingSuggestions }`

#### 5. **Updated PropertyManagerLayout** (`frontend/components/layouts/PropertyManagerLayout.tsx`)
- **REMOVED**: Bell icon from the header (lines 189-191 in original file)
- **ADDED**: Import for `usePropertyManagerSidebarCounts` hook
- **ADDED**: Badge display logic in sidebar navigation
- **ADDED**: Red badges appear on Reports, Complaints, and Suggestions when there are pending items
- Removed unused `Star` import from lucide-react

## How It Works

1. When the Property Manager Layout loads, it calls the `usePropertyManagerSidebarCounts()` hook
2. The hook fetches counts from `/api/property-manager-dashboard/sidebar-counts` endpoint
3. The backend queries the database for pending items only for properties managed by the current user
4. Badges with counts appear next to "Reports", "Complaints", and "Suggestions" menu items
5. The data refreshes automatically every 30 seconds
6. The bell icon has been removed from the header (previously shown in the top right)

## API Endpoint Details

**Endpoint**: `GET /api/property-manager-dashboard/sidebar-counts`

**Authentication**: Required (Bearer Token)

**Authorization**: property_manager role only

**Response**:
```json
{
  "success": true,
  "data": {
    "pendingReports": 5,
    "pendingComplaints": 3,
    "pendingSuggestions": 2
  }
}
```

## Badge Display Rules

- Badges only appear when count > 0
- Badge color: Red (destructive variant)
- Badge shows the numeric count
- Badge positioned on the right side of the menu item

## Files Created
1. `/frontend/lib/property-manager-dashboard-api.ts`
2. `/frontend/hooks/usePropertyManagerSidebarCounts.ts`

## Files Modified
1. `/backend/controllers/propertyManagerDashboard.controller.js`
2. `/backend/routes/propertyManagerDashboard.routes.js`
3. `/frontend/components/layouts/PropertyManagerLayout.tsx`

## Testing Checklist
- [ ] Backend endpoint returns correct counts
- [ ] Frontend fetches and displays badges correctly
- [ ] Bell icon is removed from PM header
- [ ] Badges only show when counts > 0
- [ ] Badges update every 30 seconds
- [ ] Only counts items for properties the PM manages
- [ ] Only counts items with 'pending' status

