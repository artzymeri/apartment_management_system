# Monthly Payment Tracking Feature - Implementation Complete

## Overview
Implemented a comprehensive monthly payment tracking system for the apartment management application. Property Managers can now track tenant payments month-by-month, mark payments as paid/pending/overdue, and view payment statistics.

## Database Changes

### New Table: `tenant_payments`
Created a new table to track monthly payments:
- **Columns:**
  - `id`: Primary key
  - `tenant_id`: Foreign key to users table
  - `property_id`: Foreign key to properties table
  - `payment_month`: DATE - First day of the month (e.g., 2025-10-01)
  - `amount`: DECIMAL(10,2) - Monthly payment amount
  - `status`: ENUM('pending', 'paid', 'overdue')
  - `payment_date`: DATE - When payment was marked as paid
  - `notes`: TEXT - Optional notes
  - `created_at`, `updated_at`: Timestamps

- **Indexes:**
  - Unique constraint on (tenant_id, property_id, payment_month)
  - Indexes on tenant_id, property_id, payment_month, and status for fast queries

### Migration Script
- File: `backend/migrations/create_tenant_payments_table.sql`
- Runner: `backend/run_tenant_payments_migration.js`
- Automatically generates payment records for existing tenants from property creation date to current month

## Backend Implementation

### 1. Model (`backend/models/tenantPayment.model.js`)
- Sequelize model for tenant_payments table
- Relationships with User and Property models

### 2. Controller (`backend/controllers/tenantPayment.controller.js`)
Endpoints implemented:
- `getTenantPayments`: Get payments for a specific tenant (with filters)
- `getPropertyManagerPayments`: Get all payments for PM's properties
- `getPaymentStatistics`: Get aggregated statistics (paid/pending/overdue counts and amounts)
- `updatePaymentStatus`: Update single payment status
- `bulkUpdatePayments`: Update multiple payments at once
- `generateFuturePayments`: Create payment records for future months (advance payments)

### 3. Routes (`backend/routes/tenantPayment.routes.js`)
- `GET /api/tenant-payments/tenant/:tenantId` - Get tenant payments
- `GET /api/tenant-payments/property-manager` - Get PM payments
- `GET /api/tenant-payments/statistics` - Get payment statistics
- `PATCH /api/tenant-payments/:id` - Update payment status
- `PATCH /api/tenant-payments` - Bulk update payments
- `POST /api/tenant-payments/generate-future` - Generate future payments

### 4. Payment Utilities (`backend/utils/paymentUtils.js`)
Helper functions:
- `generatePaymentRecords`: Auto-generate payment records for a tenant
- `updatePaymentRecordsAmount`: Update amounts when monthly rate changes
- `updateOverduePayments`: Mark old pending payments as overdue
- `generateNewMonthPayments`: Cron job function for new month (to be scheduled)

### 5. Integration with User Controller
Updated `backend/controllers/user.controller.js`:
- Automatically generates payment records when creating tenants
- Updates payment records when tenant properties or monthly rates change
- Generates records for newly assigned properties

## Frontend Implementation

### 1. API Service (`frontend/lib/tenant-payment-api.ts`)
TypeScript service for all payment-related API calls:
- Type definitions for TenantPayment and PaymentStatistics
- Functions matching all backend endpoints

### 2. PaymentTracker Component (`frontend/components/PaymentTracker.tsx`)
Reusable component for displaying and managing payments:
- **Features:**
  - Statistics cards showing paid/pending/overdue counts and amounts
  - Payment history table with status badges
  - Filter by year
  - Update payment status with dialog
  - Generate future payment records
  - Color-coded status badges (green=paid, yellow=pending, red=overdue)

### 3. Updated Tenant Edit Page
`frontend/app/property_manager/tenants/edit/[id]/page.tsx`:
- Added PaymentTracker component at the bottom of the page
- Shows payment history for the selected tenant and property
- Allows PM to mark payments as paid directly from tenant page

### 4. New Payments Dashboard Page
`frontend/app/property_manager/payments/page.tsx`:
- Overview dashboard for all payments across properties
- Statistics cards showing totals
- Filterable table by:
  - Year
  - Property
  - Status (paid/pending/overdue)
- Quick actions to mark payments as paid/pending
- Shows tenant and property details for each payment

## Key Features

### Automatic Payment Generation
1. **On Tenant Creation**: Payment records automatically generated from property creation date to current month
2. **On Property Assignment**: New records created when tenant assigned to additional properties
3. **On Monthly Rate Change**: Existing pending/future payment amounts updated
4. **Monthly Cron**: `generateNewMonthPayments()` function ready for cron scheduling

### Dynamic Month Display
- Only shows months from property creation date to current date
- Future months only appear if PM manually generates them (advance payments)
- Prevents showing months that haven't occurred yet unless explicitly added

### Payment Status Management
- **Pending**: Default status for new payments
- **Paid**: Marked by PM when payment received (auto-sets payment_date)
- **Overdue**: Can be manually set or automated via cron job

### Filters and Statistics
- View payments by year, property, tenant, and status
- Real-time statistics showing counts and total amounts
- Property managers only see data for properties they manage

## Security
- All endpoints protected with authentication middleware
- Property managers can only access payments for their managed properties
- Tenants (future enhancement) could view their own payment history

## Usage Flow

### For Property Manager:
1. **Create/Edit Tenant**: Set monthly rate and assign to property
2. **Payment Records Auto-Generated**: From property creation date to current month
3. **View Payments**: 
   - Navigate to tenant edit page to see individual tenant payments
   - Navigate to `/property_manager/payments` for overview of all payments
4. **Mark Payments**: Click "Update" or "Mark Paid" to change status
5. **Advance Payments**: Click "Add Future Payments" to generate records for upcoming months

### Example Scenario:
- Property created: January 2025
- Tenant added: March 2025 with €500/month rate
- System generates: March, April, May, June, July, August, September, October 2025 (8 months)
- PM marks March-August as "Paid"
- September-October remain "Pending"
- If November starts, cron job auto-generates November record
- PM can manually add December-February if tenant pays in advance

## Files Created/Modified

### Backend:
- ✅ `migrations/create_tenant_payments_table.sql`
- ✅ `run_tenant_payments_migration.js`
- ✅ `models/tenantPayment.model.js`
- ✅ `models/index.js` (updated)
- ✅ `controllers/tenantPayment.controller.js`
- ✅ `controllers/user.controller.js` (updated)
- ✅ `routes/tenantPayment.routes.js`
- ✅ `server.js` (updated)
- ✅ `utils/paymentUtils.js`

### Frontend:
- ✅ `lib/tenant-payment-api.ts`
- ✅ `components/PaymentTracker.tsx`
- ✅ `app/property_manager/tenants/edit/[id]/page.tsx` (updated)
- ✅ `app/property_manager/payments/page.tsx`

## Next Steps (Optional Enhancements)

1. **Cron Job Setup**: Schedule `generateNewMonthPayments()` to run on 1st of each month
2. **Email Notifications**: Notify tenants of upcoming/overdue payments
3. **Payment Receipts**: Generate PDF receipts when marking as paid
4. **Bulk Operations**: Checkbox selection for bulk status updates
5. **Export Reports**: Export payment history to CSV/Excel
6. **Tenant Portal**: Allow tenants to view their payment history
7. **Payment Method Tracking**: Add field for payment method (cash/bank transfer/card)
8. **Late Fees**: Automatically calculate late fees for overdue payments
9. **Payment History Chart**: Visual charts showing payment trends over time

## Testing Checklist

- [x] Database migration runs successfully
- [ ] Payment records generated for existing tenants
- [ ] Create new tenant generates payment records
- [ ] Update tenant monthly rate updates payment amounts
- [ ] Assign tenant to new property generates new records
- [ ] Payment status updates work correctly
- [ ] Filters work on payment dashboard
- [ ] Statistics calculate correctly
- [ ] Future payment generation works
- [ ] Only current and past months shown (unless manually added)
- [ ] Property manager sees only their properties' payments

