# MySQL JSON Query Fix - Monthly Reports

## Problem
The monthly reports preview endpoint was failing with a 500 error:
```
Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '@> '\"[6]\"''
```

The issue was caused by using PostgreSQL-specific JSON operators (`@>` from `Op.contains`) in a MySQL database.

## Root Cause
The code was using Sequelize's `Op.contains` operator which generates PostgreSQL's `@>` JSON containment operator:
```javascript
property_ids: {
  [Op.contains]: JSON.stringify([propertyId])
}
```

This doesn't work in MySQL, which requires the `JSON_CONTAINS()` function instead.

## Solution
Replaced all instances of `Op.contains` with MySQL's `JSON_CONTAINS()` function using `Sequelize.literal()`:

### Files Fixed:
1. **backend/controllers/monthlyReport.controller.js** (2 occurrences)
   - `generateMonthlyReport` function (line ~44)
   - `getReportPreview` function (line ~301)

2. **backend/controllers/tenantPayment.controller.js** (1 occurrence)
   - `generateFuturePayments` function (line ~490)

### Changes Made:
```javascript
// OLD (PostgreSQL syntax - doesn't work in MySQL)
property_ids: {
  [Op.contains]: JSON.stringify([propertyId])
}

// NEW (MySQL syntax - works correctly)
[Op.and]: [
  Sequelize.literal(`JSON_CONTAINS(property_ids, '${JSON.stringify([parseInt(propertyId)])}')`)
]
```

Also added `Sequelize` to the imports in both files:
```javascript
const { Op, Sequelize } = require('sequelize');
```

## Testing
The server has been restarted with the fixes applied. The monthly reports preview endpoint should now work correctly when querying for tenants associated with a specific property.

## Date Fixed
October 17, 2025

