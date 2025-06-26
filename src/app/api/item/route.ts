import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';
import { calculateAndUpdateStatus } from "../../lib/itemStatus";

export async function GET() {
  try {
    // Get current date at midnight for expiration check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch all items from the inventory that aren't deleted
    const items = await prisma.inventoryItem.findMany({
      where: {
        isdeleted: false
      },
      select: {
        item_id: true,
        item_name: true,
        unit_measure: true,
        status: true,
        current_stock: true,
        category_id: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        reorder_level: true,
        date_created: true,
        date_updated: true,
        batches: {
          where: {
            isdeleted: false
          },
          select: {
            batch_id: true,
            f_item_id: true,
            usable_quantity: true,
            defective_quantity: true,
            missing_quantity: true,
            expiration_date: true,
            date_created: true,
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
    if (item.category_id === 'CAT-00002') {
      current_stock = item.current_stock;
    } else {
      current_stock = batches.reduce((sum, batch) => sum + batch.usable_quantity, 0);
    }

    const hasExpiredBatch = batches.some(batch => {
      if (!batch.expiration_date) return false;
      const expirationDate = new Date(batch.expiration_date);
      expirationDate.setHours(0, 0, 0, 0);
      return expirationDate <= today;
    });

    let status: 'EXPIRED' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'AVAILABLE' | 'UNDER_MAINTENANCE';
    if (hasExpiredBatch) {
      status = 'EXPIRED';
    } else if (item.category.category_name === "Consumable" && current_stock === 0) {
      status = 'OUT_OF_STOCK';
    } else if (item.category.category_name === "Consumable" && current_stock <= item.reorder_level) {
      status = 'LOW_STOCK';
    } else {
      status = item.status as typeof status;
    }
      await prisma.inventoryItem.update({
        where: { item_id:item.item_id },
        data: { status }
      });

      return {
        ...itemData,
        current_stock,
        status,
        batches
      };
    }));

    // Count all buses using item_id 'ITEM-00001'
          const busCount = await prisma.bus.count({
            where: { item_id: 'ITEM-00001' }
          });
          // Update current_stock in inventoryItem
          await prisma.inventoryItem.update({
            where: { item_id: 'ITEM-00001' },
            data: { current_stock: busCount }
          });

    // Also return all batches separately if needed
    const batches = await prisma.batch.findMany({
      where: { isdeleted: false },
      select: {
        batch_id: true,
        f_item_id: true,
        usable_quantity: true,
        defective_quantity: true,
        missing_quantity: true,
        expiration_date: true,
        date_created: true,
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
    const results = [];
    
    for (let i = 0; i < stockItems.length; i++) {
      const item = stockItems[i];
      console.log(`📦 Processing item ${i + 1}/${stockItems.length}: ${item.itemName}`);
      
      try {
        // Check if the inventory item already exists
        console.log(`🔍 Checking if item exists: ${item.itemName}`);
        const existingItem = await prisma.inventoryItem.findFirst({
          where: { item_name: item.itemName, isdeleted: false },
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
          console.log(`🔄 Updating existing item: ${existingItem.item_id}`);
          // Update existing inventory item

          const updatedItem = await prisma.inventoryItem.update({
            where: { item_id: existingItem.item_id, isdeleted: false },
            data: {
              current_stock: item.current_stock,
              reorder_level: item.reorder,
              status: inventoryStatus,
              date_updated: new Date(),
              batches: {
                create: {
                  batch_id,
                  f_item_id: item.name,
                  usable_quantity: item.usable,
                  defective_quantity: item.defective,
                  missing_quantity: item.missing,
                  expiration_date: item.expiration ? new Date(item.expiration) : null,
                  created_by: "USR-00001",
                  date_created: new Date(),
                }
              }
            }
          });
          console.log(`✅ Successfully updated item ${i + 1}`);
          results.push({ success: true, action: 'updated', item: updatedItem });
          await calculateAndUpdateStatus(existingItem.item_id);
        } else {
          console.log(`🆔 Generating item ID for new item ${i + 1}`);
          const item_id = await generateId('inventoryItem', 'ITEM');
          console.log(`✅ Generated item ID: ${item_id}`);
          
          // Get category information
          console.log(`🏷️ Finding category for: ${item.category}`);
          const category = await prisma.category.findFirst({
            where: { 
              category_name: item.category === 'Consumable' 
                ? 'Consumable' 
                : item.category
            }
          });

          if (!category) {
            throw new Error(`Category not found for ${item.category}`);
          }
          console.log(`✅ Found category: ${category.category_id}`);

          // Create new inventory item
          console.log(`➕ Creating new inventory item ${i + 1}`);
          const newItem = await prisma.inventoryItem.create({
            data: {
              item_id,
              // f_item_id: item.name,
              category_id: category.category_id,
              item_name: item.itemName,
              unit_measure: item.unit,
              reorder_level: item.reorder,
              status: inventoryStatus,
              created_by: "USR-00001",
              date_created: new Date(),
              batches: {
                create: {
                  batch_id,
                  f_item_id: item.name,
                  usable_quantity: item.usable,
                  defective_quantity: item.defective,
                  missing_quantity: item.missing,
                  expiration_date: item.expiration ? new Date(item.expiration) : null,
                  created_by: "USR-00001",
                  date_created: new Date(),
                }
              }
            }
          });
          await calculateAndUpdateStatus(item_id);
          console.log(`✅ Successfully created item ${i + 1}: ${newItem.item_id}`);
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
    const { item_id, reorder_level, status, category_id } = await request.json();

    if (!item_id || item_id === "undefined") {
            return NextResponse.json({ success: false, error: "Missing or invalid item_id" }, { status: 400 });
        }

    const updated = await prisma.inventoryItem.update({
            where: { item_id: String(item_id) },
            data: {
                reorder_level: reorder_level,
                status: status,
                category_id: category_id,
                date_updated: new Date(),
            },
        });
        await calculateAndUpdateStatus(item_id);
        return NextResponse.json({ 
      success: true, 
      item: updated,
      message: 'Item updated successfully'
    });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH (req: NextRequest) {

    if (req.method === 'PATCH') {
        try {
            const { item_id } = await req.json();
          // Soft-delete the inventory item
          await prisma.inventoryItem.update({
              where: { item_id: String(item_id) },
              data: { isdeleted: true },
          });
          // Soft-delete all batches for this item
          await prisma.batch.updateMany({
              where: { item_id: String(item_id) },
              data: { isdeleted: true },
          });
          return NextResponse.json({ success: true });
      } catch (error) {
          console.error("Delete error:", error);
          return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
      }
  }
}

