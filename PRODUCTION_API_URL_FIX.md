# Production API URL Fix - Complete

## Problem
In production, several API calls were failing with 500 errors because they were using hardcoded `http://localhost:5000` URLs instead of the production API URL.

**Failed APIs:**
- `http://localhost:5000/api/complaints/manager?`
- `http://localhost:5000/api/properties?limit=1000`

## Solution
Replaced all hardcoded `localhost:5000` URLs with dynamic environment variable usage:
```javascript
${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
```

## Files Fixed

### Property Manager Pages
1. **`frontend/app/property_manager/complaints/page.tsx`** (4 URLs fixed)
   - Fetch complaints manager endpoint
   - Fetch properties endpoint
   - Update complaint status endpoint
   - Refresh complaints endpoint

2. **`frontend/app/property_manager/suggestions/page.tsx`** (Already fixed)
3. **`frontend/app/property_manager/page.tsx`** (Already fixed)

### Tenant Pages
4. **`frontend/app/tenant/complaints/page.tsx`** (4 URLs fixed)
   - Fetch properties for complaints
   - Fetch my complaints
   - Submit complaint
   - Refresh complaints after submission

5. **`frontend/app/tenant/suggestions/page.tsx`** (4 URLs fixed)
   - Fetch properties for suggestions
   - Fetch my suggestions
   - Submit suggestion
   - Refresh suggestions after submission

6. **`frontend/app/tenant/report-problem/page.tsx`** (4 URLs fixed)
   - Fetch problem options
   - Fetch my reports
   - Submit report
   - Refresh reports after submission

### Other Pages
7. **`frontend/app/register/page.tsx`** (Already fixed)
8. **`frontend/lib/city-api.ts`** (Already fixed)

## Total URLs Fixed
**20+ hardcoded URLs** have been replaced with environment variable references.

## Environment Configuration

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production (Environment Variables)
```bash
NEXT_PUBLIC_API_URL=https://apartment-management-system-qbj3.onrender.com
```

## Backend CORS Fix
Also fixed backend cookie `sameSite` settings for cross-origin authentication:
- Changed from `sameSite: 'strict'` to `sameSite: 'none'` in production
- This allows cookies to work between `bllokusync.com` and the Render backend

## Deployment Checklist
- [x] Update all frontend API calls to use environment variable
- [x] Fix backend CORS and cookie settings
- [ ] Deploy backend to Render (ensure `NODE_ENV=production` is set)
- [ ] Deploy frontend with `NEXT_PUBLIC_API_URL` pointing to production backend
- [ ] Test all API endpoints in production

## Testing
After deployment, test these pages:
- Property Manager Complaints page
- Property Manager Suggestions page
- Tenant Complaints page
- Tenant Suggestions page
- Tenant Report Problem page
- Admin login/authentication

All API calls should now correctly use the production backend URL instead of localhost.

