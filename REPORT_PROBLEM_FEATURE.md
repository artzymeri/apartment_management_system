# Report Problem Feature - Implementation Complete

## Overview
Implemented a comprehensive report problem feature that allows tenants to submit maintenance reports for their assigned properties. Property managers can view and manage these reports from their dashboard.

## What Was Implemented

### Backend

#### 1. Database Migration
- **File**: `backend/migrations/create_reports_table.sql`
- Created `reports` table with the following fields:
  - `id`: Primary key
  - `tenant_user_id`: Foreign key to users table
  - `property_id`: Foreign key to properties table
  - `problem_option_id`: Foreign key to problem_options table
  - `floor`: Optional floor number (SMALLINT)
  - `description`: Optional text description
  - `status`: ENUM ('pending', 'in_progress', 'resolved', 'rejected')
  - `created_at` and `updated_at`: Timestamps
  - Proper indexes on tenant_user_id, property_id, status, and created_at

#### 2. Report Model
- **File**: `backend/models/report.model.js`
- Sequelize model for the reports table
- Includes validation for floor numbers (-20 to 200)
- Relationships with User, Property, and ProblemOption models

#### 3. Model Relationships
- **File**: `backend/models/index.js`
- Added Report model to exports
- Defined relationships:
  - Report belongs to User (as tenant)
  - Report belongs to Property
  - Report belongs to ProblemOption
  - Inverse relationships for querying

#### 4. Report Controller
- **File**: `backend/controllers/report.controller.js`
- **Functions implemented**:
  - `createReport`: Creates a new report (Tenant only)
    - Validates tenant is assigned to the property
    - Validates problem option exists for the property
    - Validates floor is within property's floor range
  - `getTenantReports`: Fetches all reports submitted by the tenant
  - `getTenantProblemOptions`: Gets available problem options for tenant's properties
  - `getPropertyManagerReports`: Fetches all reports for properties managed by PM
    - Supports filtering by property_id and status
  - `updateReportStatus`: Allows PM to update report status

#### 5. Report Routes
- **File**: `backend/routes/report.routes.js`
- **Tenant routes**:
  - `POST /api/reports` - Create a new report
  - `GET /api/reports/my-reports` - Get tenant's reports
  - `GET /api/reports/problem-options` - Get available problem options
- **Property Manager routes**:
  - `GET /api/reports/manager` - Get all reports for managed properties
  - `PATCH /api/reports/:id/status` - Update report status

#### 6. Server Configuration
- **File**: `backend/server.js`
- Added report routes to the Express app: `/api/reports`

### Frontend

#### 1. Tenant Layout Update
- **File**: `frontend/components/layouts/TenantLayout.tsx`
- Added "Report Problem" menu item with AlertTriangle icon
- Positioned right after Dashboard and before other menu items
- Proper routing to `/tenant/report-problem`

#### 2. Report Problem Page
- **File**: `frontend/app/tenant/report-problem/page.tsx`
- **Features**:
  - Property selection dropdown (from tenant's assigned properties)
  - Problem type selection (dynamically loaded based on property)
  - Optional floor selection (dropdown with range from property's floors_from to floors_to)
  - Optional description textarea for additional details
  - Form validation before submission
  - Real-time reports list showing tenant's submitted reports
  - Status badges with color coding:
    - Pending (yellow)
    - In Progress (blue)
    - Resolved (green)
    - Rejected (red)
  - Toast notifications for success/error feedback
  - Loading states for better UX

## How It Works

### For Tenants:
1. Navigate to "Report Problem" from the sidebar
2. Select the property (if assigned to multiple properties)
3. Choose the problem type from available options for that property
4. Optionally select the floor number
5. Optionally add a description with more details
6. Submit the report
7. View all submitted reports with their current status

### For Property Managers:
1. Property managers can access reports through the API endpoint `/api/reports/manager`
2. They can filter by property or status
3. They can update the status of reports from 'pending' to 'in_progress', 'resolved', or 'rejected'
4. (Note: PM dashboard page needs to be created separately as requested)

## Data Flow

1. **Tenant selects property** → Frontend fetches problem options for that property
2. **Tenant submits report** → Backend validates:
   - Tenant is assigned to the property
   - Problem option exists for the property
   - Floor is within valid range (if provided)
3. **Report created** → Stored in database with 'pending' status
4. **PM views reports** → Fetches all reports for their managed properties
5. **PM updates status** → Report status is updated and tenant can see the change

## Database Schema

```sql
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_user_id INT NOT NULL,
  property_id INT NOT NULL,
  problem_option_id INT NOT NULL,
  floor SMALLINT NULL,
  description TEXT NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (problem_option_id) REFERENCES problem_options(id)
);
```

## Security Features

- All routes protected with authentication middleware
- Role-based authorization (tenant vs property_manager)
- Validation that tenant can only report problems for their assigned properties
- Validation that PM can only view/update reports for properties they manage
- Input validation for floor numbers and status values

## Next Steps (For PM Dashboard)

To complete the feature, you'll need to create a Property Manager page to view and manage reports:
- Create a new page at `frontend/app/property_manager/reports/page.tsx`
- Add a "Reports" menu item to the Property Manager layout
- Display reports in a table/list format
- Add filters for property and status
- Add action buttons to update report status
- Show tenant information (name, email, phone)
- Display property and problem option details

## Testing the Feature

1. Ensure backend server is running
2. Log in as a tenant
3. Navigate to "Report Problem"
4. Submit a report
5. Verify it appears in "My Reports" section
6. Log in as a property manager
7. Use API endpoint to fetch reports: `GET /api/reports/manager`
8. Update report status: `PATCH /api/reports/:id/status`

## Files Modified/Created

### Backend:
- ✅ `migrations/create_reports_table.sql` (created)
- ✅ `models/report.model.js` (created)
- ✅ `models/index.js` (modified)
- ✅ `controllers/report.controller.js` (created)
- ✅ `routes/report.routes.js` (created)
- ✅ `server.js` (modified)

### Frontend:
- ✅ `components/layouts/TenantLayout.tsx` (modified)
- ✅ `app/tenant/report-problem/page.tsx` (created)

All files are error-free and ready to use!

