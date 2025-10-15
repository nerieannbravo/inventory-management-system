import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';
import { calculateAndUpdateStatus } from "../../lib/itemStatus";

/* eslint-disable @typescript-eslint/no-explicit-any */

// FTMS item-level PATCH function
async function patchFtmsProcessedItems(stockItems: any[], results: Array<{ success: boolean }>) {
  const FTMS_ITEMS_URL = process.env.FTMS_ITEMS_URL;
  if (!FTMS_ITEMS_URL) {
    console.warn('FTMS_ITEMS_URL is not configured; skipping FTMS PATCH');
    return;
  }

  const hasPairs = (it: any) => typeof it?.receipt_id === 'string' && typeof it?.item_id === 'string';
  const hasTxnPair = (it: any) => typeof it?.transaction_id === 'string' && typeof it?.item_id === 'string';

  // Primary approach: use receipt_id + item_id pairs
  const processedItems = stockItems.flatMap((item, idx) =>
    results[idx]?.success && hasPairs(item) ? [{ receipt_id: item.receipt_id, item_id: item.item_id }] : [],
  );

  if (processedItems.length > 0) {
    try {
      await fetch(FTMS_ITEMS_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: processedItems }),
      });
      console.log(`✅ Successfully PATCH ${processedItems.length} item-level pairs to FTMS`);
      return;
    } catch (error) {
      console.error('Failed to PATCH item-level pairs to FTMS:', error);
      throw error;
    }
  }

  // Fallback when receipt_id is not available externally
  const processedTxnPairs = stockItems.flatMap((item, idx) =>
    results[idx]?.success && hasTxnPair(item)
      ? [{ transaction_id: item.transaction_id as string, item_id: item.item_id as string }]
      : [],
  );

  if (processedTxnPairs.length > 0) {
    try {
      await fetch(FTMS_ITEMS_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_items: processedTxnPairs }),
      });
      console.log(`✅ Successfully PATCH ${processedTxnPairs.length} transaction item pairs to FTMS (fallback)`);
      return;
    } catch (error) {
      console.error('Failed to PATCH transaction item pairs to FTMS:', error);
      throw error;
    }
  }

  console.info('No eligible FTMS items to PATCH');
}

export async function GET() {
  try {
    // Get current date at midnight for expiration check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch all items from the inventory that aren't deleted
    const items = await prisma.inventoryItem.findMany({
      where: {
        isDeleted: false
      },
      select: {
        itemId: true,
        itemName: true,
        unitMeasureId: true,
        unitMeasure: {
          select: {
            id: true,
            unitId: true,
            unitName: true,
            abbreviation: true,
          },
        },
        status: true,
        currentStock: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            categoryId: true,
            categoryName: true,
          },
        },
        reorderLevel: true,
        createdAt: true,
        updatedAt: true,
        batches: {
          where: {
            isDeleted: false
          },
          select: {
            batchId: true,
            usableQuantity: true,
            defectiveQuantity: true,
            missingQuantity: true,
            expirationDate: true,
            createdAt: true,
          }
        }
      },
    });

    // Process each item to calculate current_stock and status
    const processedItems = await Promise.all(items.map(async (item) => {
      const { batches, ...itemData } = item;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate current stock: use DB value for ITEM-00001, else sum usable quantities
      let current_stock: number;
      if (item.category && item.category.categoryId === 'CAT-00002') {
        current_stock = item.currentStock;
      } else {
        current_stock = batches.reduce((sum, batch) => sum + batch.usableQuantity, 0);
      }

      const hasExpiredBatch = batches.some(batch => {
        if (!batch.expirationDate) return false;
        const expirationDate = new Date(batch.expirationDate as Date);
        expirationDate.setHours(0, 0, 0, 0);
        return expirationDate <= today;
      });

  let status: 'EXPIRED' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'AVAILABLE' | 'UNDER_MAINTENANCE' | 'IN_USE' | string;
      if (hasExpiredBatch) {
        status = 'EXPIRED';
      } else if (item.category.categoryName === "Consumable" && current_stock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (item.category.categoryName === "Consumable" && current_stock <= item.reorderLevel) {
        status = 'LOW_STOCK';
      } else if (["Machine", "Tool", "Equipment"].includes(item.category.categoryName) && current_stock === 0) {
        status = 'IN_USE';
      } else {
        status = item.status as typeof status;
      }

  await prisma.inventoryItem.update({ where: { itemId: item.itemId }, data: { status: status as any } });

      return {
        ...itemData,
        current_stock,
        status,
        batches
      };
    }));

    // Count all buses using item_id 'ITEM-00001' (resolve numeric FK)
    const specialItem = await prisma.inventoryItem.findFirst({ where: { itemId: 'ITEM-00001' } });
    const busCount = specialItem ? await prisma.bus.count({ where: { itemId: specialItem.id } }) : 0;

    // Update current_stock in inventoryItem (by external itemId)
    if (specialItem) {
      await prisma.inventoryItem.update({ where: { itemId: 'ITEM-00001' }, data: { currentStock: busCount } });
    }

    // Also return all batches separately if needed
    const batches = await prisma.batch.findMany({
      where: { isDeleted: false },
      select: {
        batchId: true,
        usableQuantity: true,
        defectiveQuantity: true,
        missingQuantity: true,
        expirationDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      items: processedItems, 
      batches 
    });
  } catch (error: any) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { stockItems } = await request.json();
    console.log(`🔄 Starting to process ${stockItems.length} items`);

    // Process each stock item sequentially with detailed logging
    const results: any[] = [];
    
    for (let i = 0; i < stockItems.length; i++) {
      const item = stockItems[i];
      console.log(`📦 Processing item ${i + 1}/${stockItems.length}: ${item.itemName}`);
      
      try {
        // Check if the inventory item already exists
        console.log(`🔍 Checking if item exists: ${item.itemName}`);
        const existingItem = await prisma.inventoryItem.findFirst({
          where: { itemName: item.itemName, isDeleted: false },
        });

        // Convert status string to enum value
        const statusMap: Record<string, any> = {
          'available': 'AVAILABLE',
          'out-of-stock': 'OUT_OF_STOCK',
          'low-stock': 'LOW_STOCK',
          'maintenance': 'UNDER_MAINTENANCE'
        };
        const inventoryStatus = statusMap[item.status] || 'AVAILABLE';

        // Generate new batch ID
        console.log(`🆔 Generating batch ID for item ${i + 1}`);
        const batch_id = await generateId('batch', 'BAT');
        console.log(`✅ Generated batch ID: ${batch_id}`);
      
        if (existingItem) {
          console.log(`🔄 Updating existing item: ${existingItem.itemId}`);
          // Update existing inventory item
          // Use the numeric DB id for batch relation
          const numericItemId = existingItem.id;
          const updatedItem = await prisma.inventoryItem.update({
            where: { itemId: existingItem.itemId },
            data: {
              currentStock: item.current_stock ?? item.currentStock ?? 0,
              reorderLevel: item.reorder ?? item.reorderLevel ?? 0,
              status: inventoryStatus as any,
              batches: {
                create: {
                  batchId: batch_id,
                  usableQuantity: item.usable ?? 0,
                  defectiveQuantity: item.defective ?? 0,
                  missingQuantity: item.missing ?? 0,
                  expirationDate: item.expiration ? new Date(item.expiration) : null,
                },
              },
            },
          });
          console.log(`✅ Successfully updated item ${i + 1}`);
          results.push({ success: true, action: 'updated', item: updatedItem });
          await calculateAndUpdateStatus(existingItem.itemId);
        } else {
          console.log(`🆔 Generating item ID for new item ${i + 1}`);
          const itemId = await generateId('inventoryItem', 'ITEM');
          console.log(`✅ Generated item ID: ${itemId}`);
          
          // Get category information
          console.log(`🏷️ Finding category for: ${item.category}`);
          const category = await prisma.category.findFirst({
            where: { categoryName: item.category === 'Consumable' ? 'Consumable' : item.category },
          });
          if (!category) {
            throw new Error(`Category not found for ${item.category}`);
          }
          console.log(`✅ Found category: ${category.categoryId}`);

          // Get unit measure information
          console.log(`📏 Finding unit measure for: ${item.unit || item.unitMeasure}`);
          const unitMeasure = await prisma.unitMeasure.findFirst({
            where: { 
              OR: [
                { abbreviation: { equals: item.unit || item.unitMeasure, mode: 'insensitive' } },
                { unitName: { equals: item.unit || item.unitMeasure, mode: 'insensitive' } }
              ],
              isDeleted: false
            }
          });
          
          if (!unitMeasure) {
            // Default to pieces if unit measure not found
            console.warn(`⚠️ Unit measure not found for: ${item.unit || item.unitMeasure}, defaulting to pieces`);
            const defaultUnit = await prisma.unitMeasure.findFirst({
              where: { abbreviation: 'pcs' }
            });
            if (!defaultUnit) {
              throw new Error('Default unit measure (pieces) not found in database');
            }
            console.log(`✅ Using default unit: ${defaultUnit.unitName}`);
            item.unitMeasureId = defaultUnit.id;
          } else {
            console.log(`✅ Found unit measure: ${unitMeasure.unitName}`);
            item.unitMeasureId = unitMeasure.id;
          }

          // Create new inventory item
          console.log(`➕ Creating new inventory item ${i + 1}`);
          const newItem = await prisma.inventoryItem.create({
            data: {
              itemId,
              categoryId: category.id,
              itemName: item.itemName,
              unitMeasureId: item.unitMeasureId,
              reorderLevel: item.reorder ?? 0,
              status: inventoryStatus as any,
              batches: {
                create: {
                  batchId: batch_id,
                  usableQuantity: item.usable ?? 0,
                  defectiveQuantity: item.defective ?? 0,
                  missingQuantity: item.missing ?? 0,
                  expirationDate: item.expiration ? new Date(item.expiration) : null,
                },
              },
            },
          });
          await calculateAndUpdateStatus(itemId);
          console.log(`✅ Successfully created item ${i + 1}: ${newItem.itemId}`);
          results.push({ success: true, action: 'created', item: newItem });
        }
        
      } catch (itemError: any) {
        console.error(`❌ Error processing item ${i + 1} (${item.name}):`, itemError.message);
        console.error('Full error:', itemError);
        results.push({ 
          success: false, 
          action: 'failed', 
          item: item.name, 
          error: itemError.message 
        });
        
        // Don't break the loop, continue with next item
      }
    }

    console.log(`🏁 Finished processing. Results:`, results.map(r => r.action));

    // Use the new FTMS item-level PATCH approach
    try {
      await patchFtmsProcessedItems(stockItems, results);
    } catch (patchError) {
      console.error('FTMS PATCH operation failed:', patchError);
      // Don't fail the entire operation if FTMS PATCH fails
    }

    return NextResponse.json({ success: true, results });
    
  } catch (error: any) {
    console.error('❌ Fatal error processing stock items:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { itemId, reorderLevel, status, categoryId, unitMeasureId } = await request.json();

    if (!itemId || itemId === "undefined") {
      return NextResponse.json({ success: false, error: "Missing or invalid itemId" }, { status: 400 });
    }

    const updated = await prisma.inventoryItem.update({
      where: { itemId: String(itemId) },
      data: {
        reorderLevel: reorderLevel,
        status: status as any,
        categoryId: categoryId,
        ...(unitMeasureId && { unitMeasureId: unitMeasureId }),
      },
    });

    await calculateAndUpdateStatus(itemId);

    return NextResponse.json({ 
      success: true, 
      item: updated,
      message: 'Item updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (req.method === 'PATCH') {
    try {
      const { itemId } = await req.json();

      // Soft-delete the inventory item
      await prisma.inventoryItem.update({
        where: { itemId: String(itemId) },
        data: { isDeleted: true },
      });

      // Soft-delete all batches for this item (resolve numeric FK)
      const targetItem = await prisma.inventoryItem.findFirst({ where: { itemId } });
      if (targetItem) {
        await prisma.batch.updateMany({
          where: { itemId: targetItem.id },
          data: { isDeleted: true },
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
  }
}