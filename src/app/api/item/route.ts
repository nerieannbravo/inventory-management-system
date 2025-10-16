import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';
import { calculateAndUpdateStatus } from "../../lib/itemStatus";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
        description: true,
        unitMeasureId: true,
        unitMeasure: {
          select: {
            id: true,
            unitId: true,
            unitName: true,
            abbreviation: true,
          },
        },
        stockStatus: true,    // Stock-level status (AVAILABLE, LOW_STOCK, etc.)
        itemStatus: true,     // Item management status (ACTIVE, INACTIVE)
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
        },
        supplierItems: {
          where: {
            isDeleted: false
          } as any,
          select: {
            id: true,
            supplierId: true,
            supplier: {
              select: {
                supplierId: true,
                supplierName: true,
                status: true
              }
            },
            supplierUnitMeasureId: true,
            supplierUnitMeasure: {
              select: {
                id: true,
                abbreviation: true,
                unitName: true
              }
            },
            conversionFactor: true,
            unitPrice: true,
            averageDeliveryTime: true,
            isPreferred: true,
            notes: true
          }
        }
      },
    });

    // Process each item to calculate current_stock and status
    const processedItems = await Promise.all(items.map(async (item: any) => {
      const { batches, supplierItems, category, unitMeasure, ...itemData } = item;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate current stock: use DB value for ITEM-00001, else sum usable quantities
      let current_stock: number;
      if (category && category.categoryId === 'CAT-00002') {
        current_stock = item.currentStock;
      } else {
        current_stock = batches.reduce((sum: number, batch: any) => sum + batch.usableQuantity, 0);
      }

      const hasExpiredBatch = batches.some((batch: any) => {
        if (!batch.expirationDate) return false;
        const expirationDate = new Date(batch.expirationDate as Date);
        expirationDate.setHours(0, 0, 0, 0);
        return expirationDate <= today;
      });

      // Calculate stockStatus (auto-calculated based on stock levels)
      let stockStatus: 'EXPIRED' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'AVAILABLE' | 'UNDER_MAINTENANCE' | 'IN_USE' | string;
      if (hasExpiredBatch) {
        stockStatus = 'EXPIRED';
      } else if (category.categoryName === "Consumable" && current_stock === 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (category.categoryName === "Consumable" && current_stock <= item.reorderLevel) {
        stockStatus = 'LOW_STOCK';
      } else if (["Machine", "Tool", "Equipment"].includes(category.categoryName) && current_stock === 0) {
        stockStatus = 'IN_USE';
      } else {
        stockStatus = item.stockStatus || 'AVAILABLE';
      }

      // Update stockStatus in database
      await prisma.inventoryItem.update({ 
        where: { itemId: item.itemId }, 
        data: { stockStatus: stockStatus as any } 
      });

      return {
        ...itemData,
        category,
        unitMeasure,
        current_stock,
        stockStatus,     // For stock tracking
        status: item.itemStatus, // For item management (ACTIVE/INACTIVE)
        batches,
        supplierItems
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

        // Convert status string to enum value for stockStatus
        const stockStatusMap: Record<string, any> = {
          'available': 'AVAILABLE',
          'out-of-stock': 'OUT_OF_STOCK',
          'low-stock': 'LOW_STOCK',
          'maintenance': 'UNDER_MAINTENANCE'
        };
        const inventoryStockStatus = stockStatusMap[item.status] || 'AVAILABLE';
        
        // Item status is always ACTIVE for new items
        const itemStatus = 'ACTIVE';

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
              description: item.description || null,
              currentStock: item.current_stock ?? item.currentStock ?? 0,
              reorderLevel: item.reorder ?? item.reorderLevel ?? 0,
              stockStatus: inventoryStockStatus as any,
              itemStatus: itemStatus as any,
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
              description: item.description || null,
              unitMeasureId: item.unitMeasureId,
              reorderLevel: item.reorder ?? 0,
              stockStatus: inventoryStockStatus as any,
              itemStatus: itemStatus as any,
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

          // Create linked suppliers if provided
          if (item.linkedSuppliers && Array.isArray(item.linkedSuppliers) && item.linkedSuppliers.length > 0) {
            console.log(`🔗 Creating ${item.linkedSuppliers.length} linked suppliers for item ${i + 1}`);
            
            for (const linkedSupplier of item.linkedSuppliers) {
              try {
                // Find the supplier by name
                const supplier = await prisma.supplier.findFirst({
                  where: { 
                    supplierName: linkedSupplier.linkedSupplierName,
                    isDeleted: false
                  }
                });

                if (!supplier) {
                  console.warn(`⚠️ Supplier not found: ${linkedSupplier.linkedSupplierName}`);
                  continue;
                }

                // Create the supplier item linkage
                await prisma.supplierItem.create({
                  data: {
                    supplierId: supplier.id,
                    itemId: newItem.id,
                    categoryId: category.id,
                    supplierUnitMeasureId: linkedSupplier.supplierUnitMeasureId,
                    conversionFactor: linkedSupplier.conversionFactor || 1,
                    unitPrice: linkedSupplier.unitPrice || 0,
                    averageDeliveryTime: linkedSupplier.averageDeliveryTime || null,
                    notes: linkedSupplier.notes || null,
                    isPreferred: linkedSupplier.isPreferred || false,
                  } as any
                });

                console.log(`✅ Linked supplier ${supplier.supplierName} to item ${newItem.itemId}`);
              } catch (supplierError: any) {
                console.error(`❌ Error linking supplier:`, supplierError.message);
                // Continue with next supplier even if one fails
              }
            }
          }

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
    const { itemId, reorderLevel, itemStatus, categoryId, unitMeasureId, linkedSuppliers } = await request.json();

    if (!itemId || itemId === "undefined") {
      return NextResponse.json({ success: false, error: "Missing or invalid itemId" }, { status: 400 });
    }

    // Use transaction to update item and linked suppliers atomically
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // Update the main item
      const updated = await tx.inventoryItem.update({
        where: { itemId: String(itemId) },
        data: {
          reorderLevel: reorderLevel,
          itemStatus: itemStatus as any, // ACTIVE or INACTIVE
          categoryId: categoryId,
          ...(unitMeasureId && { unitMeasureId: unitMeasureId }),
        },
      });

      // Handle linked suppliers if provided
      if (linkedSuppliers && Array.isArray(linkedSuppliers)) {
        // Get the numeric item ID for FK operations
        const numericItemId = updated.id;

        // Get existing supplier items for this item
        const existingSupplierItems = await tx.supplierItem.findMany({
          where: { itemId: numericItemId, isDeleted: false }
        });

        // Create a set of incoming supplier item IDs
        const incomingSupplierItemIds = new Set(
          linkedSuppliers
            .filter((ls: any) => ls.id)
            .map((ls: any) => ls.id)
        );

        // Soft-delete supplier items that are no longer in the list
        for (const existing of existingSupplierItems) {
          if (!incomingSupplierItemIds.has(existing.id)) {
            await tx.supplierItem.update({
              where: { id: existing.id },
              data: { isDeleted: true }
            });
          }
        }

        // Process each linked supplier
        for (const linkedSupplier of linkedSuppliers) {
          // Resolve numeric supplier ID from string supplierId
          const supplier = await tx.supplier.findFirst({
            where: { supplierId: String(linkedSupplier.supplierId) }
          });

          if (!supplier) {
            console.warn(`Supplier not found: ${linkedSupplier.supplierId}`);
            continue; // Skip this supplier if not found
          }

          const numericSupplierId = supplier.id;

          // Check for soft-deleted supplier item that matches this combination
          const softDeleted = await tx.supplierItem.findFirst({
            where: {
              itemId: numericItemId,
              supplierId: numericSupplierId,
              isDeleted: true
            }
          });

          const supplierData = {
            categoryId: categoryId, // Include categoryId for consistency
            supplierUnitMeasureId: Number(linkedSupplier.supplierUnitMeasureId),
            conversionFactor: Number(linkedSupplier.conversionFactor),
            unitPrice: Number(linkedSupplier.unitPrice),
            averageDeliveryTime: linkedSupplier.averageDeliveryTime || null,
            notes: linkedSupplier.notes || null,
            isDeleted: false, // Ensure not deleted
          };

          if (linkedSupplier.id && existingSupplierItems.some((si: any) => si.id === linkedSupplier.id)) {
            // Update existing active supplier item
            await tx.supplierItem.update({
              where: { id: linkedSupplier.id },
              data: supplierData
            });
          } else if (softDeleted) {
            // Restore soft-deleted item instead of creating new
            await tx.supplierItem.update({
              where: { id: softDeleted.id },
              data: supplierData
            });
          } else {
            // Create new supplier item (first time linking)
            await tx.supplierItem.create({
              data: {
                itemId: numericItemId,
                supplierId: numericSupplierId,
                ...supplierData
              }
            });
          }
        }
      }

      return updated;
    });

    await calculateAndUpdateStatus(itemId);

    return NextResponse.json({ 
      success: true, 
      item: result,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating item:', error);
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