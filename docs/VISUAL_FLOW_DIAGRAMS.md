# Unit Measure System - Visual Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     INVENTORY MANAGEMENT SYSTEM                  │
│                                                                   │
│  ┌────────────────┐         ┌──────────────────────────────┐    │
│  │  UnitMeasure   │         │      InventoryItem           │    │
│  │  ─────────────  │◄────────│      ───────────────         │    │
│  │  - id          │         │      - id                    │    │
│  │  - unitName    │         │      - itemName              │    │
│  │  - abbreviation│         │      - unitMeasureId ────────┼────┘
│  └────────────────┘         │      - currentStock (canonical)   
│         ▲                   │      - reorderLevel          │    
│         │                   └──────────────────────────────┘    
│         │                              ▲                         
│         │                              │                         
│         │                   ┌──────────┴────────────────────┐   
│         │                   │      SupplierItem             │   
│         │                   │      ────────────             │   
│         │                   │      - supplierId             │   
│         │                   │      - itemId ────────────────┼───┘
│         └───────────────────┼──────- supplierUnitMeasureId │   
│                             │      - conversionFactor       │   
│                             │      - unitPrice              │   
│                             └───────────────────────────────┘   
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Conversion Flow

### Scenario: Receiving Stock from Supplier

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: SUPPLIER DELIVERS                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Delivery Receipt: "5 boxes of Bottled Water"                       │
│                                                                      │
│  ┌─────────────────┐                                                │
│  │ Delivered: 5    │  (Supplier Unit: boxes)                        │
│  └─────────────────┘                                                │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 2: LOOKUP CONVERSION FACTOR                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Query: SupplierItem for this Supplier + Item                       │
│                                                                      │
│  Result:                                                             │
│  ┌──────────────────────────────────────────────────┐               │
│  │ SupplierItem                                     │               │
│  │  - supplierUnitMeasure: "box"                    │               │
│  │  - conversionFactor: 24                          │               │
│  │  - itemName: "Bottled Water"                     │               │
│  │  - canonical unit: "pieces"                      │               │
│  └──────────────────────────────────────────────────┘               │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 3: CONVERT TO CANONICAL UNIT                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Formula: canonicalQty = supplierQty × conversionFactor             │
│                                                                      │
│  Calculation:                                                        │
│  ┌────────────────────────────────────────────┐                     │
│  │  5 boxes  ×  24 pieces/box  =  120 pieces  │                     │
│  └────────────────────────────────────────────┘                     │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 4: UPDATE INVENTORY                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Before:                                                             │
│  ┌─────────────────────────────────────────┐                        │
│  │ InventoryItem                           │                        │
│  │  - currentStock: 500 pieces             │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                      │
│  Action: currentStock += 120 pieces                                 │
│                                                                      │
│  After:                                                              │
│  ┌─────────────────────────────────────────┐                        │
│  │ InventoryItem                           │                        │
│  │  - currentStock: 620 pieces ✅          │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 5: CREATE TRANSACTION RECORD                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ StockTransaction                                              │  │
│  │  - transactionId: STK-00123                                   │  │
│  │  - transactionType: STOCK_IN                                  │  │
│  │  - quantity: 120 pieces (canonical!)                          │  │
│  │  - remarks: "Received 5 boxes (120 pieces) [×24]"            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Purchase Order Flow

### Scenario: Creating Purchase Order

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: CHECK STOCK LEVEL                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────┐                         │
│  │ InventoryItem: Bottled Water           │                         │
│  │  - currentStock: 100 pieces            │                         │
│  │  - reorderLevel: 500 pieces            │                         │
│  │  - canonical unit: pieces              │                         │
│  └────────────────────────────────────────┘                         │
│                                                                      │
│  Status: ⚠️ BELOW REORDER LEVEL                                     │
│  Needed: 500 - 100 = 400 pieces                                     │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 2: SELECT SUPPLIER                                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Preferred Supplier: ABC Supplies                                    │
│  ┌──────────────────────────────────────────┐                       │
│  │ SupplierItem                             │                       │
│  │  - supplierUnit: boxes                   │                       │
│  │  - conversionFactor: 24 pieces/box       │                       │
│  │  - unitPrice: ₱300/box                   │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 3: CONVERT TO SUPPLIER UNIT                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Formula: supplierQty = canonicalQty ÷ conversionFactor             │
│                                                                      │
│  Calculation:                                                        │
│  ┌────────────────────────────────────────────┐                     │
│  │  400 pieces ÷ 24 pieces/box = 16.67 boxes  │                     │
│  │  Round up: 17 boxes                        │                     │
│  └────────────────────────────────────────────┘                     │
│                                                                      │
│  Will receive: 17 × 24 = 408 pieces                                 │
│  Excess: 408 - 400 = 8 pieces                                       │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 4: CALCULATE COST                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────┐                     │
│  │  Order Quantity: 17 boxes                  │                     │
│  │  Unit Price: ₱300/box                      │                     │
│  │  Total Cost: 17 × ₱300 = ₱5,100           │                     │
│  └────────────────────────────────────────────┘                     │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│ STEP 5: CREATE PURCHASE ORDER                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ PurchaseOrder                                                 │  │
│  │  - poId: PO-00123                                             │  │
│  │  - supplierId: ABC Supplies                                   │  │
│  │  - itemId: ITM-001 (Bottled Water)                            │  │
│  │  - quantity: 17 boxes (supplier unit)                         │  │
│  │  - totalAmount: ₱5,100                                        │  │
│  │  - expectedStock: 408 pieces (canonical)                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Supplier Comparison

### Scenario: Same Item, Different Suppliers

```
┌─────────────────────────────────────────────────────────────────────┐
│ ITEM: BOTTLED WATER                                                 │
│ Canonical Unit: pieces                                              │
│ Need: 400 pieces                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SUPPLIER A: ABC SUPPLIES                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Supplier Unit: boxes                                                │
│  Conversion Factor: 24 pieces/box                                   │
│  Unit Price: ₱300/box                                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Calculation:                                               │    │
│  │  Order: 400 ÷ 24 = 16.67 → 17 boxes                       │    │
│  │  Will Receive: 17 × 24 = 408 pieces                       │    │
│  │  Total Cost: 17 × ₱300 = ₱5,100                           │    │
│  │  Unit Cost: ₱5,100 ÷ 408 = ₱12.50/piece                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SUPPLIER B: XYZ DISTRIBUTORS                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Supplier Unit: pieces                                               │
│  Conversion Factor: 1 piece/piece                                   │
│  Unit Price: ₱15/piece                                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Calculation:                                               │    │
│  │  Order: 400 ÷ 1 = 400 pieces                              │    │
│  │  Will Receive: 400 × 1 = 400 pieces                       │    │
│  │  Total Cost: 400 × ₱15 = ₱6,000                           │    │
│  │  Unit Cost: ₱6,000 ÷ 400 = ₱15/piece                      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ COMPARISON RESULT                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🏆 Best Option: SUPPLIER A (ABC SUPPLIES)                          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Savings: ₱6,000 - ₱5,100 = ₱900                           │    │
│  │ Better unit price: ₱12.50 vs ₱15                          │    │
│  │ Excess stock: 8 pieces (acceptable)                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Integrity Flow

### How Units are Maintained Throughout the System

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA STORAGE PRINCIPLE                        │
│                                                                      │
│  ALL quantities stored in CANONICAL UNIT (InventoryItem unit)       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐          ┌───────────────┐         ┌───────────────┐
│ InventoryItem │          │     Batch     │         │StockTransaction
├───────────────┤          ├───────────────┤         ├───────────────┤
│ currentStock  │          │usableQuantity │         │   quantity    │
│   (pieces)    │          │   (pieces)    │         │   (pieces)    │
└───────────────┘          └───────────────┘         └───────────────┘
                                                              │
                                                              │
                                                              ▼
                                                      ┌───────────────┐
                                                      │    remarks    │
                                                      │  "5 boxes =   │
                                                      │  120 pieces"  │
                                                      └───────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    CONVERSION AT INTERFACE POINTS                    │
└─────────────────────────────────────────────────────────────────────┘

  Receiving Stock          Purchase Order           Display
  ───────────────          ──────────────           ───────
       │                        │                       │
       │ Supplier Unit          │ Supplier Unit         │
       ▼                        ▼                       ▼
  ┌─────────┐             ┌─────────┐            ┌──────────┐
  │ 5 boxes │             │17 boxes │            │ 620 pcs  │
  └────┬────┘             └────┬────┘            │ (25 boxes)│
       │                       │                 └──────────┘
       │ ×24                   │ ×24                   ▲
       ▼                       ▼                       │
  ┌──────────┐           ┌──────────┐                 │
  │120 pieces│───────────│408 pieces│─────────────────┘
  └──────────┘           └──────────┘
   Canonical              Canonical
   (Store)               (Calculate)
```

---

## Error Prevention Flow

### Protecting Data Integrity

```
┌─────────────────────────────────────────────────────────────────────┐
│ VALIDATION CHECKPOINTS                                              │
└─────────────────────────────────────────────────────────────────────┘

1. When Creating SupplierItem
   ┌────────────────────────────────────┐
   │ ✓ conversionFactor > 0             │
   │ ✓ supplierUnitMeasureId valid      │
   │ ✓ References existing Item         │
   └────────────────────────────────────┘

2. When Receiving Stock
   ┌────────────────────────────────────┐
   │ ✓ SupplierItem exists              │
   │ ✓ Quantity > 0                     │
   │ ✓ Defective + Missing < Received   │
   │ ✓ Conversion result is integer     │
   └────────────────────────────────────┘

3. When Creating Transaction
   ┌────────────────────────────────────┐
   │ ✓ Always use canonical quantity    │
   │ ✓ Include conversion in remarks    │
   │ ✓ Reference original supplier qty  │
   │ ✓ Transaction type appropriate     │
   └────────────────────────────────────┘

4. When Updating Stock
   ┌────────────────────────────────────┐
   │ ✓ Use atomic increment/decrement   │
   │ ✓ Wrap in database transaction     │
   │ ✓ Rollback on any error            │
   │ ✓ No negative stock allowed        │
   └────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│ IMMUTABILITY RULE                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ❌ DON'T: Change conversionFactor after transactions               │
│                                                                      │
│  ┌────────────────────────────────────────┐                         │
│  │ SupplierItem (ID: 123)                 │                         │
│  │  conversionFactor: 24                  │                         │
│  │  ↓ Transaction created                 │                         │
│  │  ↓ Stock updated                       │                         │
│  │  ❌ conversionFactor: 30 (WRONG!)     │                         │
│  │     Historical data now invalid!       │                         │
│  └────────────────────────────────────────┘                         │
│                                                                      │
│  ✅ DO: Create new SupplierItem                                     │
│                                                                      │
│  ┌────────────────────────────────────────┐                         │
│  │ SupplierItem (ID: 123)                 │                         │
│  │  conversionFactor: 24                  │                         │
│  │  isPreferred: false (deprecated)       │                         │
│  │                                        │                         │
│  │ SupplierItem (ID: 456) NEW             │                         │
│  │  conversionFactor: 30                  │                         │
│  │  isPreferred: true                     │                         │
│  └────────────────────────────────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Complete Lifecycle Example

```
┌────────────┐
│  Day 1     │ Create Item & Supplier
└────────────┘
      │
      ▼
┌───────────────────────────────────────────┐
│ InventoryItem: Bottled Water             │
│  - unitMeasureId: 1 (pieces)              │
│  - currentStock: 0                        │
│  - reorderLevel: 500                      │
└───────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────┐
│ SupplierItem: ABC Supplies                │
│  - supplierUnitMeasureId: 5 (boxes)       │
│  - conversionFactor: 24                   │
│  - unitPrice: ₱300                        │
└───────────────────────────────────────────┘

┌────────────┐
│  Day 2     │ Check Stock, Create PO
└────────────┘
      │
      ▼
Stock Check: 0 < 500 ⚠️
Needed: 500 pieces
Order: 500 ÷ 24 = 21 boxes
      │
      ▼
┌───────────────────────────────────────────┐
│ PurchaseOrder: PO-001                     │
│  - Quantity: 21 boxes                     │
│  - Total: ₱6,300                          │
│  - Expected Stock: 504 pieces             │
└───────────────────────────────────────────┘

┌────────────┐
│  Day 5     │ Receive Delivery
└────────────┘
      │
      ▼
Received: 21 boxes
Defective: 1 box
Usable: 20 boxes = 480 pieces
      │
      ▼
┌───────────────────────────────────────────┐
│ InventoryItem                             │
│  currentStock: 0 → 480 pieces ✅          │
└───────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────┐
│ StockTransaction: STK-001                 │
│  - Type: STOCK_IN                         │
│  - Quantity: 480 pieces                   │
│  - Remarks: "Received 20 boxes (480 pcs)" │
└───────────────────────────────────────────┘

┌────────────┐
│  Day 10    │ Reorder Triggered
└────────────┘
      │
      ▼
Stock: 450 pieces (consumed 30)
Alert: Below reorder level (500)
Auto PO: 21 boxes recommended
      │
      ▼
┌───────────────────────────────────────────┐
│ PurchaseRequest: PR-002                   │
│  - Needed: 50 pieces                      │
│  - Order: 3 boxes (72 pieces)             │
│  - Cost: ₱900                             │
└───────────────────────────────────────────┘
```

---

**These visual diagrams illustrate the complete unit measure conversion system.**
**Refer to QUICK_START_GUIDE.md for implementation code examples.**
