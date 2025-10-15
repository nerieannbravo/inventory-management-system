# Unit Measure and Conversion Implementation Guide

## Overview

This document describes the implementation of unit measure and conversion factor functionality in the Inventory Management System. The goal is to track inventory in **canonical units** while allowing suppliers to provide items in **different units** with proper conversion handling.

---

## Database Schema Changes

### 1. SupplierItem Model Updates

**Added Fields:**
- `supplierUnitMeasureId` (Int, NOT NULL) - Foreign key to UnitMeasure table
- `conversionFactor` (Float, DEFAULT 1) - Multiplier from supplier unit to canonical unit

**Relations:**
- `supplierUnitMeasure` - Links to UnitMeasure table for supplier's unit
- Maintains existing relations with Supplier and InventoryItem

**Indexes:**
- Added index on `supplierUnitMeasureId` for query performance

**Migration:**
```sql
-- Migration: add_supplier_unit_measure_conversion
-- Adds supplierUnitMeasureId and conversionFactor to supplier_items table
-- Populates existing records with InventoryItem's canonical unit (1:1 conversion)
```

---

## Core Concepts

### 1. Canonical Unit (InventoryItem)
- Every InventoryItem has a `unitMeasureId` which is its **canonical unit**
- All stock quantities (`currentStock`) are stored in this canonical unit
- All transactions (`StockTransaction.quantity`) use canonical units
- All batch quantities (`Batch.usableQuantity`, etc.) use canonical units

### 2. Supplier Unit (SupplierItem)
- Each SupplierItem has a `supplierUnitMeasureId` for the supplier's unit
- The `conversionFactor` converts from supplier unit to canonical unit
- `unitPrice` is the price per supplier unit
- Multiple suppliers can supply the same item with different units

### 3. Conversion Formula
```
canonicalQuantity = supplierQuantity × conversionFactor
supplierQuantity = canonicalQuantity ÷ conversionFactor
```

---

## Examples

### Example 1: Bottled Water

**InventoryItem:**
- Name: "Bottled Water"
- Canonical Unit: pieces (pc)
- Current Stock: 500 pc

**Supplier A (SupplierItem):**
- Supplier Unit: boxes
- Conversion Factor: 24 (1 box = 24 pieces)
- Unit Price: ₱300 per box

**Supplier B (SupplierItem):**
- Supplier Unit: pieces
- Conversion Factor: 1 (1 piece = 1 piece)
- Unit Price: ₱15 per piece

**Receiving Stock from Supplier A:**
```
Received: 5 boxes
Conversion: 5 boxes × 24 = 120 pieces
Add to InventoryItem: currentStock += 120
Final Stock: 500 + 120 = 620 pieces
```

### Example 2: Engine Oil

**InventoryItem:**
- Name: "Engine Oil SAE 10W-40"
- Canonical Unit: liters (L)
- Current Stock: 50 L

**Supplier A (SupplierItem):**
- Supplier Unit: gallons
- Conversion Factor: 3.78541 (1 gallon = 3.78541 liters)
- Unit Price: ₱500 per gallon

**Receiving Stock from Supplier A:**
```
Received: 10 gallons
Conversion: 10 gallons × 3.78541 = 37.85 liters (rounded: 38)
Add to InventoryItem: currentStock += 38
Final Stock: 50 + 38 = 88 liters
```

### Example 3: A4 Paper

**InventoryItem:**
- Name: "A4 Bond Paper"
- Canonical Unit: sheets
- Current Stock: 2000 sheets

**Supplier A (SupplierItem):**
- Supplier Unit: reams
- Conversion Factor: 500 (1 ream = 500 sheets)
- Unit Price: ₱250 per ream

**Supplier B (SupplierItem):**
- Supplier Unit: boxes
- Conversion Factor: 2500 (1 box = 5 reams = 2500 sheets)
- Unit Price: ₱1200 per box

**Purchasing from Supplier B:**
```
Needed (canonical): 3000 sheets
Order: 3000 ÷ 2500 = 1.2 → 2 boxes (round up)
Will receive: 2 boxes × 2500 = 5000 sheets
Cost: 2 boxes × ₱1200 = ₱2400
```

---

## Implementation Workflow

### 1. Receiving Stock (Delivery Receipt)

**Process:**
1. Get SupplierItem record (includes conversionFactor)
2. Receive quantity in supplier's unit
3. Convert to canonical unit: `canonical = supplier × conversionFactor`
4. Update `InventoryItem.currentStock` in canonical unit
5. Create `StockTransaction` record in canonical unit
6. Update `Batch` quantities in canonical unit (if applicable)

**Example Code Flow:**
```typescript
// 1. Fetch SupplierItem
const supplierItem = await prisma.supplierItem.findUnique({
  where: { id: supplierItemId },
  include: { item: true, supplierUnitMeasure: true }
});

// 2. Convert quantity
const receivedInSupplierUnit = 5; // 5 boxes
const receivedInCanonical = receivedInSupplierUnit * supplierItem.conversionFactor;
// 5 × 24 = 120 pieces

// 3. Update stock (in transaction)
await prisma.inventoryItem.update({
  where: { item_id: supplierItem.item.item_id },
  data: { current_stock: { increment: receivedInCanonical } }
});

// 4. Record transaction
await prisma.stockTransaction.create({
  data: {
    // ... other fields
    quantity: receivedInCanonical, // Always in canonical unit
    remarks: `Received ${receivedInSupplierUnit} boxes (${receivedInCanonical} pieces)`
  }
});
```

### 2. Creating Purchase Request

**Process:**
1. Check if `currentStock < reorderLevel`
2. Calculate needed quantity in canonical unit
3. Convert to supplier unit for ordering
4. Calculate estimated cost based on supplier unit price
5. Create PurchaseRequest with estimated amount

**Example Calculation:**
```
Current Stock: 100 pieces
Reorder Level: 500 pieces
Needed: 500 - 100 = 400 pieces (canonical)

Preferred Supplier:
  - Unit: boxes (conversionFactor = 24)
  - Unit Price: ₱300 per box

Order Quantity: 400 ÷ 24 = 16.67 → 17 boxes (round up)
Will receive: 17 × 24 = 408 pieces
Estimated Cost: 17 × ₱300 = ₱5,100
```

### 3. Processing Delivery Receipt

**Process:**
1. For each item in delivery receipt:
   - Get received quantity in supplier unit
   - Subtract defective and missing quantities
   - Calculate usable quantity in supplier unit
   - Convert usable quantity to canonical unit
   - Update InventoryItem stock
   - Create StockTransaction

**Defective/Missing Handling:**
```
Received: 10 boxes
Defective: 1 box
Missing: 0 boxes
Usable: 10 - 1 - 0 = 9 boxes

Convert usable: 9 boxes × 24 = 216 pieces
Add to stock: currentStock += 216
```

### 4. Stock Adjustment

**Process:**
1. Physical count conducted in any unit (supplier or canonical)
2. Convert physical count to canonical unit if needed
3. Calculate difference: `adjustment = physicalCount - currentStock`
4. Update `currentStock` to physical count value
5. Record adjustment in `StockTransaction`

**Example:**
```
System Stock: 480 pieces
Physical Count: 20 boxes (supplier unit)
Convert: 20 boxes × 24 = 480 pieces
Difference: 480 - 480 = 0 (no adjustment needed)
```

---

## Data Integrity Rules

### 1. Immutability of Conversion Factor
- Once a `SupplierItem` is used in stock transactions, its `conversionFactor` should NOT be changed
- Changing it would invalidate historical transaction data
- If supplier changes their packaging, create a NEW `SupplierItem` record

### 2. Stock Quantities Always in Canonical Units
- `InventoryItem.currentStock` - canonical unit
- `Batch.usableQuantity`, `defectiveQuantity`, `missingQuantity` - canonical unit
- `StockTransaction.quantity` - canonical unit
- This ensures consistency across all stock operations

### 3. Item Naming
- `InventoryItem.itemName` should NOT include the unit
  - ✅ Correct: "Bottled Water"
  - ❌ Wrong: "Bottled Water (box)"
- Unit is determined by `unitMeasureId` relation

### 4. Multiple Suppliers Support
- Multiple `SupplierItem` records can exist for the same `InventoryItem`
- Each supplier can have different `supplierUnitMeasureId` and `conversionFactor`
- System chooses supplier based on preference, price, availability, etc.

---

## API Integration Points

### 1. Supplier Management API (`/api/supplier`)
**Updates Needed:**
- Add `supplierUnitMeasureId` and `conversionFactor` to supplier item creation
- Display supplier unit alongside canonical unit in listings
- Validate `conversionFactor > 0`

**Example Request:**
```json
{
  "supplierName": "ABC Supplies",
  "linkedItems": [
    {
      "item_id": "ITM-001",
      "supplierUnitMeasureId": 5,
      "conversionFactor": 24,
      "unitPrice": 300
    }
  ]
}
```

### 2. Purchase Request API (`/api/purchase-request`)
**Updates Needed:**
- Calculate quantities in supplier unit for display
- Store estimated cost based on supplier unit pricing
- Convert back to canonical unit for stock planning

### 3. Purchase Order API (`/api/purchase-order`)
**Updates Needed:**
- Display ordered quantities in supplier unit
- Include conversion info in order details
- Calculate expected stock in canonical unit

### 4. Delivery Receipt API (`/api/delivery-receipt`)
**Updates Needed:**
- Accept received quantities in supplier unit
- Convert to canonical unit before updating stock
- Display both units in receipt: "5 boxes (120 pieces)"

### 5. Stock Transaction API (`/api/stock`)
**Updates Needed:**
- Always store `quantity` in canonical unit
- Include conversion details in `remarks` field
- Support filtering/grouping by supplier unit in reports

---

## UI/UX Considerations

### 1. Display Format
Always show both units for clarity:
- "5 boxes (120 pieces)"
- "10 gallons (37.85 L)"
- "Received 5 boxes = 120 pieces"

### 2. Forms
- When receiving stock, allow input in supplier unit
- Show real-time conversion to canonical unit
- Display: "5 boxes × 24 = 120 pieces"

### 3. Reports
- Stock levels: Show in canonical unit
- Purchase orders: Show in supplier unit
- Conversions: Clearly indicate the conversion applied

### 4. Purchase Request Auto-calculation
```
Item: Bottled Water
Current Stock: 100 pieces
Reorder Level: 500 pieces
Needed: 400 pieces

Supplier Options:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supplier A (Preferred)
  Order: 17 boxes (408 pieces)
  Unit Price: ₱300/box
  Total: ₱5,100
  
Supplier B
  Order: 400 pieces
  Unit Price: ₱15/piece
  Total: ₱6,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Testing Scenarios

### Test Case 1: Basic Conversion
1. Create InventoryItem with canonical unit "pieces"
2. Create SupplierItem with supplier unit "boxes", conversionFactor = 24
3. Receive 5 boxes
4. Verify: currentStock increased by 120 pieces
5. Verify: StockTransaction.quantity = 120

### Test Case 2: Multiple Suppliers
1. Create InventoryItem with canonical unit "liters"
2. Create SupplierItem A: gallons, conversionFactor = 3.78541
3. Create SupplierItem B: liters, conversionFactor = 1
4. Receive 10 gallons from A
5. Receive 20 liters from B
6. Verify: currentStock = 38 + 20 = 58 liters

### Test Case 3: Purchase Request
1. Set currentStock = 100, reorderLevel = 500
2. Calculate needed = 400 canonical units
3. Get preferred supplier with conversionFactor = 24
4. Calculate order = 17 supplier units
5. Verify: estimated cost calculation correct

### Test Case 4: Delivery with Defects
1. Order: 10 boxes
2. Receive: 10 boxes, Defective: 1 box
3. Usable: 9 boxes
4. Convert: 9 × 24 = 216 pieces
5. Verify: currentStock += 216

### Test Case 5: Stock Adjustment
1. System stock: 480 pieces
2. Physical count: 20 boxes (supplier unit)
3. Convert: 20 × 24 = 480 pieces
4. Difference: 0
5. Verify: No adjustment transaction created

---

## Migration Strategy

### Phase 1: Schema Update (✅ Completed)
- Added `supplierUnitMeasureId` and `conversionFactor` columns
- Populated existing records with canonical unit (conversionFactor = 1)
- All existing SupplierItems now use same unit as InventoryItem

### Phase 2: API Updates (Next Steps)
- Update supplier creation/update endpoints
- Update purchase request calculation logic
- Update delivery receipt processing
- Update stock transaction creation

### Phase 3: UI Updates
- Add unit selection in supplier item forms
- Display conversions in delivery receipt forms
- Update purchase request UI to show both units
- Add conversion info to stock transaction lists

### Phase 4: Data Migration (If Needed)
- Review existing SupplierItems with actual supplier data
- Update conversionFactor for suppliers using different units
- Maintain historical transaction integrity

---

## Troubleshooting

### Issue: Incorrect Stock After Receiving
**Cause:** Forgot to apply conversion factor
**Solution:** Always multiply by `conversionFactor` before updating stock

### Issue: Purchase Request Quantity Wrong
**Cause:** Not converting from canonical to supplier unit
**Solution:** Divide by `conversionFactor` when calculating order quantity

### Issue: Historical Data Inconsistent
**Cause:** Changed `conversionFactor` after transactions
**Solution:** Never change `conversionFactor`; create new SupplierItem instead

### Issue: Negative Stock After Adjustment
**Cause:** Physical count conversion error
**Solution:** Double-check conversion formula and unit selection

---

## Code Examples Reference

All practical TypeScript examples are in:
- `/src/app/lib/unitConversionExamples.ts`

Key functions:
- `example1_receiveStock()` - Basic stock receiving
- `example2_processDeliveryReceipt()` - Multiple items processing
- `example3_createPurchaseRequest()` - PR with conversion
- `example4_stockAdjustment()` - Physical count adjustment
- `example5_addSupplierItem()` - Creating supplier items

Utility functions:
- `convertToCanonical(qty, factor)` - Supplier → Canonical
- `convertToSupplier(qty, factor)` - Canonical → Supplier
- `calculateCost(qty, price)` - Cost calculation

---

## Summary

✅ **Schema Updated:** SupplierItem now has `supplierUnitMeasureId` and `conversionFactor`
✅ **Migration Applied:** Existing data populated with canonical units
✅ **Examples Provided:** Comprehensive TypeScript examples created
⏳ **Next Steps:** Update API endpoints and UI components
⏳ **Testing:** Implement test cases for all scenarios

**Key Principle:** All inventory tracking happens in canonical units, conversion happens at supplier interface points (receiving, ordering).
