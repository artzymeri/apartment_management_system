# Monthly Reports Feature - Complete Implementation

## Overview
The Monthly Reports feature allows Property Managers to generate comprehensive financial reports for their properties. Reports include budget analysis based on tenant payments and spending allocation across configurable categories.

## Features Implemented

### Backend (Node.js/Express/MySQL)

#### 1. Database Schema
- **Table**: `monthly_reports`
- **Fields**:
  - `id` - Primary key
  - `property_id` - Foreign key to properties
  - `report_month` - First day of the month (DATE)
  - `generated_by_user_id` - Foreign key to users
  - `total_budget` - Total collected from paid tenants (DECIMAL)
  - `total_tenants` - Total number of tenants (INT)
  - `paid_tenants` - Number of tenants who paid (INT)
  - `pending_amount` - Amount still pending (DECIMAL)
  - `spending_breakdown` - JSON array of budget allocations
  - `notes` - Optional text notes
  - `created_at`, `updated_at` - Timestamps

#### 2. API Endpoints
All endpoints require authentication and Property Manager role:

- **GET** `/api/monthly-reports/preview` - Preview report data without saving
  - Query params: `propertyId`, `month`, `year`
  - Returns: Property data, payments, spending configs, calculations

- **POST** `/api/monthly-reports/generate` - Generate or update a report
  - Body: `{ propertyId, month, year, notes?, spendingAllocations? }`
  - Creates new report or updates existing one for the same month

- **GET** `/api/monthly-reports/all` - Get all reports across managed properties
  - Query params: `year` (optional)
  
- **GET** `/api/monthly-reports/property/:propertyId` - Get reports for specific property
  - Query params: `year` (optional)

- **GET** `/api/monthly-reports/:reportId` - Get detailed report with payment data

- **DELETE** `/api/monthly-reports/:reportId` - Delete a report

#### 3. Key Files
- `backend/models/monthlyReport.model.js` - Sequelize model
- `backend/controllers/monthlyReport.controller.js` - Business logic
- `backend/routes/monthlyReport.routes.js` - Route definitions
- `backend/migrations/add_monthly_reports_table.sql` - Database migration
- `backend/run_monthly_reports_migration.js` - Migration script

### Frontend (Next.js/React/TypeScript)

#### 1. Pages
- **`/property_manager/monthly-reports`** - Main dashboard with two tabs:
  - **Generate Report Tab**: Create new reports
  - **Saved Reports Tab**: View and manage existing reports

#### 2. Components

##### MonthlyReportDashboard
Advanced dashboard component featuring:
- **Overview Statistics Cards**:
  - Total Budget (from paid tenants)
  - Collection Rate (% of tenants who paid)
  - Pending Amount (from unpaid tenants)
  - Spending Categories count

- **Budget Allocation System**:
  - Interactive table with editable amounts/percentages
  - Real-time allocation tracking
  - Visual progress bars for each category
  - Color-coded budget distribution chart
  - Validation to prevent over-allocation

- **Payment Details Table**:
  - Complete list of all tenants and their payment status
  - Filterable by status (Paid, Pending, Overdue)
  - Shows tenant info, floor, amount, payment date

- **Notes Section**: Free-text area for additional comments

##### SavedReportsList
Report history component featuring:
- **Filterable by year**
- **Comprehensive table** showing:
  - Property name
  - Report period (month/year)
  - Total budget
  - Tenant payment statistics
  - Collection rate (color-coded badges)
  - Budget utilization visualization
  - Generation date
- **Actions**: View details, Delete
- **Detail Modal**: Full report breakdown with spending allocations

#### 3. Key Files
- `frontend/app/property_manager/monthly-reports/page.tsx` - Main page
- `frontend/components/MonthlyReportDashboard.tsx` - Report generator
- `frontend/components/SavedReportsList.tsx` - Report history
- `frontend/lib/monthly-report-api.ts` - API client functions
- `frontend/hooks/useMonthlyReports.ts` - React Query hooks

## Report Generation Workflow

1. **Select Property & Period**: Choose property, month, and year
2. **Preview Data**: System fetches:
   - All tenants for the property
   - Payment records for the selected month
   - Assigned spending configurations
3. **Calculate Metrics**:
   - Total budget = Sum of paid tenant payments
   - Pending amount = Sum of unpaid/overdue payments
   - Collection rate = (Paid tenants / Total tenants) × 100
4. **Allocate Budget**: 
   - Default: Equal distribution across spending configs
   - Editable: Adjust amounts or percentages per category
   - Validation: Prevent over-allocation
5. **Add Notes**: Optional context or comments
6. **Generate & Save**: Persist report to database

## UI/UX Features

### Design Elements
- **Color-coded status badges**: Green (>90%), Yellow (70-90%), Red (<70%)
- **Visual budget breakdown**: Multi-color horizontal bar chart
- **Progress indicators**: Loading states and animations
- **Responsive grid layouts**: Mobile-friendly design
- **Interactive tables**: Sortable, filterable data views

### User Interactions
- **Inline editing**: Click "Edit Allocations" to modify budget distribution
- **Real-time calculations**: Instant feedback on allocation changes
- **Validation alerts**: Warning when budget is over-allocated
- **Toast notifications**: Success/error feedback for actions
- **Confirmation dialogs**: Prevent accidental deletions

## Data Flow

```
1. User selects property + month/year
   ↓
2. Frontend calls preview API
   ↓
3. Backend queries:
   - Property data
   - Tenant list (from property_ids JSON)
   - Tenant payments for the month
   - Property spending configs
   ↓
4. Backend calculates:
   - Total budget (sum of paid payments)
   - Pending amount (sum of pending/overdue)
   - Tenant counts
   ↓
5. Frontend displays:
   - Overview stats
   - Payment breakdown
   - Spending allocation editor
   ↓
6. User edits allocations & adds notes
   ↓
7. User clicks "Generate & Save Report"
   ↓
8. Backend saves to monthly_reports table
   ↓
9. Report appears in "Saved Reports" tab
```

## Database Migration

To create the monthly_reports table, run:

```bash
cd backend
node run_monthly_reports_migration.js
```

Or manually execute:
```bash
mysql -u root -p < migrations/add_monthly_reports_table.sql
```

## Dependencies

### Backend
- Existing: `sequelize`, `express`, `mysql2`
- No new dependencies required

### Frontend
- Existing: `react-query`, `date-fns`, `sonner`, `lucide-react`
- No new dependencies required

## Security & Permissions

- All endpoints protected by `verifyToken` middleware
- All endpoints require `isPropertyManager` role
- Users can only access reports for properties they manage
- Property access verified via `property_managers` junction table

## Future Enhancements

Potential improvements:
1. **PDF Export**: Generate downloadable PDF reports
2. **Email Reports**: Send reports to stakeholders
3. **Comparison Views**: Compare month-over-month performance
4. **Budget Forecasting**: Predict future budgets based on trends
5. **Charts & Graphs**: Add pie charts and trend lines
6. **Expense Tracking**: Link actual expenses to allocated budgets
7. **Approval Workflow**: Multi-step approval process for reports
8. **Templates**: Save allocation templates for reuse

## Testing Recommendations

1. **Test with multiple properties**: Verify isolation between properties
2. **Test edge cases**:
   - No tenants in property
   - No payments for the month
   - No spending configs assigned
   - Over-allocation scenarios
3. **Test permissions**: Ensure PMs can only access their properties
4. **Test data integrity**: Verify calculations are accurate
5. **Test concurrent edits**: Multiple users editing same report

## Technical Notes

- Reports are **unique per property per month** (enforced by database constraint)
- Updating a report for the same month **overwrites** the previous report
- **Spending allocations** are stored as JSON for flexibility
- **Collection rate** calculation handles division by zero
- **Budget validation** prevents saving over-allocated budgets
- Frontend uses **React Query** for efficient caching and refetching

---

## Quick Start

1. **Run migration**: `node backend/run_monthly_reports_migration.js`
2. **Restart backend**: Server auto-loads new routes
3. **Navigate to**: `/property_manager/monthly-reports`
4. **Select property & period**
5. **Review preview data**
6. **Adjust allocations** (optional)
7. **Add notes** (optional)
8. **Click "Generate & Save Report"**
9. **View in "Saved Reports" tab**

---

**Feature Status**: ✅ Complete and ready for use
**Version**: 1.0.0
**Created**: October 17, 2025

