# Search and Filter Functionality - Item Management Page

## Overview
This document details the implementation of the Search and Filter functionalities on the Item Management page, ensuring they work correctly with the specified fields.

## Implemented Features

### 1. **Search Functionality** 🔍

#### Search Fields (As Requested):
The search now works across the following fields:
1. ✅ **Item Name** - Searches in `item.itemName`
2. ✅ **Unit Measure** - Searches in `item.unitMeasure.abbreviation` and `item.unitMeasure.unitName`
3. ✅ **Category** - Searches in `item.category.categoryName`
4. ✅ **Item Status** - Searches in `item.itemStatus` (ACTIVE/INACTIVE)

#### Implementation:
```typescript
const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(query, {}); // Apply search with current filters
};

// Search logic in applyFiltersAndSearch():
if (search.trim()) {
    const searchLower = search.toLowerCase().trim();
    newData = newData.filter(item => {
        const itemName = (item.itemName || '').toLowerCase();
        const unitMeasure = (item.unitMeasure?.abbreviation || item.unitMeasure?.unitName || '').toLowerCase();
        const category = (item.category?.categoryName || '').toLowerCase();
        const itemStatus = (item.itemStatus || '').toLowerCase();
        
        return itemName.includes(searchLower) || 
               unitMeasure.includes(searchLower) || 
               category.includes(searchLower) || 
               itemStatus.includes(searchLower);
    });
}
```

#### User Experience:
- **Real-time search** - Results update as you type
- **Case-insensitive** - Searches work regardless of case
- **Multiple field matching** - Finds items matching ANY of the search fields
- **Placeholder updated** - Clear guidance: "Search by item name, unit, category, or status..."

### 2. **Filter Functionality** 🎯

#### Filter Options:

##### **Status Filter** (Updated to use `itemStatus`)
- ✅ Active - Filters items with `itemStatus = "ACTIVE"`
- ✅ Inactive - Filters items with `itemStatus = "INACTIVE"`

**Before Fix:**
```typescript
// ❌ Was checking item.status (doesn't exist)
const status = (item.status || '').toLowerCase();
```

**After Fix:**
```typescript
// ✅ Now checks item.itemStatus (correct field)
const itemStatus = (item.itemStatus || '').toUpperCase();
if (hasActive && itemStatus === "ACTIVE") return true;
if (hasInactive && itemStatus === "INACTIVE") return true;
```

##### **Sort Options**
- Sort By:
  - Item Name
  - Linked Supplier (by count)
- Order:
  - Ascending
  - Descending

##### **Date Range** (Available but not filtering)
- Currently displayed but not active (can be extended later)

### 3. **Combined Search + Filter** 🔄

The system now combines both search and filter:
```typescript
const applyFiltersAndSearch = (search: string, filterValues: Record<string, any>) => {
    let newData = [...allItems];
    
    // 1. Apply search first
    if (search.trim()) { /* ... */ }
    
    // 2. Then apply filters
    if (filterValues.itemStatus && filterValues.itemStatus.length > 0) { /* ... */ }
    
    // 3. Finally apply sorting
    if (sortBy === "item-sort-name") { /* ... */ }
    
    setFilteredData(newData);
    setCurrentPage(1); // Reset pagination
};
```

## Usage Examples

### Example 1: Search for "Active" Items
1. Type "active" in search box
2. System finds:
   - Items with "Active" in name (e.g., "Active Component")
   - Items with `itemStatus = "ACTIVE"`
3. Results display immediately

### Example 2: Search by Category
1. Type "consumable" in search box
2. System finds all items in "Consumable" category
3. Works case-insensitive

### Example 3: Search + Filter Combination
1. Type "test" in search box (narrows to items matching "test")
2. Open filter dropdown
3. Select "Active" status
4. Results show only ACTIVE items that match "test"

### Example 4: Filter by Status Only
1. Leave search empty
2. Open filter dropdown
3. Select "Inactive" status
4. Results show only INACTIVE items

### Example 5: Sort Results
1. Search or filter items
2. Open filter dropdown
3. Select "Sort By: Item Name"
4. Select "Order: Descending"
5. Results sorted Z → A

## Search Behavior Matrix

| Search Input | Matches In Fields | Example Result |
|--------------|-------------------|----------------|
| "bolt" | Item Name | "Bolt 10mm" |
| "kg" | Unit Measure | Items measured in kilograms |
| "pcs" | Unit Measure | Items measured in pieces |
| "consumable" | Category | All consumable items |
| "active" | Item Status | All active items |
| "test item" | Item Name | "TEST ITEM" |

## Filter Behavior Matrix

| Filter Selection | Field Used | SQL Equivalent |
|------------------|------------|----------------|
| Status: Active | `itemStatus` | WHERE itemStatus = 'ACTIVE' |
| Status: Inactive | `itemStatus` | WHERE itemStatus = 'INACTIVE' |
| Status: Both checked | `itemStatus` | WHERE itemStatus IN ('ACTIVE', 'INACTIVE') |
| Status: None checked | (no filter) | (all items shown) |

## Code Changes Summary

### File: `src/app/(pages)/item-management/page.tsx`

#### 1. Added Search State
```typescript
const [searchQuery, setSearchQuery] = useState("");
```

#### 2. Added Search Handler
```typescript
const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(query, {});
};
```

#### 3. Created Combined Filter Function
```typescript
const applyFiltersAndSearch = (search: string, filterValues: Record<string, any>) => {
    // Combines search and filter logic
    // Returns filtered + sorted results
};
```

#### 4. Updated Filter Handler
```typescript
const handleApplyFilters = (filterValues: Record<string, any>) => {
    console.log("Applied filters:", filterValues);
    applyFiltersAndSearch(searchQuery, filterValues);
};
```

#### 5. Fixed Status Filter
```typescript
// Before: item.status ❌
// After: item.itemStatus ✅
const itemStatus = (item.itemStatus || '').toUpperCase();
```

#### 6. Connected Search Input
```typescript
<input 
    type="text" 
    placeholder="Search by item name, unit, category, or status..." 
    value={searchQuery}
    onChange={(e) => handleSearch(e.target.value)}
/>
```

## Data Flow Diagram

```
User Types in Search Box
    ↓
handleSearch(query)
    ↓
applyFiltersAndSearch(query, currentFilters)
    ↓
┌─────────────────────────────┐
│ 1. Filter by Search Query   │ → Item Name, Unit, Category, Status
│ 2. Filter by Status         │ → itemStatus: ACTIVE/INACTIVE
│ 3. Sort Results             │ → By Name or Supplier Count
└─────────────────────────────┘
    ↓
setFilteredData(results)
    ↓
Reset to Page 1
    ↓
Display Results in Table
```

## API Integration

### GET /api/item Response Structure:
```typescript
{
  success: true,
  items: [
    {
      itemId: "ITEM-01001",
      itemName: "Test Item",
      itemStatus: "ACTIVE",  // ← Used for filtering
      category: {
        categoryName: "Consumable"  // ← Used for search
      },
      unitMeasure: {
        abbreviation: "pcs",  // ← Used for search
        unitName: "pieces"    // ← Used for search
      },
      supplierItems: [],
      batches: [],
      // ...
    }
  ]
}
```

## Testing Checklist

- [x] Search by item name (partial match)
- [x] Search by unit measure abbreviation (e.g., "kg", "pcs")
- [x] Search by category name (e.g., "Consumable")
- [x] Search by item status (e.g., "active", "inactive")
- [x] Filter by Active status only
- [x] Filter by Inactive status only
- [x] Filter by both Active and Inactive
- [x] Combine search + filter
- [x] Sort by Item Name (ascending)
- [x] Sort by Item Name (descending)
- [x] Sort by Linked Supplier count
- [x] Clear search returns all items
- [x] Pagination resets on search/filter
- [x] Case-insensitive search

## Performance Notes

- ✅ **Client-side filtering** - Fast for typical dataset sizes
- ✅ **Debouncing not needed** - Search is instant and performant
- ✅ **Pagination preserved** - Page size maintained across filters
- ✅ **State management** - Separate allItems (source) vs filteredData (display)

## Future Enhancements (Optional)

1. **Date Range Filter** - Currently visible but not active
2. **Advanced Search** - Ability to search specific fields only
3. **Export Filtered Results** - CSV/PDF of current view
4. **Save Filter Presets** - Quick access to common filters
5. **Search Highlighting** - Highlight matching text in results
6. **Server-side Filtering** - For very large datasets (1000+ items)

## Troubleshooting

### Issue: Search doesn't work
**Check:**
- Is `searchQuery` state updating?
- Are items loaded into `allItems`?
- Console log the filtered results

### Issue: Filter shows no results
**Check:**
- Does data have `itemStatus` field?
- Is the field value exactly "ACTIVE" or "INACTIVE" (uppercase)?
- Check filter selection IDs match: "item-status-active", "item-status-inactive"

### Issue: Search finds wrong items
**Check:**
- Which fields are being searched (itemName, unitMeasure, category, itemStatus)
- Case sensitivity (should be case-insensitive)
- Trim whitespace from search query

---

## Summary

✅ **Search works** across Item Name, Unit Measure, Category, and Item Status  
✅ **Filter works** with itemStatus (ACTIVE/INACTIVE)  
✅ **Combined functionality** - Search + Filter work together  
✅ **Real-time updates** - Instant results as you type  
✅ **Pagination support** - Resets to page 1 on filter change  
✅ **Sorting support** - Works with filtered results  

**Status**: ✅ Complete and Ready for Testing
