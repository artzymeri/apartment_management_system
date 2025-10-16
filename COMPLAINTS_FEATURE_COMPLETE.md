# Complaints Feature Implementation

## Overview
A complete complaints management system has been implemented, allowing tenants to file complaints about their properties and property managers to review and manage those complaints.

## Implementation Date
October 16, 2025

## Database Changes

### New Table: `complaints`
Created via migration: `backend/migrations/create_complaints_table.sql`

**Columns:**
- `id` - INT AUTO_INCREMENT PRIMARY KEY
- `tenant_user_id` - INT NOT NULL (FK to users.id)
- `property_id` - INT NOT NULL (FK to properties.id)
- `title` - VARCHAR(255) NOT NULL
- `description` - TEXT (optional)
- `status` - ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending'
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

**Indexes:**
- idx_tenant_user_id
- idx_property_id
- idx_status
- idx_created_at

**Foreign Keys:**
- tenant_user_id → users(id) ON DELETE CASCADE
- property_id → properties(id) ON DELETE CASCADE

## Backend Implementation

### 1. Model: `backend/models/complaint.model.js`
- Sequelize model for the complaints table
- Defines all fields and relationships
- Uses underscored naming convention
- Timestamps enabled

### 2. Controller: `backend/controllers/complaint.controller.js`
**Tenant Endpoints:**
- `createComplaint()` - Creates a new complaint
  - Validates tenant is assigned to the property
  - Auto-sets status to 'pending'
  
- `getTenantComplaints()` - Retrieves all complaints for logged-in tenant
  - Includes property details
  - Ordered by created_at DESC

- `getTenantProperties()` - Gets properties assigned to tenant
  - Used for the complaint form dropdown

**Property Manager Endpoints:**
- `getPropertyManagerComplaints()` - Retrieves complaints for managed properties
  - Supports filtering by property_id and status
  - Includes tenant and property details
  - Only shows complaints for properties the PM manages

- `updateComplaintStatus()` - Updates complaint status
  - Validates PM manages the property
  - Supports: pending, in_progress, resolved, rejected

### 3. Routes: `backend/routes/complaint.routes.js`
**Tenant Routes:**
- POST `/api/complaints` - Create complaint
- GET `/api/complaints/my-complaints` - Get tenant's complaints
- GET `/api/complaints/properties` - Get tenant's properties

**Property Manager Routes:**
- GET `/api/complaints/manager` - Get complaints (with filters)
- PATCH `/api/complaints/:id/status` - Update complaint status

### 4. Model Registration: `backend/models/index.js`
- Imported and registered Complaint model
- Defined relationships:
  - Complaint belongsTo User (as 'tenant')
  - Complaint belongsTo Property
  - User hasMany Complaint (as 'complaints')
  - Property hasMany Complaint (as 'complaints')

### 5. Server Configuration: `backend/server.js`
- Registered complaint routes at `/api/complaints`

## Frontend Implementation

### 1. Tenant Page: `frontend/app/tenant/complaints/page.tsx`
**Features:**
- **Complaint Form:**
  - Property selection dropdown (from assigned properties)
  - Title input (required, max 255 chars)
  - Description textarea (optional)
  - Submit button with loading state
  
- **Information Card:**
  - Explains when to file a complaint
  - Shows status meanings with badges

- **My Complaints List:**
  - Displays all submitted complaints
  - Shows title, property, description, status
  - Formatted creation date
  - Color-coded status badges
  - Empty state when no complaints

**Status Badges:**
- Pending - Yellow
- In Progress - Blue
- Resolved - Green
- Rejected - Red

### 2. Property Manager Page: `frontend/app/property_manager/complaints/page.tsx`
**Features:**
- **Statistics Dashboard:**
  - Total complaints
  - Pending count
  - In Progress count
  - Resolved count
  - Rejected count

- **Filters:**
  - Property dropdown (all properties managed by PM)
  - Status dropdown (all statuses)
  - Real-time filtering

- **Complaints Table:**
  - Columns: Title, Property, Tenant, Floor, Status, Date, Actions
  - Shows complaint title and description preview
  - Displays tenant name, email, and floor
  - Property name with icon
  - Formatted date and time
  - "Update Status" button per row

- **Status Update Dialog:**
  - Shows complaint details
  - Property name
  - Tenant information
  - Status dropdown selector
  - Update/Cancel buttons
  - Loading state during update

**UI Components:**
- Responsive design
- Table with overflow handling
- Loading spinner during data fetch
- Empty state alert when no complaints
- Toast notifications for success/error

## Security & Validation

### Backend Validation:
1. **Tenant Complaints:**
   - Verifies tenant is assigned to the property
   - Validates required fields (property_id, title)
   
2. **Property Manager Actions:**
   - Verifies PM manages the property before showing complaints
   - Validates PM manages the property before allowing status updates
   - Validates status values

### Frontend Validation:
1. **Tenant Form:**
   - Required property selection
   - Required title (not empty after trim)
   - Max length on title (255 chars)

2. **Property Manager:**
   - Only shows complaints for managed properties
   - Validates status selection before update

## API Endpoints Summary

### Tenant Endpoints
```
POST   /api/complaints
GET    /api/complaints/my-complaints
GET    /api/complaints/properties
```

### Property Manager Endpoints
```
GET    /api/complaints/manager?property_id=X&status=Y
PATCH  /api/complaints/:id/status
```

## Testing Recommendations

1. **Tenant Flow:**
   - Login as tenant
   - Navigate to Complaints page
   - Verify properties are listed
   - Create a complaint
   - Verify it appears in the list
   - Check status badge

2. **Property Manager Flow:**
   - Login as property manager
   - Navigate to Complaints page
   - Verify statistics are correct
   - Filter by property
   - Filter by status
   - Update a complaint status
   - Verify filters update correctly

3. **Edge Cases:**
   - Tenant with no properties
   - PM with no properties
   - No complaints exist
   - Update status to same value
   - Network errors

## Migration Instructions

1. **Run the database migration:**
   ```bash
   cd backend
   mysql -u root -p[password] apartment_management < migrations/create_complaints_table.sql
   ```

2. **Verify table creation:**
   ```bash
   mysql -u root -p[password] apartment_management -e "DESCRIBE complaints;"
   ```

3. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

4. **Access the feature:**
   - Tenant: `http://localhost:3333/tenant/complaints`
   - Property Manager: `http://localhost:3333/property_manager/complaints`

## Files Created

### Backend (6 files):
1. `backend/migrations/create_complaints_table.sql`
2. `backend/models/complaint.model.js`
3. `backend/controllers/complaint.controller.js`
4. `backend/routes/complaint.routes.js`
5. `backend/models/index.js` (modified)
6. `backend/server.js` (modified)

### Frontend (2 files):
1. `frontend/app/tenant/complaints/page.tsx`
2. `frontend/app/property_manager/complaints/page.tsx`

## Status
✅ **FEATURE COMPLETE**
- Database table created and verified
- Backend models, controllers, and routes implemented
- Frontend pages for both tenant and property manager created
- All relationships properly configured
- Security validations in place
- Ready for testing and use

## Next Steps
1. Test the feature thoroughly in both tenant and property manager roles
2. Consider adding email notifications when complaint status changes
3. Consider adding comment/note functionality for PMs to respond to complaints
4. Add pagination if complaint volume grows
5. Consider adding complaint categories for better organization

