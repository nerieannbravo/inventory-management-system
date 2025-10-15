/**
 * EXAMPLE API ROUTE: Receive Stock from Supplier with Unit Conversion
 * 
 * This file demonstrates how to implement a stock receiving endpoint
 * that properly handles unit conversions from supplier units to canonical units.
 * 
 * Place this in: src/app/api/stock-receive/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../lib/prisma';
import { convertToCanonical, formatConversion } from '../lib/unitConversionUtils';

/**
 * POST /api/stock-receive
 * 
 * Receive stock from a supplier and update inventory with proper unit conversion
 * 
 * Request Body:
 * {
 *   "supplierItemId": number,
 *   "quantityInSupplierUnit": number,
 *   "deliveryReceiptId"?: string,
 *   "batchId"?: string,
 *   "defectiveQuantity"?: number,  // in supplier unit
 *   "missingQuantity"?: number,    // in supplier unit
 *   "remarks"?: string,
 *   "handledByEmpNumber": string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplierItemId,
      quantityInSupplierUnit,
      deliveryReceiptId,
      batchId,
      defectiveQuantity = 0,
      missingQuantity = 0,
      remarks,
      handledByEmpNumber,
    } = body;

    // Validation
    if (!supplierItemId || !quantityInSupplierUnit || !handledByEmpNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Fetch SupplierItem with conversion details
    // Using 'as any' to avoid Prisma type issues with snake_case fields
    const supplierItem = await (prisma as any).supplierItem.findUnique({
      where: { id: Number(supplierItemId) },
      include: {
        item: {
          include: {
            unitMeasure: true,
          },
        },
        supplierUnitMeasure: true,
        supplier: true,
      },
    });

    if (!supplierItem) {
      return NextResponse.json(
        { success: false, error: 'SupplierItem not found' },
        { status: 404 }
      );
    }

    // Step 2: Calculate usable quantity in supplier unit
    const usableQuantitySupplier = 
      quantityInSupplierUnit - defectiveQuantity - missingQuantity;

    if (usableQuantitySupplier < 0) {
      return NextResponse.json(
        { success: false, error: 'Defective + Missing quantity exceeds received quantity' },
        { status: 400 }
      );
    }

    // Step 3: Convert to canonical unit
    const conversionFactor = supplierItem.conversionFactor;
    const usableQuantityCanonical = convertToCanonical(
      usableQuantitySupplier,
      conversionFactor
    );

    // Step 4: Generate transaction ID
    const lastTransaction = await (prisma as any).stockTransaction.findFirst({
      orderBy: { transactionId: 'desc' },
      select: { transactionId: true },
    });

    let transactionId = 'STK-00001';
    if (lastTransaction?.transactionId) {
      const lastNumber = parseInt(lastTransaction.transactionId.split('-')[1]);
      const newNumber = lastNumber + 1;
      transactionId = `STK-${String(newNumber).padStart(5, '0')}`;
    }

    // Step 5: Update stock in a transaction
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // Update InventoryItem stock (in canonical unit)
      const updatedItem = await tx.inventoryItem.update({
        where: { item_id: supplierItem.item.item_id },
        data: {
          current_stock: {
            increment: usableQuantityCanonical,
          },
        },
      });

      // Create StockTransaction record (in canonical unit)
      const conversionInfo = formatConversion(
        usableQuantitySupplier,
        supplierItem.supplierUnitMeasure.abbreviation,
        usableQuantityCanonical,
        supplierItem.item.unitMeasure.abbreviation,
        conversionFactor
      );

      const stockTransaction = await tx.stockTransaction.create({
        data: {
          transactionId,
          itemId: supplierItem.itemId,
          transactionType: 'STOCK_IN',
          quantity: usableQuantityCanonical, // ALWAYS in canonical unit
          referenceType: deliveryReceiptId ? 'DeliveryReceipt' : 'Manual',
          referenceId: deliveryReceiptId || null,
          remarks: remarks || 
            `Received from ${supplierItem.supplier.supplierName}: ${conversionInfo}`,
          handledByEmpNumber,
          transactionDate: new Date(),
        },
      });

      // Update or create Batch if batchId provided
      let batch = null;
      if (batchId) {
        const existingBatch = await tx.batch.findUnique({
          where: { batch_id: batchId },
        });

        if (existingBatch) {
          // Update existing batch (in canonical unit)
          batch = await tx.batch.update({
            where: { batch_id: batchId },
            data: {
              usable_quantity: {
                increment: usableQuantityCanonical,
              },
              defective_quantity: {
                increment: convertToCanonical(defectiveQuantity, conversionFactor),
              },
              missing_quantity: {
                increment: convertToCanonical(missingQuantity, conversionFactor),
              },
            },
          });
        } else {
          // Create new batch (in canonical unit)
          batch = await tx.batch.create({
            data: {
              batch_id: batchId,
              itemId: supplierItem.itemId,
              usable_quantity: usableQuantityCanonical,
              defective_quantity: convertToCanonical(defectiveQuantity, conversionFactor),
              missing_quantity: convertToCanonical(missingQuantity, conversionFactor),
            },
          });
        }
      }

      return { updatedItem, stockTransaction, batch };
    });

    // Step 6: Return success response with conversion details
    return NextResponse.json({
      success: true,
      message: 'Stock received and updated successfully',
      data: {
        transactionId,
        itemId: supplierItem.item.item_id,
        itemName: supplierItem.item.item_name,
        supplierName: supplierItem.supplier.supplierName,
        conversion: {
          received: {
            quantity: quantityInSupplierUnit,
            unit: supplierItem.supplierUnitMeasure.abbreviation,
          },
          defective: {
            quantity: defectiveQuantity,
            unit: supplierItem.supplierUnitMeasure.abbreviation,
          },
          missing: {
            quantity: missingQuantity,
            unit: supplierItem.supplierUnitMeasure.abbreviation,
          },
          usable: {
            quantityInSupplierUnit: usableQuantitySupplier,
            quantityInCanonicalUnit: usableQuantityCanonical,
            supplierUnit: supplierItem.supplierUnitMeasure.abbreviation,
            canonicalUnit: supplierItem.item.unitMeasure.abbreviation,
            conversionFactor,
          },
        },
        newStock: result.updatedItem.current_stock,
        stockTransaction: {
          id: result.stockTransaction.transactionId,
          quantity: result.stockTransaction.quantity,
          unit: supplierItem.item.unitMeasure.abbreviation,
        },
      },
    });

  } catch (error: any) {
    console.error('Error receiving stock:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to receive stock', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Example Request:
 * 
 * POST /api/stock-receive
 * {
 *   "supplierItemId": 1,
 *   "quantityInSupplierUnit": 10,
 *   "defectiveQuantity": 1,
 *   "missingQuantity": 0,
 *   "deliveryReceiptId": "DR-001",
 *   "batchId": "BAT-001",
 *   "handledByEmpNumber": "EMP-001",
 *   "remarks": "Delivery from Supplier A"
 * }
 * 
 * Example Response (Success):
 * {
 *   "success": true,
 *   "message": "Stock received and updated successfully",
 *   "data": {
 *     "transactionId": "STK-00123",
 *     "itemId": "ITM-001",
 *     "itemName": "Bottled Water",
 *     "supplierName": "ABC Supplies",
 *     "conversion": {
 *       "received": { "quantity": 10, "unit": "boxes" },
 *       "defective": { "quantity": 1, "unit": "boxes" },
 *       "missing": { "quantity": 0, "unit": "boxes" },
 *       "usable": {
 *         "quantityInSupplierUnit": 9,
 *         "quantityInCanonicalUnit": 216,
 *         "supplierUnit": "boxes",
 *         "canonicalUnit": "pieces",
 *         "conversionFactor": 24
 *       }
 *     },
 *     "newStock": 716,
 *     "stockTransaction": {
 *       "id": "STK-00123",
 *       "quantity": 216,
 *       "unit": "pieces"
 *     }
 *   }
 * }
 */

/**
 * ============================================================================
 * INTEGRATION NOTES
 * ============================================================================
 * 
 * 1. Frontend Integration:
 *    - Display supplier unit in the form
 *    - Show real-time conversion as user types
 *    - Example: "10 boxes = 240 pieces"
 * 
 * 2. Error Handling:
 *    - Validate conversion factor > 0
 *    - Check for sufficient permissions
 *    - Handle negative stock scenarios
 * 
 * 3. Audit Trail:
 *    - StockTransaction.remarks includes full conversion details
 *    - Original supplier quantities preserved in remarks
 *    - Can reconstruct history even if supplier units change
 * 
 * 4. Performance:
 *    - Use database transaction for atomicity
 *    - All updates happen in single transaction
 *    - Rollback on any error
 * 
 * 5. Testing:
 *    - Test with conversionFactor = 1 (same unit)
 *    - Test with fractional conversionFactor (e.g., gallons to liters)
 *    - Test with large conversionFactor (e.g., reams to sheets)
 *    - Test defective/missing quantity edge cases
 */
