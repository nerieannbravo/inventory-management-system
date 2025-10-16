# Supplier Unit Measure Format Update

## Issue Summary
The Supplier Unit Measure dropdown in Add and Edit Linked Supplier/Item modals was displaying in the format: `"unitName (abbreviation)"` (e.g., "Pieces (pcs)") or just `"abbreviation"` in searchable dropdowns, which was inconsistent with the Item Canonical Unit implementation.

## Required Change
Update the format to match the Item Canonical Unit display: `"abbreviation - unitName"` (e.g., "pcs - Pieces").

## Files Modified

### 1. **Add Linked Item Modal** (Supplier Management)
**File:** `src/app/(pages)/supplier-management/linked-item/addLinkedItemModal.tsx`

**Change:**
```tsx
// Before:
{unit.unitName} ({unit.abbreviation})

// After:
{unit.abbreviation} - {unit.unitName}
```

**Location:** Line ~417, Supplier Unit Measure dropdown options

---

### 2. **Edit Linked Item Modal** (Supplier Management)
**File:** `src/app/(pages)/supplier-management/linked-item/editLinkedItemModal.tsx`

**Change:**
```tsx
// Before:
{unit.unitName} ({unit.abbreviation})

// After:
{unit.abbreviation} - {unit.unitName}
```

**Location:** Line ~396, Supplier Unit Measure dropdown options

---

### 3. **Add Linked Supplier Modal** (Item Management)
**File:** `src/app/(pages)/item-management/linked-supplier/addLinkedSupplierModal.tsx`

**Change:**
```tsx
// Before:
{unit.abbreviation || unit.unitName}

// After:
{unit.abbreviation} - {unit.unitName}
```

**Location:** Line ~313, Supplier Unit Measure searchable dropdown display

---

### 4. **Edit Linked Supplier Modal** (Item Management)
**File:** `src/app/(pages)/item-management/linked-supplier/editLinkedSupplierModal.tsx`

**Change:**
```tsx
// Before:
{unit.abbreviation || unit.unitName}

// After:
{unit.abbreviation} - {unit.unitName}
```

**Location:** Line ~343, Supplier Unit Measure searchable dropdown display

---

## Implementation Details

### Dropdown Types
1. **Standard Dropdowns** (Supplier Management - Linked Items)
   - Used in: `addLinkedItemModal.tsx` and `editLinkedItemModal.tsx`
   - Display format in `<option>` elements
   
2. **Searchable Dropdowns** (Item Management - Linked Suppliers)
   - Used in: `addLinkedSupplierModal.tsx` and `editLinkedSupplierModal.tsx`
   - Display format in dropdown list items

### Format Consistency

All unit measure dropdowns across the application now display in the format:
```
abbreviation - unitName
```

**Examples:**
- `pcs - Pieces`
- `kg - Kilogram`
- `box - Box`
- `L - Liter`

This matches the format used in:
- Item Management > Add Item Modal > Canonical Unit dropdown
- All other unit measure selections throughout the application

## Benefits

1. ✅ **Consistent UX** - All unit measure dropdowns display in the same format
2. ✅ **Better Readability** - Abbreviation shown first (most commonly used) followed by full name
3. ✅ **Clear Distinction** - Hyphen separator makes it easy to distinguish abbreviation from full name
4. ✅ **Improved Scanning** - Users can quickly scan by abbreviations while having full names available
5. ✅ **Alignment with Standards** - Follows the pattern established in Item Management

## Testing Checklist

### Supplier Management - Linked Items
- [ ] Open Add Linked Item modal → verify Supplier Unit dropdown shows "pcs - Pieces" format
- [ ] Select a unit → verify it saves correctly
- [ ] Open Edit Linked Item modal → verify Supplier Unit dropdown shows "pcs - Pieces" format
- [ ] Change unit → verify it updates correctly

### Item Management - Linked Suppliers
- [ ] Open Add Linked Supplier modal → verify Supplier Unit searchable dropdown shows "pcs - Pieces" format
- [ ] Search for a unit → verify filtered results show correct format
- [ ] Select a unit → verify it populates correctly
- [ ] Open Edit Linked Supplier modal → verify Supplier Unit searchable dropdown shows "pcs - Pieces" format
- [ ] Update unit → verify it saves correctly

## Visual Comparison

### Before
```
Standard Dropdowns:    Pieces (pcs)
Searchable Dropdowns:  pcs  or  Pieces
```

### After (Consistent)
```
All Dropdowns:         pcs - Pieces
```

---

**Date:** January 2025  
**Status:** ✅ Completed  
**Related:** Follows the format established in Item Canonical Unit implementation
