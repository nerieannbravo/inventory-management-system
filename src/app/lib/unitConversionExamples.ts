/**
 * ============================================================================
 * UNIT CONVERSION EXAMPLES FOR INVENTORY MANAGEMENT
 * ============================================================================
 * 
 * This file provides practical examples of how to handle unit conversions
 * between SupplierItem units and InventoryItem canonical units.
 * 
 * Schema Overview:
 * ----------------
 * 
 * InventoryItem:
 *   - unitMeasureId: Int (canonical unit for stock tracking)
 *   - currentStock: Int (always in canonical unit)
 * 
 * SupplierItem:
 *   - supplierUnitMeasureId: Int (supplier's unit)
 *   - conversionFactor: Float (multiplier from supplier unit to canonical)
 *   - unitPrice: Float (price per supplier unit)
 * 
 * Conversion Rule:
 * ----------------
 * canonicalQuantity = supplierQuantity × conversionFactor
 * 
 * Example Scenarios:
 * ----------------
 * 
 * 1. Bottled Water:
 *    - InventoryItem canonical unit: pieces (pc)
 *    - Supplier A supplies in boxes: 1 box = 24 pc (conversionFactor = 24)
 *    - Supplier B supplies in pieces: 1 pc = 1 pc (conversionFactor = 1)
 *    - Receiving 5 boxes from A → 5 × 24 = 120 pc added to currentStock
 * 
 * 2. Engine Oil:
 *    - InventoryItem canonical unit: liters (L)
 *    - Supplier A supplies in gallons: 1 gal = 3.78541 L (conversionFactor = 3.78541)
 *    - Supplier B supplies in liters: 1 L = 1 L (conversionFactor = 1)
 *    - Receiving 10 gallons from A → 10 × 3.78541 = 37.85 L added to currentStock
 * 
 * 3. Paper (A4):
 *    - InventoryItem canonical unit: sheets
 *    - Supplier A supplies in reams: 1 ream = 500 sheets (conversionFactor = 500)
 *    - Supplier B supplies in boxes: 1 box = 2500 sheets (conversionFactor = 2500)
 *    - Receiving 3 reams from A → 3 × 500 = 1500 sheets added to currentStock
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// EXAMPLE 1: RECEIVE STOCK FROM SUPPLIER WITH CONVERSION
// ============================================================================

/**
 * Example: Receive 5 boxes of bottled water from Supplier A
 * - SupplierItem has: conversionFactor = 24 (1 box = 24 pieces)
 * - We receive 5 boxes
 * - Add 5 × 24 = 120 pieces to InventoryItem.currentStock
 */
export async function example1_receiveStock() {
  const supplierItemId = 1; // SupplierItem record ID
  const quantityInSupplierUnit = 5; // 5 boxes
  const handledByEmpNumber = 'EMP-001';

  // Step 1: Fetch SupplierItem with conversion details
  const supplierItem = await prisma.supplierItem.findUnique({
    where: { id: supplierItemId },
    include: {
      item: {
        include: {
          unitMeasure: true, // Canonical unit (pieces)
        },
      },
      supplierUnitMeasure: true, // Supplier unit (boxes)
    },
  });

  if (!supplierItem) {
    throw new Error('SupplierItem not found');
  }

  // Step 2: Convert supplier quantity to canonical unit
  const quantityInCanonicalUnit = Math.round(
    quantityInSupplierUnit * supplierItem.conversionFactor
  );
  // 5 boxes × 24 = 120 pieces

  console.log(
    `Receiving ${quantityInSupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation} ` +
    `= ${quantityInCanonicalUnit} ${supplierItem.item.unitMeasure.abbreviation}`
  );

  // Step 3: Update InventoryItem stock in canonical unit
  const result = await prisma.$transaction(async (tx) => {
    // Update currentStock by adding canonical quantity
    const updatedItem = await tx.inventoryItem.update({
      where: { itemId: supplierItem.item.itemId },
      data: {
        currentStock: {
          increment: quantityInCanonicalUnit, // Add 120 pieces
        },
      },
    });

    // Create StockTransaction record (always in canonical unit)
    const transactionId = `STK-${Date.now()}`; // Use proper ID generator in production
    const stockTransaction = await tx.stockTransaction.create({
      data: {
        transactionId,
        itemId: supplierItem.itemId,
        transactionType: 'STOCK_IN',
        quantity: quantityInCanonicalUnit, // 120 pieces (canonical unit)
        referenceType: 'DeliveryReceipt',
        remarks: 
          `Received ${quantityInSupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation} ` +
          `(${quantityInCanonicalUnit} ${supplierItem.item.unitMeasure.abbreviation})`,
        handledByEmpNumber,
      },
    });

    return { updatedItem, stockTransaction };
  });

  console.log('Stock updated successfully:', result);
  return result;
}

// ============================================================================
// EXAMPLE 2: PROCESS DELIVERY RECEIPT WITH MULTIPLE ITEMS
// ============================================================================

/**
 * Example: Process a delivery receipt with multiple items
 * - Item 1: 10 boxes (conversionFactor = 24)
 * - Item 2: 5 reams of paper (conversionFactor = 500)
 * - Item 3: 2 gallons of oil (conversionFactor = 3.78541)
 */
export async function example2_processDeliveryReceipt() {
  const deliveryReceiptId = 'DR-001';
  const handledByEmpNumber = 'EMP-001';

  const receivedItems = [
    { supplierItemId: 1, receivedQuantity: 10, defectiveQuantity: 1 }, // 9 usable boxes
    { supplierItemId: 2, receivedQuantity: 5, defectiveQuantity: 0 }, // 5 reams
    { supplierItemId: 3, receivedQuantity: 2, defectiveQuantity: 0 }, // 2 gallons
  ];

  const results = await prisma.$transaction(async (tx) => {
    const processedItems = [];

    for (const item of receivedItems) {
      // Fetch SupplierItem
      const supplierItem = await tx.supplierItem.findUnique({
        where: { id: item.supplierItemId },
        include: {
          item: { include: { unitMeasure: true } },
          supplierUnitMeasure: true,
        },
      });

      if (!supplierItem) continue;

      // Calculate usable quantity in supplier unit
      const usableQuantityInSupplierUnit = 
        item.receivedQuantity - item.defectiveQuantity;

      // Convert to canonical unit
      const quantityInCanonicalUnit = Math.round(
        usableQuantityInSupplierUnit * supplierItem.conversionFactor
      );

      // Update InventoryItem
      await tx.inventoryItem.update({
        where: { itemId: supplierItem.item.itemId },
        data: {
          currentStock: { increment: quantityInCanonicalUnit },
        },
      });

      // Create StockTransaction
      const transactionId = `STK-${Date.now()}-${item.supplierItemId}`;
      await tx.stockTransaction.create({
        data: {
          transactionId,
          itemId: supplierItem.itemId,
          transactionType: 'STOCK_IN',
          quantity: quantityInCanonicalUnit,
          referenceType: 'DeliveryReceipt',
          referenceId: deliveryReceiptId,
          remarks: `DR ${deliveryReceiptId}: ${usableQuantityInSupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation}`,
          handledByEmpNumber,
        },
      });

      processedItems.push({
        itemName: supplierItem.item.itemName,
        supplierQuantity: usableQuantityInSupplierUnit,
        supplierUnit: supplierItem.supplierUnitMeasure.abbreviation,
        canonicalQuantity: quantityInCanonicalUnit,
        canonicalUnit: supplierItem.item.unitMeasure.abbreviation,
      });
    }

    return processedItems;
  });

  console.log('Delivery receipt processed:', results);
  return results;
}

// ============================================================================
// EXAMPLE 3: CREATE PURCHASE REQUEST WITH SUPPLIER UNIT
// ============================================================================

/**
 * Example: Create a purchase request for items below reorder level
 * - Calculate needed quantity in canonical unit
 * - Convert to supplier unit for ordering
 * - Calculate estimated cost
 */
export async function example3_createPurchaseRequest() {
  const itemId = 1; // InventoryItem ID
  const preferredSupplierId = 1;

  // Step 1: Check if reorder is needed
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: {
      unitMeasure: true,
      supplierItems: {
        where: {
          supplierId: preferredSupplierId,
        },
        include: {
          supplier: true,
          supplierUnitMeasure: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  const neededQuantityCanonical = item.reorderLevel - item.currentStock;

  if (neededQuantityCanonical <= 0) {
    console.log('No reorder needed');
    return null;
  }

  const supplierItem = item.supplierItems[0];
  if (!supplierItem) {
    throw new Error('No supplier found for this item');
  }

  // Step 2: Convert needed quantity to supplier unit
  const neededQuantitySupplierUnit = Math.ceil(
    neededQuantityCanonical / supplierItem.conversionFactor
  );

  // Step 3: Calculate estimated cost
  const estimatedCost = neededQuantitySupplierUnit * supplierItem.unitPrice;

  console.log('Purchase Request Calculation:');
  console.log(`- Item: ${item.itemName}`);
  console.log(`- Current Stock: ${item.currentStock} ${item.unitMeasure.abbreviation}`);
  console.log(`- Reorder Level: ${item.reorderLevel} ${item.unitMeasure.abbreviation}`);
  console.log(`- Needed (canonical): ${neededQuantityCanonical} ${item.unitMeasure.abbreviation}`);
  console.log(`- Order from ${supplierItem.supplier.supplierName}:`);
  console.log(`  → Quantity: ${neededQuantitySupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation}`);
  console.log(`  → Unit Price: ₱${supplierItem.unitPrice} per ${supplierItem.supplierUnitMeasure.abbreviation}`);
  console.log(`  → Estimated Total: ₱${estimatedCost}`);

  // Step 4: Create Purchase Request (simplified)
  // In production, this would include proper ID generation, validation, etc.
  
  return {
    itemId: item.id,
    itemName: item.itemName,
    neededQuantityCanonical,
    canonicalUnit: item.unitMeasure.abbreviation,
    supplierInfo: {
      supplierId: supplierItem.supplierId,
      supplierName: supplierItem.supplier.supplierName,
      orderQuantity: neededQuantitySupplierUnit,
      orderUnit: supplierItem.supplierUnitMeasure.abbreviation,
      unitPrice: supplierItem.unitPrice,
      estimatedTotal: estimatedCost,
      conversionFactor: supplierItem.conversionFactor,
    },
  };
}

// ============================================================================
// EXAMPLE 4: STOCK ADJUSTMENT WITH CONVERSION
// ============================================================================

/**
 * Example: Adjust stock after physical count
 * - Physical count shows discrepancy in supplier units
 * - Convert to canonical unit for adjustment
 */
export async function example4_stockAdjustment() {
  const supplierItemId = 1;
  const physicalCountInSupplierUnit = 15; // Found 15 boxes during count
  const handledByEmpNumber = 'EMP-001';

  // Step 1: Get current stock and conversion details
  const supplierItem = await prisma.supplierItem.findUnique({
    where: { id: supplierItemId },
    include: {
      item: {
        include: { unitMeasure: true },
      },
      supplierUnitMeasure: true,
    },
  });

  if (!supplierItem) {
    throw new Error('SupplierItem not found');
  }

  // Step 2: Convert physical count to canonical unit
  const physicalCountCanonical = Math.round(
    physicalCountInSupplierUnit * supplierItem.conversionFactor
  );

  const currentStock = supplierItem.item.currentStock;
  const adjustmentCanonical = physicalCountCanonical - currentStock;

  console.log('Stock Adjustment:');
  console.log(`- Current Stock (system): ${currentStock} ${supplierItem.item.unitMeasure.abbreviation}`);
  console.log(`- Physical Count: ${physicalCountInSupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation}`);
  console.log(`- Physical Count (canonical): ${physicalCountCanonical} ${supplierItem.item.unitMeasure.abbreviation}`);
  console.log(`- Adjustment: ${adjustmentCanonical} ${supplierItem.item.unitMeasure.abbreviation}`);

  // Step 3: Apply adjustment
  const result = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.inventoryItem.update({
      where: { itemId: supplierItem.item.itemId },
      data: {
        currentStock: physicalCountCanonical, // Set to physical count
      },
    });

    const transactionId = `STK-ADJ-${Date.now()}`;
    const stockTransaction = await tx.stockTransaction.create({
      data: {
        transactionId,
        itemId: supplierItem.itemId,
        transactionType: 'ADJUSTMENT',
        quantity: Math.abs(adjustmentCanonical), // Always in canonical unit
        referenceType: 'PhysicalCount',
        remarks: 
          `Physical count: ${physicalCountInSupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation} ` +
          `(${physicalCountCanonical} ${supplierItem.item.unitMeasure.abbreviation}). ` +
          `Adjustment: ${adjustmentCanonical >= 0 ? '+' : ''}${adjustmentCanonical}`,
        handledByEmpNumber,
      },
    });

    return { updatedItem, stockTransaction };
  });

  console.log('Adjustment applied:', result);
  return result;
}

// ============================================================================
// EXAMPLE 5: CREATE OR UPDATE SUPPLIER ITEM
// ============================================================================

/**
 * Example: Add a new supplier for an existing item with different unit
 * - Item canonical unit: pieces
 * - New supplier supplies in boxes (1 box = 24 pieces)
 */
export async function example5_addSupplierItem() {
  const supplierId = 2;
  const itemId = 1;
  const supplierUnitMeasureId = 5; // Assuming ID 5 is "box"
  const conversionFactor = 24; // 1 box = 24 pieces
  const unitPrice = 300; // ₱300 per box

  // Create SupplierItem
  const supplierItem = await prisma.supplierItem.create({
    data: {
      supplierId,
      itemId,
      supplierUnitMeasureId,
      conversionFactor,
      unitPrice,
      averageDeliveryTime: '3-5 days',
      notes: 'Reliable supplier, good quality',
      isPreferred: false,
    },
  });

  console.log('New SupplierItem created:');
  console.log(`- Supplier ID: ${supplierId}`);
  console.log(`- Item ID: ${itemId}`);
  console.log(`- Supplier Unit: ID ${supplierUnitMeasureId}`);
  console.log(`- Conversion: 1 unit = ${conversionFactor} canonical units`);
  console.log(`- Price: ₱${unitPrice} per supplier unit`);

  return supplierItem;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert quantity from supplier unit to canonical unit
 */
export function convertToCanonical(
  quantityInSupplierUnit: number,
  conversionFactor: number
): number {
  return Math.round(quantityInSupplierUnit * conversionFactor);
}

/**
 * Convert quantity from canonical unit to supplier unit
 */
export function convertToSupplier(
  quantityInCanonicalUnit: number,
  conversionFactor: number
): number {
  return Math.round((quantityInCanonicalUnit / conversionFactor) * 100) / 100;
}

/**
 * Calculate total cost
 */
export function calculateCost(
  quantityInSupplierUnit: number,
  unitPriceInSupplierUnit: number
): number {
  return Math.round(quantityInSupplierUnit * unitPriceInSupplierUnit * 100) / 100;
}

// ============================================================================
// IMPORTANT REMINDERS
// ============================================================================

/*
 * 1. ALWAYS store quantities in canonical units in:
 *    - InventoryItem.currentStock
 *    - Batch.usableQuantity, defectiveQuantity, missingQuantity
 *    - StockTransaction.quantity
 * 
 * 2. ALWAYS convert from supplier unit to canonical unit when receiving stock
 * 
 * 3. conversionFactor should be IMMUTABLE after stock transactions to prevent
 *    historical data inconsistencies
 * 
 * 4. When creating PurchaseRequest or PurchaseOrder:
 *    - Calculate needed quantity in canonical unit first
 *    - Convert to supplier unit for ordering
 *    - Store estimated cost based on supplier unit pricing
 * 
 * 5. Multiple suppliers can supply the same InventoryItem with different units
 * 
 * 6. InventoryItem.itemName should NOT include the unit
 *    - Correct: "Bottled Water"
 *    - Wrong: "Bottled Water (box)"
 * 
 * 7. Unit display in UI:
 *    - Show canonical unit for stock levels
 *    - Show supplier unit in purchase documents
 *    - Show conversion clearly: "5 boxes (120 pieces)"
 */
