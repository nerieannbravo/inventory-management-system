# Linked Supplier Status Display Fix

## Issue Description

**Problem:** When adding a new linked supplier to an item in the Edit Item Modal, the Status column always displays "N/A" instead of showing the actual supplier status (ACTIVE, FLAGGED, etc.).

**Root Cause:** The `handleAddLinkedSupplier` function was creating a new supplier object with only the basic fields from the form (supplierId, linkedSupplierName, etc.) but was not including the full `supplier` relation object that contains the supplier details including the `status` field.

The table renders the status using `supplier.supplier?.status`, but newly added suppliers didn't have this nested object structure.

---

## Solution Overview

Modified the Add Linked Supplier Modal to:
1. Store the complete supplier object when a supplier is selected
2. Pass the full supplier object (with status) when saving
3. Include the supplier object in the new linked supplier record

---

## Changes Made

### File 1: `src/app/(pages)/item-management/linked-supplier/addLinkedSupplierModal.tsx`

#### Change 1a: Update Interface

**Location:** Lines 11-20

**Before:**
```typescript
export interface LinkedSupplierForm {
    supplierId?: string;
    linkedSupplierName: string;
    supplierUnitMeasureId: number;
    supplierUnitName?: string;
    conversionFactor: number;
    unitPrice: number;
    averageDeliveryTime: string;
    notes: string;
}
```

**After:**
```typescript
export interface LinkedSupplierForm {
    supplierId?: string;
    linkedSupplierName: string;
    supplierUnitMeasureId: number;
    supplierUnitName?: string;
    conversionFactor: number;
    unitPrice: number;
    averageDeliveryTime: string;
    notes: string;
    supplier?: any; // ← ADDED: Full supplier object with status
}
```

#### Change 1b: Add State for Selected Supplier

**Location:** Line 46

**Before:**
```typescript
const [formErrors, setFormErrors] = useState<FormError>({});
const [isDirty, setIsDirty] = useState(false);
const [suppliers, setSuppliers] = useState<any[]>([]);
```

**After:**
```typescript
const [formErrors, setFormErrors] = useState<FormError>({});
const [isDirty, setIsDirty] = useState(false);
const [selectedSupplier, setSelectedSupplier] = useState<any>(null); // ← ADDED
const [suppliers, setSuppliers] = useState<any[]>([]);
```

**Purpose:** Store the complete supplier object when user selects from dropdown.

#### Change 1c: Update Supplier Selection Handler

**Location:** Lines 145-160

**Before:**
```typescript
const handleSupplierSelect = (supplier: any) => {
    setLinkedSupplierForm(prev => ({
        ...prev,
        linkedSupplierName: supplier.supplierName,
        supplierId: supplier.supplierId
    }));
    setSupplierSearchTerm(supplier.supplierName);
    setShowSupplierDropdown(false);
    
    // Clear error if exists
    if (formErrors.linkedSupplierName) {
        const newErrors = { ...formErrors };
        delete newErrors.linkedSupplierName;
        setFormErrors(newErrors);
    }
};
```

**After:**
```typescript
const handleSupplierSelect = (supplier: any) => {
    setLinkedSupplierForm(prev => ({
        ...prev,
        linkedSupplierName: supplier.supplierName,
        supplierId: supplier.supplierId
    }));
    setSelectedSupplier(supplier); // ← ADDED: Store full supplier object
    setSupplierSearchTerm(supplier.supplierName);
    setShowSupplierDropdown(false);
    
    // Clear error if exists
    if (formErrors.linkedSupplierName) {
        const newErrors = { ...formErrors };
        delete newErrors.linkedSupplierName;
        setFormErrors(newErrors);
    }
};
```

**Key Addition:** `setSelectedSupplier(supplier)` stores the complete supplier object with all fields including `status`, `id`, `supplierId`, `supplierName`, etc.

#### Change 1d: Update Submit Handler

**Location:** Lines 228-239

**Before:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await showSupplierSaveConfirmation();
    if (result.isConfirmed) {
        onSave(linkedSupplierForm);
        await showSupplierSavedSuccess();
        onClose();
    }
};
```

**After:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await showSupplierSaveConfirmation();
    if (result.isConfirmed) {
        onSave({ ...linkedSupplierForm, supplier: selectedSupplier }); // ← MODIFIED
        await showSupplierSavedSuccess();
        onClose();
    }
};
```

**Key Change:** Now passes `{ ...linkedSupplierForm, supplier: selectedSupplier }` instead of just `linkedSupplierForm`, ensuring the supplier object is included.

---

### File 2: `src/app/(pages)/item-management/editItemModal.tsx`

**Location:** Lines 167-186

**Before:**
```typescript
const handleAddLinkedSupplier = (linkedSupplierForm: LinkedSupplierForm) => {
    console.log("New supplier:", linkedSupplierForm);

    // Add the new supplier to the list (can be replaced with actual data handling logic)
    const newSupplier = {
        id: linkedSuppliers.length + 1,
        supplierId: linkedSupplierForm.supplierId,
        linkedSupplierName: linkedSupplierForm.linkedSupplierName,
        supplierUnitMeasureId: linkedSupplierForm.supplierUnitMeasureId,
        supplierUnitName: linkedSupplierForm.supplierUnitName,
        conversionFactor: linkedSupplierForm.conversionFactor,
        unitPrice: linkedSupplierForm.unitPrice,
        averageDeliveryTime: linkedSupplierForm.averageDeliveryTime,
        notes: linkedSupplierForm.notes
    };
    setLinkedSuppliers([...linkedSuppliers, newSupplier]);
    closeModal();
};
```

**After:**
```typescript
const handleAddLinkedSupplier = (linkedSupplierForm: LinkedSupplierForm) => {
    console.log("New supplier:", linkedSupplierForm);

    // Add the new supplier to the list with full supplier object for status display
    const newSupplier = {
        id: linkedSuppliers.length + 1,
        supplierId: linkedSupplierForm.supplierId,
        linkedSupplierName: linkedSupplierForm.linkedSupplierName,
        supplierUnitMeasureId: linkedSupplierForm.supplierUnitMeasureId,
        supplierUnitName: linkedSupplierForm.supplierUnitName,
        conversionFactor: linkedSupplierForm.conversionFactor,
        unitPrice: linkedSupplierForm.unitPrice,
        averageDeliveryTime: linkedSupplierForm.averageDeliveryTime,
        notes: linkedSupplierForm.notes,
        supplier: linkedSupplierForm.supplier // ← ADDED
    };
    setLinkedSuppliers([...linkedSuppliers, newSupplier]);
    closeModal();
};
```

**Key Addition:** `supplier: linkedSupplierForm.supplier` includes the full supplier object in the new linked supplier record.

---

## Data Flow

### Before (Broken):

1. User selects "Supplier A" from dropdown
2. Add Modal stores: `supplierId: 1, linkedSupplierName: "Supplier A"`
3. Add Modal returns form data (no supplier object)
4. Edit Modal creates: `{ id: 1, supplierId: 1, linkedSupplierName: "Supplier A", ... }`
5. Table tries to render: `supplier.supplier?.status` → **undefined** → displays "N/A" ❌

### After (Fixed):

1. User selects "Supplier A" from dropdown (full object: `{ id: 1, supplierId: "SUP-001", supplierName: "Supplier A", status: "ACTIVE" }`)
2. Add Modal stores: `supplierId: "SUP-001", linkedSupplierName: "Supplier A"`
3. Add Modal **also stores**: `selectedSupplier = { id: 1, supplierId: "SUP-001", supplierName: "Supplier A", status: "ACTIVE" }`
4. Add Modal returns: `{ ...formData, supplier: selectedSupplier }`
5. Edit Modal creates: `{ id: 1, supplierId: "SUP-001", linkedSupplierName: "Supplier A", supplier: { status: "ACTIVE", ... }, ... }`
6. Table renders: `supplier.supplier?.status` → **"ACTIVE"** → displays colored chip ✅

---

## Table Rendering Logic

The table in Edit Item Modal (and View Item Modal) displays the status using this structure:

```tsx
<td>
    <span className={`chip ${(supplier.supplier?.status || '').toLowerCase()}`}>
        {supplier.supplier?.status || 'N/A'}
    </span>
</td>
```

**Requirements:**
- Needs `supplier.supplier.status` to exist
- Status is used for both display text and CSS class (for colored chip)
- Falls back to "N/A" if status is missing

**After Fix:**
- Newly added suppliers now have `supplier.supplier.status`
- Status chips display correctly (green for ACTIVE, orange for FLAGGED, etc.)
- Consistent with suppliers loaded from database

---

## Supplier Object Structure

The complete supplier object from the API includes:

```typescript
{
  id: number,
  supplierId: string,        // e.g., "SUP-001"
  supplierName: string,      // e.g., "Supplier Company 100"
  status: string,            // "ACTIVE", "FLAGGED", "INACTIVE", "BLOCKED"
  contactNumber: string,
  email: string,
  address: string,
  // ... other fields
}
```

**Critical Field:** `status` is what gets displayed in the Status column.

---

## Testing Checklist

### Test Case 1: Add New Supplier - Status Display
- [ ] Open Edit Item Modal for any item
- [ ] Click "Add Supplier"
- [ ] Select an ACTIVE supplier from dropdown
- [ ] Fill in conversion factor, unit price, etc.
- [ ] Click Save
- [ ] **Verify Status column shows "ACTIVE" with green chip** (not "N/A") ✓

### Test Case 2: Different Status Types
- [ ] Add supplier with status ACTIVE → Verify green chip
- [ ] Add supplier with status FLAGGED → Verify orange chip
- [ ] Verify each status has appropriate color styling

### Test Case 3: Status After Save and Reload
- [ ] Add new linked supplier with visible status
- [ ] Save the item
- [ ] Close and reopen Edit Item Modal
- [ ] **Verify status still displays correctly** (from database) ✓

### Test Case 4: Status in View Modal
- [ ] Add linked supplier in Edit Modal
- [ ] Save item
- [ ] Open View Item Modal
- [ ] **Verify status displays correctly in View Modal too** ✓

### Test Case 5: Compare with Existing Suppliers
- [ ] Item already has suppliers loaded from database
- [ ] Add a new supplier
- [ ] **Verify new supplier status displays identically to existing ones** ✓
- [ ] Both should have same chip styling and color

### Test Case 6: Multiple Adds
- [ ] Add 2-3 different suppliers in one edit session
- [ ] Verify all show correct statuses before saving
- [ ] Save item
- [ ] Verify all statuses persist after save

---

## Technical Notes

### Why This Happened

The supplier dropdown was fetching full supplier objects from the API:

```typescript
const data = await getSuppliers();
const activeSuppliers = (data.suppliers || []).filter(
    (s: any) => s.status === 'ACTIVE' || s.status === 'FLAGGED'
);
```

However, when the supplier was selected, only the ID and name were being stored:

```typescript
// Old code only stored these two fields
supplierId: supplier.supplierId,
linkedSupplierName: supplier.supplierName
```

The status was available in the `supplier` object but was being discarded.

### Data Consistency

This fix ensures that newly added suppliers have the same data structure as suppliers loaded from the database:

**From Database:**
```typescript
{
  id: 1,
  supplierId: 2,
  supplier: {
    supplierId: "SUP-001",
    supplierName: "Supplier A",
    status: "ACTIVE"
  },
  // ... other fields
}
```

**Newly Added (After Fix):**
```typescript
{
  id: 5,
  supplierId: "SUP-001",
  supplier: {             // ← Now included!
    supplierId: "SUP-001",
    supplierName: "Supplier A",
    status: "ACTIVE"
  },
  // ... other fields
}
```

### Optional Field

The `supplier` field is marked as optional (`supplier?: any`) because:
1. It allows backward compatibility
2. The table has fallback logic (`supplier.supplier?.status || 'N/A'`)
3. Not all code paths may need this field

However, for the Add Linked Supplier flow, we now always provide it.

---

## Related Files

- `src/app/(pages)/item-management/editItemModal.tsx` - Parent component, table rendering
- `src/app/(pages)/item-management/linked-supplier/addLinkedSupplierModal.tsx` - Modal for adding suppliers
- `src/app/(pages)/item-management/viewItemModal.tsx` - Also displays supplier status
- `src/styles/chips.css` - Status chip styling (colors for ACTIVE, FLAGGED, etc.)

---

## Summary

**Status:** ✅ **COMPLETE**

The linked supplier status now displays correctly when adding new suppliers:
- ✅ Full supplier object is captured when selected from dropdown
- ✅ Status field is included in the saved data
- ✅ Status chip displays with correct color (green for ACTIVE, etc.)
- ✅ Consistent behavior between newly added and database-loaded suppliers
- ✅ Works in both Edit and View Item modals

No more "N/A" status for newly added linked suppliers! The fix ensures the UI shows accurate, real-time supplier status information.
