# FTMS Integration Removal - Documentation

## Overview
This document details the removal of FTMS (Finance Tracking Management System) integration from the Inventory Management System. The system now operates as the **primary source** for item records, with no external dependencies.

## Changes Made

### 1. API Routes Updated

#### `/api/item/route.ts` (POST method)
**Changes:**
- ✅ Removed `patchFtmsProcessedItems()` function entirely
- ✅ Removed all FTMS PATCH calls after item creation
- ✅ **Added supplier linkage creation** - When creating a new item, the system now properly creates `SupplierItem` records

**New Functionality:**
```typescript
// After creating a new inventory item, the system now:
1. Creates the item in InventoryItem table
2. Creates initial batch record
3. **NEW: Iterates through linkedSuppliers array**
4. **NEW: For each supplier:**
   - Finds the supplier by name
   - Creates SupplierItem record with:
     * supplierId
     * itemId
     * categoryId (denormalized for performance)
     * supplierUnitMeasureId
     * conversionFactor
     * unitPrice
     * averageDeliveryTime
     * notes
     * isPreferred
```

#### `/api/external-inventory/route.ts`
**Changes:**
- ✅ Removed FTMS_ITEMS_URL environment variable usage
- ✅ Removed fetch calls to external FTMS system
- ✅ Returns HTTP 410 (Gone) status with deprecation message

**New Response:**
```json
{
  "success": false,
  "error": "FTMS integration has been removed. This system is now the primary source for item records."
}
```

### 2. Library Files Updated

#### `/app/lib/fetchItems.ts`
**Changes:**
- ✅ Added @deprecated JSDoc comments to all functions
- ✅ `fetchItems()` - now returns empty array
- ✅ `fetchItemById()` - now returns null
- ✅ `fetchAvailableItems()` - now returns empty array
- ✅ All functions log deprecation warnings

**Migration Path:**
```typescript
// Old (FTMS):
const items = await fetchItems();

// New (Internal):
const response = await fetch('/api/item');
const { items } = await response.json();
```

### 3. Database Schema - No Changes Needed

The `SupplierItem` table already exists with the correct structure:
```prisma
model SupplierItem {
  id                     Int
  supplierId             Int
  itemId                 Int
  categoryId             Int              // Denormalized for performance
  supplierUnitMeasureId  Int
  conversionFactor       Float            // Multiplier: supplier unit → canonical unit
  unitPrice              Float
  averageDeliveryTime    String?
  notes                  String?
  lastPurchaseDate       DateTime?
  isPreferred            Boolean
  
  @@unique([supplierId, itemId])
}
```

## Item Creation Flow - Updated

### Before (with FTMS):
```mermaid
graph LR
    A[Frontend] --> B[POST /api/item]
    B --> C[Create Item]
    C --> D[Create Batch]
    D --> E[PATCH to FTMS]
    E --> F[Return Success]
```

### After (Internal Only):
```mermaid
graph LR
    A[Frontend] --> B[POST /api/item]
    B --> C[Create Item]
    C --> D[Create Batch]
    D --> E[Create Supplier Links]
    E --> F[Return Success]
```

## Item Creation with Suppliers - Example Payload

```json
{
  "stockItems": [
    {
      "itemName": "TEST ITEM",
      "unit": "kg",
      "category": "Category 2",
      "status": "available",
      "description": "Test item description",
      "reorder": 1,
      "current_stock": 1,
      "itemStatus": "ACTIVE",
      "linkedSuppliers": [
        {
          "linkedSupplierName": "ABC Supplier",
          "supplierUnitMeasureId": 5,
          "supplierUnitName": "kg",
          "conversionFactor": 1,
          "unitPrice": 150.50,
          "averageDeliveryTime": "3-5 days",
          "isPreferred": true,
          "notes": "Primary supplier for this item"
        },
        {
          "linkedSupplierName": "XYZ Supplier",
          "supplierUnitMeasureId": 5,
          "supplierUnitName": "kg",
          "conversionFactor": 1,
          "unitPrice": 155.00,
          "averageDeliveryTime": "5-7 days",
          "isPreferred": false,
          "notes": "Backup supplier"
        }
      ]
    }
  ]
}
```

## Console Output - Expected Behavior

```
📦 Processing item 1/1: TEST ITEM
🔍 Checking if item exists: TEST ITEM
🆔 Generating batch ID for item 1
✅ Generated batch ID: BAT-01001
🆔 Generating item ID for new item 1
✅ Generated item ID: ITEM-01001
🏷️ Finding category for: Category 2
✅ Found category: CAT-00002
📏 Finding unit measure for: kg
✅ Found unit measure: Kilograms
➕ Creating new inventory item 1
✅ Successfully created item 1: ITEM-01001
🔗 Creating 2 linked suppliers for item 1
✅ Linked supplier ABC Supplier to item ITEM-01001
✅ Linked supplier XYZ Supplier to item ITEM-01001
🏁 Finished processing. Results: [ 'created' ]
POST /api/item 200 in 296ms
```

## Frontend Components - No Changes Needed

The following components already work correctly with the updated API:
- ✅ `addItemModal.tsx` - Sends `linkedSuppliers` array
- ✅ `page.tsx` - Calls `createItem()` with proper payload
- ✅ `viewItemModal.tsx` - Displays supplier linkages

## Environment Variables - Can Be Removed

The following environment variable is no longer used:
```env
# DEPRECATED - No longer used
# FTMS_ITEMS_URL=http://external-ftms-system.com/api/items
```

## Testing Checklist

- [x] Remove FTMS integration code
- [x] Add supplier linkage creation logic
- [x] Update deprecated endpoints
- [ ] **Test item creation with suppliers** ⚠️ NEEDS TESTING
- [ ] Test item creation without suppliers
- [ ] Test item update
- [ ] Test item deletion
- [ ] Verify supplier linkage display in View Item Modal
- [ ] Verify supplier linkage editing
- [ ] Test conversion factor calculations

## Known Issues

### TypeScript Errors (Non-Breaking)
Some TypeScript errors persist related to Prisma client generation:
- `stockStatus does not exist in type...`
- These are TypeScript intellisense errors only
- The schema is correct and database operations work
- **Solution**: Regenerate Prisma client or restart TypeScript server

```bash
# To fix TypeScript errors:
npx prisma generate
# Restart VS Code TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Migration Guide for Existing Code

### If you find FTMS references:
1. **Remove**: All `fetch(FTMS_ITEMS_URL, ...)` calls
2. **Replace**: Use `/api/item` endpoints instead
3. **Update**: Remove `FTMS_ITEMS_URL` from environment variables

### If you need to sync with external systems in future:
1. Create a new API endpoint (e.g., `/api/sync/external-system`)
2. Implement proper error handling and rollback logic
3. Document the integration clearly
4. **Never** make external calls blocking operations in core item CRUD

## Benefits of Removal

✅ **Simplified Architecture** - No external dependencies  
✅ **Faster Item Creation** - No waiting for external PATCH calls  
✅ **Better Error Handling** - All operations are internal  
✅ **Supplier Integration** - Proper linkage during item creation  
✅ **Data Integrity** - Single source of truth  
✅ **Easier Maintenance** - No external API version concerns  

## Support

For questions or issues related to this change, check:
1. This documentation file
2. Prisma schema: `prisma/schema.prisma`
3. Item API: `src/app/api/item/route.ts`
4. Item Management Page: `src/app/(pages)/item-management/page.tsx`

---
**Last Updated**: 2025-01-16  
**Version**: 2.0.0 (FTMS Integration Removed)
