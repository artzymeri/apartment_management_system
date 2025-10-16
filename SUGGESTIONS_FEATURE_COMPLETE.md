# Suggestions Feature Implementation

## Overview
A complete suggestions management system has been implemented, allowing tenants to submit improvement suggestions for their properties and property managers to review and manage those suggestions.

## Implementation Date
October 16, 2025

## Database Changes

### New Table: `suggestions`
Created via migration: `backend/migrations/create_suggestions_table.sql`

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

### 1. Model: `backend/models/suggestion.model.js`
- Sequelize model for the suggestions table
- Defines all fields and relationships
- Uses underscored naming convention
- Timestamps enabled

### 2. Controller: `backend/controllers/suggestion.controller.js`
**Tenant Endpoints:**
- `createSuggestion()` - Creates a new suggestion
  - Validates tenant is assigned to the property
  - Auto-sets status to 'pending'
  
- `getTenantSuggestions()` - Retrieves all suggestions for logged-in tenant
  - Includes property details
  - Ordered by created_at DESC

- `getTenantProperties()` - Gets properties assigned to tenant
  - Used for the suggestion form dropdown

**Property Manager Endpoints:**
- `getPropertyManagerSuggestions()` - Retrieves suggestions for managed properties
  - Supports filtering by property_id and status
  - Includes tenant and property details
  - Only shows suggestions for properties the PM manages

- `updateSuggestionStatus()` - Updates suggestion status
  - Validates PM manages the property
  - Supports: pending, in_progress, resolved (implemented), rejected

### 3. Routes: `backend/routes/suggestion.routes.js`
**Tenant Routes:**
- POST `/api/suggestions` - Create suggestion
- GET `/api/suggestions/my-suggestions` - Get tenant's suggestions
- GET `/api/suggestions/properties` - Get tenant's properties

**Property Manager Routes:**
- GET `/api/suggestions/manager` - Get suggestions (with filters)
- PATCH `/api/suggestions/:id/status` - Update suggestion status

### 4. Model Registration: `backend/models/index.js`
- Imported and registered Suggestion model
- Defined relationships:
  - Suggestion belongsTo User (as 'tenant')
  - Suggestion belongsTo Property
  - User hasMany Suggestion (as 'suggestions')
  - Property hasMany Suggestion (as 'suggestions')

### 5. Server Configuration: `backend/server.js`
- Registered suggestion routes at `/api/suggestions`

## Frontend Implementation

### 1. Tenant Page: `frontend/app/tenant/suggestions/page.tsx`
**Features:**
- **Suggestion Form:**
  - Property selection dropdown (from assigned properties)
  - Title input (required, max 255 chars)
  - Description textarea (optional)
  - Submit button with loading state
  
- **Information Card:**
  - Explains what to suggest:
    - Property improvements
    - New amenities or services
    - Energy-saving initiatives
    - Community events or programs
    - Security enhancements
    - Other improvement ideas
  - Shows status meanings with badges

- **My Suggestions List:**
  - Displays all submitted suggestions
  - Shows title, property, description, status
  - Formatted creation date
  - Color-coded status badges
  - Empty state when no suggestions

**Status Badges:**
- Pending - Yellow (Under review)
- In Progress - Blue (Being considered)
- Resolved - Green (Implemented)
- Rejected - Red (Not feasible)

**Icons:**
- Lightbulb icon for suggestions theme

### 2. Property Manager Page: `frontend/app/property_manager/suggestions/page.tsx`
**Features:**
- **Statistics Dashboard:**
  - Total suggestions
  - Pending count
  - In Progress count
  - Implemented count (resolved)
  - Rejected count

- **Filters:**
  - Property dropdown (all properties managed by PM)
  - Status dropdown (all statuses)
  - Real-time filtering

- **Suggestions Table:**
  - Columns: Title, Property, Tenant, Floor, Status, Date, Actions
  - Shows suggestion title and description preview
  - Displays tenant name, email, and floor
  - Property name with icon
  - Formatted date and time
  - "Update Status" button per row

- **Status Update Dialog:**
  - Shows suggestion details
  - Property name
  - Tenant information
  - Status dropdown selector (includes "Implemented" instead of "Resolved")
  - Update/Cancel buttons
  - Loading state during update

**UI Components:**
- Responsive design
- Table with overflow handling
- Loading spinner during data fetch
- Empty state alert when no suggestions
- Toast notifications for success/error
- Lightbulb icon throughout

## Security & Validation

### Backend Validation:
1. **Tenant Suggestions:**
   - Verifies tenant is assigned to the property
   - Validates required fields (property_id, title)
   
2. **Property Manager Actions:**
   - Verifies PM manages the property before showing suggestions
   - Validates PM manages the property before allowing status updates
   - Validates status values

### Frontend Validation:
1. **Tenant Form:**
   - Required property selection
   - Required title (not empty after trim)
   - Max length on title (255 chars)

2. **Property Manager:**
   - Only shows suggestions for managed properties
   - Validates status selection before update

## API Endpoints Summary

### Tenant Endpoints
```
POST   /api/suggestions
GET    /api/suggestions/my-suggestions
GET    /api/suggestions/properties
```

### Property Manager Endpoints
```
GET    /api/suggestions/manager?property_id=X&status=Y
PATCH  /api/suggestions/:id/status
```

## Differences from Complaints Feature

1. **Icon:** Uses Lightbulb instead of MessageSquare
2. **Purpose:** Proactive improvements vs. reactive issues
3. **Language:** 
   - "Implemented" instead of "Resolved" in PM view
   - "Under review" vs. "Awaiting review"
   - "Being considered" vs. "Being addressed"
4. **Information Card Content:** Focus on improvement ideas
5. **Empty State Message:** "No suggestions submitted yet"

## Testing Recommendations

1. **Tenant Flow:**
   - Login as tenant
   - Navigate to Suggestions page
   - Verify properties are listed
   - Create a suggestion
   - Verify it appears in the list
   - Check status badge

2. **Property Manager Flow:**
   - Login as property manager
   - Navigate to Suggestions page
   - Verify statistics are correct
   - Filter by property
   - Filter by status
   - Update a suggestion status
   - Verify filters update correctly

3. **Edge Cases:**
   - Tenant with no properties
   - PM with no properties
   - No suggestions exist
   - Update status to same value
   - Network errors

## Migration Instructions

1. **Run the database migration:**
   ```bash
   cd backend
   mysql -u root -p[password] apartment_management < migrations/create_suggestions_table.sql
   ```

2. **Verify table creation:**
   ```bash
   mysql -u root -p[password] apartment_management -e "DESCRIBE suggestions;"
   ```

3. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

4. **Access the feature:**
   - Tenant: `http://localhost:3333/tenant/suggestions`
   - Property Manager: `http://localhost:3333/property_manager/suggestions`

## Files Created

### Backend (6 files):
1. `backend/migrations/create_suggestions_table.sql`
2. `backend/models/suggestion.model.js`
3. `backend/controllers/suggestion.controller.js`
4. `backend/routes/suggestion.routes.js`
5. `backend/models/index.js` (modified)
6. `backend/server.js` (modified)

### Frontend (2 files):
1. `frontend/app/tenant/suggestions/page.tsx`
2. `frontend/app/property_manager/suggestions/page.tsx`

## Status
✅ **FEATURE COMPLETE**
- Database table created and verified
- Backend models, controllers, and routes implemented
- Frontend pages for both tenant and property manager created
- All relationships properly configured
- Security validations in place
- Ready for testing and use

## Relationship with Complaints Feature
Both features follow the same architecture pattern but serve different purposes:
- **Complaints:** For reporting issues and problems
- **Suggestions:** For proposing improvements and enhancements

Both can coexist and provide comprehensive tenant-PM communication channels.

## Next Steps
1. Test the feature thoroughly in both tenant and property manager roles
2. Consider adding email notifications when suggestion status changes
3. Consider adding voting/likes system for popular suggestions
4. Add comment/note functionality for PMs to respond to suggestions
5. Add pagination if suggestion volume grows
6. Consider adding suggestion categories (amenities, maintenance, events, etc.)
7. Track which suggestions were implemented and measure impact

