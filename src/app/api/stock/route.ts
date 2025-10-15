// pages/api/item/check-existing.ts or app/api/item/check-existing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const itemName = searchParams.get('itemName');

    // If action is 'check-existing', handle the existing item check
    if (action === 'check-existing') {
      console.log('Checking existing item for:', itemName); // Debug log

      if (!itemName) {
        return NextResponse.json(
          { error: 'Item name is required' },
          { status: 400 }
        );
      }

      // Check if item exists in the local database
      const existingItem = await prisma.inventoryItem.findFirst({
        where: { itemName, isDeleted: false },
        include: { category: true },
      });

      console.log('Found existing item:', existingItem); // Debug log

      if (existingItem) {
        return NextResponse.json({
          success: true,
          exists: true,
          item: {
            categoryName: existingItem.category.categoryName,
            categoryId: existingItem.categoryId,
            reorderLevel: existingItem.reorderLevel,
            unitMeasure: existingItem.unitMeasure,
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          exists: false
        });
      }
    }

  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH (req: NextRequest) {
    if (req.method === 'PATCH') {
        try {
            const { batchId } = await req.json();
    
            // First, get the batch data to retrieve usable_quantity and item_id
      const batch = await prisma.batch.findUnique({
        where: { batchId: String(batchId) },
        select: { usableQuantity: true, itemId: true, isDeleted: true },
      });

            if (!batch) {
                return NextResponse.json({ 
                    success: false, 
                    error: "Batch not found" 
                }, { status: 404 });
            }

      if (batch.isDeleted) {
                return NextResponse.json({ 
                    success: false, 
                    error: "Batch is already deleted" 
                }, { status: 400 });
            }

            // Use a transaction to ensure both operations succeed or fail together
            await prisma.$transaction(async (tx) => {
                // Mark batch as deleted
                await tx.batch.update({ where: { batchId: String(batchId) }, data: { isDeleted: true } });

                // Subtract usable_quantity from current_stock
                // Resolve numeric inventoryItem id
                const targetItem = await tx.inventoryItem.findUnique({ where: { id: batch.itemId } });
                if (targetItem) {
                  await tx.inventoryItem.update({
                    where: { id: targetItem.id },
                    data: { currentStock: { decrement: batch.usableQuantity } },
                  });
                }
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Delete error:", error);
            return NextResponse.json({ 
                success: false, 
                error: (error as Error).message 
            }, { status: 500 });
        }
    }
}

