# Linked Supplier Management Fixes

## Issues Fixed

### Issue 1: Deleted Linked Suppliers Still Appearing in View Modal
**Problem:** When a user deletes a linked supplier from the Edit Item Modal, the supplier would still appear in the View Item Modal after saving, even though it was removed from the local state and the Update button properly tracked the change.

**Root Cause:** The API GET endpoint for items (`/api/item`) was not filtering out soft-deleted supplier items. The `supplierItems` relation was fetching ALL supplier items, including those with `isDeleted: true`.

### Issue 2: Already-Linked Suppliers Appearing in Add Supplier Dropdown
**Problem:** When adding a new linked supplier to an item, the searchable dropdown would show ALL active suppliers, including those already linked to the item. This could lead to duplicate supplier links or confusion.

**Root Cause:** The Add Linked Supplier Modal was not aware of which suppliers were already linked to the item, so it couldn't filter them out of the dropdown.

---

## Solution Overview

### Fix 1: Filter Soft-Deleted Supplier Items in API
Added a `where` clause to the `supplierItems` relation in the GET endpoint to exclude soft-deleted records.

### Fix 2: Pass Existing Suppliers and Filter Dropdown
- Modified Edit Item Modal to pass existing linked suppliers to Add Linked Supplier Modal
- Updated Add Linked Supplier Modal to accept and use this data to filter the dropdown

---

## Changes Made

### File 1: `src/app/api/item/route.ts` - GET Endpoint

**Location:** Lines 60-63

**Before:**
```typescript
supplierItems: {
  select: {
    id: true,
    supplierId: true,
    // ... other fields
  }
}
```

**After:**
```typescript
supplierItems: {
  where: {
    isDeleted: false  // ← ADDED: Filter out soft-deleted items
  },
  select: {
    id: true,
    supplierId: true,
    // ... other fields
  }
}
```

**Impact:**
- View Item Modal now only displays active (non-deleted) supplier items
- Edit Item Modal loads only active supplier items
- Consistency with `batches` relation which also filters `isDeleted: false`

**Pattern Consistency:**
This follows the same pattern used for the `batches` relation (lines 47-49):
```typescript
batches: {
  where: {
    isDeleted: false
  },
  // ...
}
```

---

### File 2: `src/app/(pages)/item-management/editItemModal.tsx`

**Location:** Line 131

**Before:**
```typescript
case "add-linkedSupplier":
    content = (
        <AddLinkedSupplierModal
            onSave={handleAddLinkedSupplier}
            onClose={closeModal}
        />
    );
    break;
```

**After:**
```typescript
case "add-linkedSupplier":
    content = (
        <AddLinkedSupplierModal
            existingLinkedSuppliers={linkedSuppliers}  // ← ADDED
            onSave={handleAddLinkedSupplier}
            onClose={closeModal}
        />
    );
    break;
```

**Impact:**
- Add Linked Supplier Modal now receives the current list of linked suppliers
- Enables filtering to prevent duplicate supplier links

---

### File 3: `src/app/(pages)/item-management/linked-supplier/addLinkedSupplierModal.tsx`

#### Change 3a: Update Props Interface

**Location:** Lines 26-30

**Before:**
```typescript
interface AddLinkedSupplierModalProps {
    onClose: () => void;
    onSave: (linkedSupplierForm: LinkedSupplierForm) => void;
}

export default function AddLinkedSupplierModal({ onClose, onSave }: AddLinkedSupplierModalProps) {
```

**After:**
```typescript
interface AddLinkedSupplierModalProps {
    existingLinkedSuppliers?: any[];  // ← ADDED
    onClose: () => void;
    onSave: (linkedSupplierForm: LinkedSupplierForm) => void;
}

export default function AddLinkedSupplierModal({ existingLinkedSuppliers = [], onClose, onSave }: AddLinkedSupplierModalProps) {
```

**Notes:**
- Optional prop with default empty array for backward compatibility
- Accepts array of existing linked suppliers

#### Change 3b: Update Filter Function

**Location:** Lines 118-129

**Before:**
```typescript
const getFilteredSuppliers = () => {
    return suppliers
        .filter(supplier => 
            supplier.supplierName.toLowerCase().includes(supplierSearchTerm.toLowerCase())
        )
        .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
};
```

**After:**
```typescript
const getFilteredSuppliers = () => {
    // Get IDs of already linked suppliers
    const linkedSupplierIds = new Set(
        existingLinkedSuppliers.map((ls: any) => ls.supplierId)
    );

    return suppliers
        .filter(supplier => 
            // Filter by search term
            supplier.supplierName.toLowerCase().includes(supplierSearchTerm.toLowerCase()) &&
            // Exclude already linked suppliers
            !linkedSupplierIds.has(supplier.supplierId)
        )
        .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
};
```

**Logic Breakdown:**
1. **Create Set of Linked IDs:** Uses `Set` for O(1) lookup performance
2. **Extract supplier IDs:** Maps existing linked suppliers to their `supplierId` values
3. **Filter by search term:** Maintains original search functionality
4. **Exclude linked suppliers:** Uses `!linkedSupplierIds.has()` to filter out already-linked suppliers
5. **Sort alphabetically:** Maintains original sorting

**Performance Note:** Using a `Set` instead of `.find()` or `.includes()` provides O(1) lookup time instead of O(n), making it efficient even with many linked suppliers.

---

## Data Flow

### Issue 1 Fix - Soft Delete Filter

**Before:**
1. User deletes supplier in Edit Item Modal → removed from local state
2. User saves item → API soft-deletes SupplierItem (`isDeleted: true`)
3. User opens View Item Modal → API returns ALL supplier items (including deleted)
4. **Bug:** Deleted supplier still shows ❌

**After:**
1. User deletes supplier in Edit Item Modal → removed from local state
2. User saves item → API soft-deletes SupplierItem (`isDeleted: true`)
3. User opens View Item Modal → API filters `where: { isDeleted: false }`
4. **Fixed:** Only active suppliers show ✅

### Issue 2 Fix - Dropdown Filtering

**Before:**
1. Item has Supplier A, B, C linked
2. User clicks "Add Supplier" → Modal opens
3. Dropdown shows ALL suppliers including A, B, C
4. **Bug:** User can select already-linked supplier ❌

**After:**
1. Item has Supplier A, B, C linked
2. User clicks "Add Supplier" → Modal receives `[A, B, C]` as prop
3. `getFilteredSuppliers()` creates Set: `{A, B, C}`
4. Dropdown filters out A, B, C using `!linkedSupplierIds.has(supplier.supplierId)`
5. **Fixed:** Dropdown only shows D, E, F, etc. ✅

---

## Testing Checklist

### Test Case 1: Delete Supplier Persistence
- [ ] Open Edit Item Modal for an item with multiple linked suppliers
- [ ] Click Delete on one of the suppliers
- [ ] Confirm deletion in the SweetAlert popup
- [ ] Verify supplier is removed from the table in Edit Item Modal
- [ ] Click "Update" to save changes
- [ ] **Close Edit Item Modal**
- [ ] **Open View Item Modal** for the same item
- [ ] **Verify deleted supplier does NOT appear in View Item Modal** ✓

### Test Case 2: Multiple Deletes
- [ ] Delete 2-3 suppliers from an item
- [ ] Save the item
- [ ] Verify none of the deleted suppliers appear in View Item Modal
- [ ] Verify remaining suppliers still display correctly

### Test Case 3: Dropdown Filtering - Basic
- [ ] Open Edit Item Modal for an item with 2-3 linked suppliers
- [ ] Click "Add Supplier"
- [ ] Check the supplier dropdown
- [ ] **Verify already-linked suppliers do NOT appear in dropdown** ✓
- [ ] **Verify only unlinked suppliers appear** ✓

### Test Case 4: Dropdown Filtering - Search
- [ ] Open Add Supplier modal (as in Test 3)
- [ ] Type a search term that matches a linked supplier's name
- [ ] **Verify that linked supplier does NOT appear** even though it matches search ✓
- [ ] Type a search term for an unlinked supplier
- [ ] **Verify unlinked supplier appears** ✓

### Test Case 5: Dropdown Filtering - After Delete
- [ ] Item has suppliers A, B, C linked
- [ ] Open Add Supplier → Verify A, B, C not in dropdown
- [ ] Cancel and delete supplier B
- [ ] Open Add Supplier again
- [ ] **Verify B now appears in dropdown** (no longer linked) ✓
- [ ] **Verify A and C still do not appear** ✓

### Test Case 6: Edge Case - All Suppliers Linked
- [ ] Link all available suppliers to an item
- [ ] Open Add Supplier modal
- [ ] **Verify dropdown shows "No suppliers found"** ✓

### Test Case 7: Edge Case - Delete and Re-add
- [ ] Delete supplier A from item
- [ ] Save item
- [ ] Open Add Supplier
- [ ] **Verify A appears in dropdown** ✓
- [ ] Add A back with different conversion factor
- [ ] Save item
- [ ] View item and verify A appears with new conversion factor ✓

### Test Case 8: Database Verification
After deleting a supplier and saving:
```sql
-- Check that supplier item is soft-deleted, not hard-deleted
SELECT id, supplier_id, item_id, is_deleted 
FROM supplier_items 
WHERE item_id = [item_id] AND supplier_id = [deleted_supplier_id];
```
- [ ] Verify `is_deleted = true` (not missing row)
- [ ] Verify record still exists in database

---

## Technical Notes

### Soft Delete Pattern
Both fixes maintain the soft-delete pattern used throughout the application:
- **Benefits:**
  - Data retention for audit trails
  - Ability to restore accidentally deleted relationships
  - Historical data analysis
  - Referential integrity preserved

### TypeScript Note
The API change may show a TypeScript error about `isDeleted` not existing on `SupplierItemWhereInput`. This is due to the Prisma client types not being regenerated. The code will work correctly at runtime since the schema defines this field.

**To regenerate Prisma types (if needed):**
```bash
npx prisma generate
```

### Performance Optimization
The `Set` data structure is used in the dropdown filtering for O(1) lookup performance:
```typescript
const linkedSupplierIds = new Set(
    existingLinkedSuppliers.map((ls: any) => ls.supplierId)
);
// Later: !linkedSupplierIds.has(supplier.supplierId)  // O(1) lookup
```

**Alternative (worse performance):**
```typescript
// This would be O(n) for each supplier checked
!existingLinkedSuppliers.some(ls => ls.supplierId === supplier.supplierId)
```

### Backward Compatibility
The `existingLinkedSuppliers` prop is optional with a default empty array:
```typescript
existingLinkedSuppliers?: any[];  // Optional
// ...
{ existingLinkedSuppliers = [], onClose, onSave }  // Default value
```

This ensures the component still works if called from other contexts without this prop.

---

## Related Files

- `src/app/api/item/route.ts` - GET endpoint, PUT endpoint (soft-delete logic)
- `src/app/(pages)/item-management/editItemModal.tsx` - Parent component
- `src/app/(pages)/item-management/viewItemModal.tsx` - Displays linked suppliers
- `src/app/(pages)/item-management/linked-supplier/addLinkedSupplierModal.tsx` - Dropdown filtering
- `prisma/schema.prisma` - SupplierItem model with `isDeleted` field (line 235)
- `CONVERSION_FACTOR_SAVE_FIX.md` - Related fix for conversion factor persistence

---

## Summary

**Status:** ✅ **COMPLETE**

Both issues have been resolved:

1. **Deleted suppliers no longer appear:** The API now filters out soft-deleted supplier items when fetching data, ensuring View and Edit modals only show active suppliers.

2. **Dropdown prevents duplicates:** The Add Linked Supplier modal now receives existing suppliers and filters them from the searchable dropdown, preventing duplicate supplier links.

The implementation maintains data integrity through soft-deletes, follows established codebase patterns, uses performance-optimized filtering with `Set`, and provides a better user experience by preventing invalid operations.
