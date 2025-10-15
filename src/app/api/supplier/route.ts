import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';

/*
  Supplier API
  - GET: list suppliers (include supplierItems and linked inventory item info)
  - POST: create supplier (accepts linkedItems array of { item_id, unitPrice, averageDeliveryTime, notes })
  - PUT: update supplier and replace linked items
  - PATCH: soft-delete supplier
*/

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isDeleted: false },
      include: {
        supplierItems: {
          where: { isDeleted: false }, // Exclude soft-deleted supplier items
          include: { 
            item: { 
              include: {
                category: {
                  select: {
                    id: true,
                    categoryName: true
                  }
                },
                unitMeasure: {
                  select: {
                    id: true,
                    unitName: true,
                    abbreviation: true
                  }
                }
              }
            },
            supplierUnitMeasure: {
              select: {
                id: true,
                unitName: true,
                abbreviation: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // map with loose typing to avoid generated client type mismatches
    const mapped = (suppliers as any[]).map((s: any) => ({
      id: s.id,
      supplierId: s.supplierId,
      supplierName: s.supplierName,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      street: s.street,
      barangay: s.barangay,
      city: s.city,
      province: s.province,
      status: s.status,
      remarks: s.remarks,
      linkedItems: (s.supplierItems || []).map((si: any) => ({
        id: si.id,
        itemId: si.item?.itemId || null,
        itemName: si.item?.itemName || null,
        // Category information (from InventoryItem)
        itemCategory: si.item?.category?.categoryName || 'N/A',
        categoryId: si.item?.categoryId || si.categoryId || null,
        // Canonical unit (from InventoryItem.unitMeasure)
        canonicalUnit: si.item?.unitMeasure?.abbreviation || si.item?.unitMeasure?.unitName || 'N/A',
        canonicalUnitId: si.item?.unitMeasureId || null,
        // Supplier unit (from SupplierItem.supplierUnitMeasure)
        supplierUnitName: si.supplierUnitMeasure?.abbreviation || si.supplierUnitMeasure?.unitName || 'N/A',
        supplierUnitMeasureId: si.supplierUnitMeasureId || null,
        // Other fields
        conversionFactor: si.conversionFactor || 1,
        unitPrice: si.unitPrice,
        averageDeliveryTime: si.averageDeliveryTime,
        notes: si.notes,
        isPreferred: si.isPreferred || false,
        lastPurchaseDate: si.lastPurchaseDate
      }))
    }));

    return NextResponse.json({ success: true, suppliers: mapped });
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplierName,
      contactPerson,
      phone,
      email,
      street,
      barangay,
      city,
      province,
      status,
      remarks,
      linkedItems // optional array of { item_id, unitPrice, averageDeliveryTime, notes }
    } = body;

    // Generate unique supplierId
    const supplierId = await generateId('supplier', 'SUP');

    // Create supplier inside transaction and create supplierItems if provided
    // use any-typed transaction to avoid strict generated types
    const created = await (prisma as any).$transaction(async (tx: any) => {
      const s = await tx.supplier.create({
        data: {
          supplierId,
          supplierName,
          contactPerson,
          phone,
          email,
          street,
          barangay,
          city,
          province,
          status,
          remarks,
        }
      });

      if (Array.isArray(linkedItems) && linkedItems.length > 0) {
        for (const li of linkedItems) {
          // Resolve inventory item id (int) by itemId string
          const inv = await tx.inventoryItem.findFirst({ where: { itemId: String(li.item_id) } });
          if (!inv) continue;
          
          // Determine supplier unit measure and conversion factor
          // Default to item's canonical unit if not provided
          const supplierUnitMeasureId = li.supplierUnitMeasureId || inv.unitMeasureId;
          const conversionFactor = li.conversionFactor || 1;
          
          await tx.supplierItem.create({
            data: {
              supplierId: s.id,
              itemId: inv.id,
              categoryId: inv.categoryId, // Add categoryId from InventoryItem
              supplierUnitMeasureId: Number(supplierUnitMeasureId),
              conversionFactor: Number(conversionFactor),
              unitPrice: Number(li.unitPrice) || 0,
              averageDeliveryTime: li.averageDeliveryTime || null,
              notes: li.notes || null,
              isPreferred: li.isPreferred || false,
            }
          });
        }
      }

      return s;
    });

    return NextResponse.json({ success: true, supplier: created });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, supplierName, contactPerson, phone, email, street, barangay, city, province, status, remarks, linkedItems } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Missing supplier id' }, { status: 400 });

    const updated = await (prisma as any).$transaction(async (tx: any) => {
      // Update supplier
      const s = await tx.supplier.update({
        where: { id: Number(id) },
        data: { supplierName, contactPerson, phone, email, street, barangay, city, province, status, remarks }
      });

      // Get existing supplier items
      const existingItems = await tx.supplierItem.findMany({ 
        where: { supplierId: s.id, isDeleted: false } 
      });

      // Create a map of incoming items by item_id
      const incomingItemIds = new Set(
        (linkedItems || [])
          .map((li: any) => String(li.item_id))
          .filter(Boolean)
      );

      // Soft-delete items that are no longer in the list
      for (const existing of existingItems) {
        const inv = await tx.inventoryItem.findUnique({ where: { id: existing.itemId } });
        if (!inv || !incomingItemIds.has(inv.itemId)) {
          await tx.supplierItem.update({
            where: { id: existing.id },
            data: { isDeleted: true }
          });
        }
      }

      // Update or create items from linkedItems payload
      if (Array.isArray(linkedItems) && linkedItems.length > 0) {
        for (const li of linkedItems) {
          const inv = await tx.inventoryItem.findFirst({ where: { itemId: String(li.item_id) } });
          if (!inv) continue;
          
          // Check if this supplier-item combination already exists
          const existing = existingItems.find((e: any) => e.itemId === inv.id);
          
          const supplierUnitMeasureId = li.supplierUnitMeasureId || inv.unitMeasureId;
          const conversionFactor = li.conversionFactor || 1;
          const itemData = {
            categoryId: inv.categoryId, // Ensure categoryId is included
            supplierUnitMeasureId: Number(supplierUnitMeasureId),
            conversionFactor: Number(conversionFactor),
            unitPrice: Number(li.unitPrice) || 0,
            averageDeliveryTime: li.averageDeliveryTime || null,
            notes: li.notes || null,
            isPreferred: li.isPreferred || false,
            isDeleted: false,
          };

          if (existing) {
            // Update existing item
            await tx.supplierItem.update({
              where: { id: existing.id },
              data: itemData
            });
          } else {
            // Create new item
            await tx.supplierItem.create({ 
              data: {
                supplierId: s.id,
                itemId: inv.id,
                ...itemData
              }
            });
          }
        }
      }

      return s;
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing supplier id' }, { status: 400 });

    // Soft delete: set isDeleted = true for Supplier and all linked SupplierItems
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.supplier.update({ 
        where: { id: Number(id) }, 
        data: { isDeleted: true } 
      });
      
      await tx.supplierItem.updateMany({ 
        where: { supplierId: Number(id) }, 
        data: { isDeleted: true } 
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
