# Expiry Date Feature Implementation

## Overview
Implemented an expiry_date feature for property_manager users that prevents login after the expiration date and displays the status in the user management interface.

## Changes Made

### Backend Changes

#### 1. Database Migration (`backend/migrations/add_expiry_date_to_users.sql`)
- Added `expiry_date` DATE column to the `users` table
- Updated existing property_manager users with random expiry dates (1-12 months in the future)

#### 2. User Model (`backend/models/user.model.js`)
- Added `expiry_date` field (DATEONLY type, nullable)

#### 3. Auth Controller (`backend/controllers/auth.controller.js`)
- Updated `login` function to check if property_manager user account has expired
- Returns 403 error with message "Your account has expired. Please contact an administrator." if expired
- Expiry check compares dates at midnight (00:00:00) for accurate day-level comparison

#### 4. User Controller (`backend/controllers/user.controller.js`)
- Updated `updateUser` function to handle `expiry_date` field
- Automatically sets `expiry_date` to null when user role is changed from property_manager to another role
- Preserves or updates `expiry_date` when user remains property_manager

#### 5. Register Request Controller (`backend/controllers/registerRequest.controller.js`)
- Updated `approveRegisterRequest` function to accept `expiry_date` parameter
- Sets expiry date only when approving a user as property_manager role

### Frontend Changes

#### 1. User API Types (`frontend/lib/user-api.ts`)
- Added `expiry_date?: string | null` to User interface
- Updated `updateUser` function to accept `expiry_date` parameter

#### 2. Calendar Component (`frontend/components/ui/calendar.tsx`)
- Created new Calendar component using react-day-picker
- Styled to match the application's red theme

#### 3. Users List Page (`frontend/app/admin/users/page.tsx`)
- Added "Expiry Status" column to the users table
- Shows expiry date and status badge (Active/Expired) for property_manager users
- Highlights expired property_manager user rows with red background (bg-red-50)
- Displays "N/A" for non-property_manager users
- Shows "No expiry set" for property_manager users without an expiry date

#### 4. Edit User Page (`frontend/app/admin/users/edit/[id]/page.tsx`)
- Added date picker for expiry_date that appears only when role is "property_manager"
- Includes option to clear the expiry date
- Shows helpful message: "This user will not be able to log in after this date."
- Automatically formats date as 'yyyy-MM-dd' for API submission

#### 5. Register Requests Page (`frontend/app/admin/register-requests/page.tsx`)
- Updated approval dialog to include expiry date picker for property_manager role
- Date picker only shows when "Property Manager" role is selected
- Prevents selecting past dates (disabled dates before today)
- Includes "Clear" button to remove selected date

### Dependencies Added
- `date-fns` - Date formatting and manipulation
- `react-day-picker` - Calendar/date picker component

## Usage

### For Administrators

**Creating/Editing Property Manager Users:**
1. Navigate to Admin > Users
2. Click "Edit" on a user or create new user
3. Select "Property Manager" as the role
4. An "Account Expiry Date" field will appear
5. Click the date picker button to select an expiry date
6. Click "Clear date" link to remove expiry date (optional)
7. Save the user

**Approving Registration Requests:**
1. Navigate to Admin > Register Requests
2. Click "Approve" on a pending request
3. Select "Property Manager" as the user role
4. An "Expiry Date" field will appear
5. Select an expiry date or leave blank
6. Click "Approve"

**Viewing Expiry Status:**
- The users list shows an "Expiry Status" column
- Expired property_manager users are highlighted with red background
- Shows expiry date and badge (Active/Expired)

### For Property Manager Users

**Login Behavior:**
- If your account has expired, you will receive an error message:
  "Your account has expired. Please contact an administrator."
- You will not be able to log in until an admin updates your expiry date

## Database Migration

To apply the migration, run:

```bash
cd backend
mysql -u [username] -p [database_name] < migrations/add_expiry_date_to_users.sql
```

Or use your database management tool to execute the SQL in `add_expiry_date_to_users.sql`.

## Testing Checklist

- [ ] Verify migration adds expiry_date column successfully
- [ ] Test property_manager user login with expired date (should fail)
- [ ] Test property_manager user login with future date (should succeed)
- [ ] Test property_manager user login with no expiry date (should succeed)
- [ ] Test editing property_manager user and setting expiry date
- [ ] Test changing user from property_manager to tenant (expiry_date should be cleared)
- [ ] Test changing user from tenant to property_manager (should allow setting expiry_date)
- [ ] Test approving register request as property_manager with expiry date
- [ ] Verify users list shows expiry status correctly
- [ ] Verify expired users are highlighted in red

## Notes

- Expiry dates are stored as DATE type (no time component)
- Comparison is done at midnight (00:00:00) for accurate day-level expiry
- Existing property_manager users were populated with random dates (1-12 months from migration date)
- Only property_manager users can have an expiry date; admins and tenants do not have this feature
- Setting expiry_date is optional - property_manager users can have no expiry date
