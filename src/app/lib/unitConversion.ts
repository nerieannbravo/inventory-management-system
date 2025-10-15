/**
 * ============================================================================
 * UNIT CONVERSION UTILITIES FOR INVENTORY MANAGEMENT
 * ============================================================================
 * 
 * This module provides utilities for handling unit conversions between
 * SupplierItem units and InventoryItem canonical units.
 * 
 * Key Concepts:
 * - InventoryItem stores stock in its canonical unit (unitMeasureId)
 * - SupplierItem may supply items in different units (supplierUnitMeasureId)
 * - conversionFactor is the multiplier from supplier unit to canonical unit
 * 
 * Example:
 * - InventoryItem: "Bottled Water" in pieces (canonical unit)
 * - SupplierA: Supplies in boxes, 1 box = 24 pieces (conversionFactor = 24)
 * - SupplierB: Supplies in pieces, 1 piece = 1 piece (conversionFactor = 1)
 * 
 * When receiving 5 boxes from SupplierA:
 * - Received quantity in supplier unit: 5 boxes
 * - Convert to canonical: 5 × 24 = 120 pieces
 * - Add 120 pieces to InventoryItem.currentStock
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SupplierItemWithUnits {
  id: number;
  supplierId: number;
  itemId: number;
  supplierUnitMeasureId: number;
  conversionFactor: number;
  unitPrice: number;
  item: {
    id: number;
    itemId: string;
    itemName: string;
    unitMeasureId: number;
    currentStock: number;
    unitMeasure: {
      id: number;
      unitName: string;
      abbreviation: string;
    };
  };
  supplierUnitMeasure: {
    id: number;
    unitName: string;
    abbreviation: string;
  };
}

export interface StockReceivalInput {
  supplierItemId: number;
  quantityInSupplierUnit: number;
  batchId?: string;
  deliveryReceiptId?: number;
  remarks?: string;
  handledByEmpNumber: string;
}

export interface ConversionResult {
  quantityInSupplierUnit: number;
  quantityInCanonicalUnit: number;
  supplierUnit: string;
  canonicalUnit: string;
  conversionFactor: number;
}

// ============================================================================
// CORE CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert quantity from supplier unit to canonical unit
 * 
 * @param quantityInSupplierUnit - Quantity in supplier's unit
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @returns Quantity in canonical unit (rounded to nearest integer)
 */
export function convertToCanonicalUnit(
  quantityInSupplierUnit: number,
  conversionFactor: number
): number {
  return Math.round(quantityInSupplierUnit * conversionFactor);
}

/**
 * Convert quantity from canonical unit to supplier unit
 * 
 * @param quantityInCanonicalUnit - Quantity in canonical unit
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @returns Quantity in supplier unit (rounded to 2 decimal places)
 */
export function convertToSupplierUnit(
  quantityInCanonicalUnit: number,
  conversionFactor: number
): number {
  return Math.round((quantityInCanonicalUnit / conversionFactor) * 100) / 100;
}

/**
 * Get detailed conversion information for a SupplierItem
 * 
 * @param supplierItemId - ID of the SupplierItem
 * @returns Conversion details including units and factor
 */
export async function getConversionDetails(
  supplierItemId: number
): Promise<SupplierItemWithUnits | null> {
  return await prisma.supplierItem.findUnique({
    where: { id: supplierItemId },
    include: {
      item: {
        include: {
          unitMeasure: true,
        },
      },
      supplierUnitMeasure: true,
    },
  });
}

// ============================================================================
// STOCK RECEIVAL WITH CONVERSION
// ============================================================================

/**
 * Receive stock from a supplier and update InventoryItem with proper unit conversion
 * 
 * This function:
 * 1. Fetches SupplierItem to get conversion factor
 * 2. Converts received quantity from supplier unit to canonical unit
 * 3. Updates InventoryItem.currentStock in canonical unit
 * 4. Creates StockTransaction record in canonical unit
 * 5. Optionally updates or creates Batch in canonical unit
 * 
 * @param input - Stock receival input data
 * @returns Conversion result and transaction details
 */
export async function receiveStockFromSupplier(
  input: StockReceivalInput
): Promise<{
  success: boolean;
  conversion: ConversionResult;
  transaction: any;
  error?: string;
}> {
  try {
    // Step 1: Get SupplierItem with conversion details
    const supplierItem = await getConversionDetails(input.supplierItemId);

    if (!supplierItem) {
      return {
        success: false,
        conversion: {} as ConversionResult,
        transaction: null,
        error: 'SupplierItem not found',
      };
    }

    // Step 2: Calculate quantity in canonical unit
    const quantityInCanonicalUnit = convertToCanonicalUnit(
      input.quantityInSupplierUnit,
      supplierItem.conversionFactor
    );

    const conversion: ConversionResult = {
      quantityInSupplierUnit: input.quantityInSupplierUnit,
      quantityInCanonicalUnit,
      supplierUnit: supplierItem.supplierUnitMeasure.abbreviation,
      canonicalUnit: supplierItem.item.unitMeasure.abbreviation,
      conversionFactor: supplierItem.conversionFactor,
    };

    // Step 3: Execute transaction to update stock
    const result = await prisma.$transaction(async (tx) => {
      // Update InventoryItem stock in canonical unit
      const updatedItem = await tx.inventoryItem.update({
        where: { id: supplierItem.itemId },
        data: {
          currentStock: {
            increment: quantityInCanonicalUnit,
          },
        },
      });

      // Create StockTransaction in canonical unit
      const transactionId = await generateTransactionId(tx);
      const stockTransaction = await tx.stockTransaction.create({
        data: {
          transactionId,
          itemId: supplierItem.itemId,
          transactionType: 'STOCK_IN',
          quantity: quantityInCanonicalUnit, // Always in canonical unit
          referenceType: input.deliveryReceiptId ? 'DeliveryReceipt' : 'Manual',
          referenceId: input.deliveryReceiptId?.toString(),
          remarks: input.remarks || 
            `Received ${input.quantityInSupplierUnit} ${supplierItem.supplierUnitMeasure.abbreviation} ` +
            `(${quantityInCanonicalUnit} ${supplierItem.item.unitMeasure.abbreviation}) from supplier`,
          handledByEmpNumber: input.handledByEmpNumber,
          transactionDate: new Date(),
        },
      });

      // Optionally update Batch if provided
      if (input.batchId) {
        await tx.batch.update({
          where: { batchId: input.batchId },
          data: {
            usableQuantity: {
              increment: quantityInCanonicalUnit, // Always in canonical unit
            },
          },
        });
      }

      return { updatedItem, stockTransaction };
    });

    return {
      success: true,
      conversion,
      transaction: result.stockTransaction,
    };
  } catch (error: any) {
    console.error('Error receiving stock from supplier:', error);
    return {
      success: false,
      conversion: {} as ConversionResult,
      transaction: null,
      error: error.message,
    };
  }
}

// ============================================================================
// PURCHASE ORDER & DELIVERY RECEIPT HELPERS
// ============================================================================

/**
 * Calculate total cost considering supplier unit pricing
 * 
 * @param quantityInSupplierUnit - Quantity in supplier's unit
 * @param unitPriceInSupplierUnit - Price per supplier unit
 * @returns Total cost
 */
export function calculateTotalCost(
  quantityInSupplierUnit: number,
  unitPriceInSupplierUnit: number
): number {
  return Math.round(quantityInSupplierUnit * unitPriceInSupplierUnit * 100) / 100;
}

/**
 * Calculate expected stock quantity in canonical unit from purchase order
 * 
 * @param supplierItemId - ID of the SupplierItem
 * @param orderedQuantityInSupplierUnit - Ordered quantity in supplier unit
 * @returns Expected quantity in canonical unit
 */
export async function calculateExpectedStockFromOrder(
  supplierItemId: number,
  orderedQuantityInSupplierUnit: number
): Promise<number | null> {
  const supplierItem = await getConversionDetails(supplierItemId);
  
  if (!supplierItem) {
    return null;
  }

  return convertToCanonicalUnit(
    orderedQuantityInSupplierUnit,
    supplierItem.conversionFactor
  );
}

/**
 * Process delivery receipt with multiple items and conversion
 * 
 * @param deliveryReceiptId - ID of the delivery receipt
 * @param items - Array of received items with quantities in supplier units
 * @param handledByEmpNumber - Employee processing the receipt
 * @returns Processing results
 */
export async function processDeliveryReceipt(
  deliveryReceiptId: number,
  items: Array<{
    supplierItemId: number;
    receivedQuantity: number; // In supplier unit
    defectiveQuantity?: number; // In supplier unit
    missingQuantity?: number; // In supplier unit
  }>,
  handledByEmpNumber: string
): Promise<{
  success: boolean;
  results: Array<{
    supplierItemId: number;
    conversion: ConversionResult;
    stockUpdated: boolean;
  }>;
  error?: string;
}> {
  const results: Array<{
    supplierItemId: number;
    conversion: ConversionResult;
    stockUpdated: boolean;
  }> = [];

  try {
    for (const item of items) {
      const usableQuantity = 
        item.receivedQuantity - 
        (item.defectiveQuantity || 0) - 
        (item.missingQuantity || 0);

      if (usableQuantity > 0) {
        const receivalResult = await receiveStockFromSupplier({
          supplierItemId: item.supplierItemId,
          quantityInSupplierUnit: usableQuantity,
          deliveryReceiptId,
          handledByEmpNumber,
          remarks: `Delivery Receipt DR-${deliveryReceiptId}`,
        });

        results.push({
          supplierItemId: item.supplierItemId,
          conversion: receivalResult.conversion,
          stockUpdated: receivalResult.success,
        });
      }
    }

    return {
      success: true,
      results,
    };
  } catch (error: any) {
    console.error('Error processing delivery receipt:', error);
    return {
      success: false,
      results,
      error: error.message,
    };
  }
}

// ============================================================================
// PURCHASE REQUEST & REORDER HELPERS
// ============================================================================

/**
 * Calculate reorder quantity considering supplier unit and conversion
 * 
 * @param itemId - InventoryItem ID
 * @param preferredSupplierId - Preferred supplier ID (optional)
 * @returns Reorder suggestion with quantities in both units
 */
export async function calculateReorderQuantity(
  itemId: number,
  preferredSupplierId?: number
): Promise<{
  itemId: number;
  currentStock: number;
  reorderLevel: number;
  neededQuantityCanonical: number;
  canonicalUnit: string;
  supplierRecommendations: Array<{
    supplierId: number;
    supplierName: string;
    quantityInSupplierUnit: number;
    supplierUnit: string;
    estimatedCost: number;
    conversionFactor: number;
  }>;
} | null> {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: {
      unitMeasure: true,
      supplierItems: {
        include: {
          supplier: true,
          supplierUnitMeasure: true,
        },
        where: {
          supplier: { isDeleted: false, status: 'ACTIVE' },
        },
        orderBy: {
          isPreferred: 'desc',
        },
      },
    },
  });

  if (!item) {
    return null;
  }

  const neededQuantityCanonical = Math.max(
    item.reorderLevel - item.currentStock,
    0
  );

  if (neededQuantityCanonical === 0) {
    return null; // No reorder needed
  }

  const supplierRecommendations = item.supplierItems.map((si) => {
    const quantityInSupplierUnit = convertToSupplierUnit(
      neededQuantityCanonical,
      si.conversionFactor
    );

    return {
      supplierId: si.supplierId,
      supplierName: si.supplier.supplierName,
      quantityInSupplierUnit,
      supplierUnit: si.supplierUnitMeasure.abbreviation,
      estimatedCost: calculateTotalCost(quantityInSupplierUnit, si.unitPrice),
      conversionFactor: si.conversionFactor,
    };
  });

  return {
    itemId: item.id,
    currentStock: item.currentStock,
    reorderLevel: item.reorderLevel,
    neededQuantityCanonical,
    canonicalUnit: item.unitMeasure.abbreviation,
    supplierRecommendations,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique transaction ID
 */
async function generateTransactionId(tx: any): Promise<string> {
  const lastTransaction = await tx.stockTransaction.findFirst({
    orderBy: { transactionId: 'desc' },
    select: { transactionId: true },
  });

  if (!lastTransaction) {
    return 'STK-00001';
  }

  const lastNumber = parseInt(lastTransaction.transactionId.split('-')[1]);
  const newNumber = lastNumber + 1;
  return `STK-${String(newNumber).padStart(5, '0')}`;
}

/**
 * Validate conversion factor
 * Ensures conversion factor is positive and reasonable
 */
export function validateConversionFactor(factor: number): boolean {
  return factor > 0 && factor <= 1000000; // Reasonable upper limit
}

/**
 * Format conversion display string
 */
export function formatConversion(conversion: ConversionResult): string {
  return (
    `${conversion.quantityInSupplierUnit} ${conversion.supplierUnit} = ` +
    `${conversion.quantityInCanonicalUnit} ${conversion.canonicalUnit} ` +
    `(×${conversion.conversionFactor})`
  );
}
