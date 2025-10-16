# Investigation Report: Why Arber Halili Couldn't See Erjona Berisha

**Date:** October 16, 2025
**Issue:** Property Manager (Arber Halili) couldn't see Tenant (Erjona Berisha) even though both are linked via Property ID 3

## Investigation Steps & Findings

### STEP 1: Verify Database Relationships
✅ **Arber Halili (Property Manager, ID: 5)**
- Correctly assigned to Property ID 3 via `property_managers` junction table
- Email: arberhalili@gmail.com

✅ **Erjona Berisha (Tenant, ID: 7)**
- Correctly assigned to Property ID 3 in her `property_ids` field: [3]
- Email: jona@gmail.com
- Floor: 10

### STEP 2: Test Different Query Methods

#### Test 1: Op.overlap (PostgreSQL-specific)
```javascript
property_ids: { [Op.overlap]: [3] }
```
❌ **Result:** 0 tenants found
**Reason:** This operator only works with PostgreSQL arrays, not MySQL JSON

#### Test 2: Op.like with escaping issue
```javascript
property_ids: { [Op.like]: '%3%' }
```
❌ **Result:** 0 tenants found
**SQL Generated:** `WHERE property_ids LIKE '\"%3%\"'`
**Reason:** Sequelize was escaping quotes incorrectly, searching for `"3"` with escaped quotes instead of just `3`

#### Test 3: Raw SQL with JSON_CONTAINS
```sql
JSON_CONTAINS(property_ids, '3', '$')
```
✅ **Result:** 2 tenants found (Erjona Berisha & Art Zymeri)
**Reason:** This is the proper MySQL JSON function!

### STEP 3: Root Cause Identified

**THE PROBLEM:** The query was using `Op.like` which Sequelize escaped incorrectly for JSON fields in MySQL:
```sql
-- What we needed:
WHERE JSON_CONTAINS(property_ids, '3', '$')

-- What we were getting:
WHERE property_ids LIKE '\"%3%\"'
```

The backslash escaping caused the query to fail because it was searching for the literal string `"3"` with quotes, which doesn't match how MySQL stores JSON arrays.

## The Solution

Changed the query to use MySQL's native `JSON_CONTAINS` function via `Sequelize.literal`:

```javascript
const jsonContainsConditions = managedPropertyIds.map(propId => 
  db.sequelize.literal(`JSON_CONTAINS(property_ids, '${propId}', '$')`)
);

const where = {
  role: 'tenant',
  [Op.or]: jsonContainsConditions
};
```

### Verification Test Results

✅ **Query now correctly returns:**
- Erjona Berisha (jona@gmail.com) - Property IDs: [3], Floor: 10
- Art Zymeri (aa@aa.com) - Property IDs: [3], Floor: null

## Files Modified

- `backend/controllers/user.controller.js` - Updated `getTenantsForPropertyManager` function

## Summary

The issue was a **database dialect incompatibility**. The code was trying to use PostgreSQL array operators on a MySQL database, and when that failed, the fallback to LIKE had quote escaping issues. The proper solution is to use MySQL's native `JSON_CONTAINS` function, which now works perfectly.

Arber Halili can now see all tenants assigned to properties he manages, including Erjona Berisha! 🎉

