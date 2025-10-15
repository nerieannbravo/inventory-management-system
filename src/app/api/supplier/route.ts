import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

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
          include: { 
            item: { 
              select: { 
                itemId: true, 
                itemName: true, 
                unitMeasureId: true 
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
        unitMeasure: si.supplierUnitMeasure?.abbreviation || si.supplierUnitMeasure?.unitName || 'N/A',
        supplierUnitMeasureId: si.supplierUnitMeasureId || null,
        conversionFactor: si.conversionFactor || 1,
        unitPrice: si.unitPrice,
        averageDeliveryTime: si.averageDeliveryTime,
        notes: si.notes,
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

    // Create supplier inside transaction and create supplierItems if provided
    // use any-typed transaction to avoid strict generated types
    const created = await (prisma as any).$transaction(async (tx: any) => {
      const s = await tx.supplier.create({
        data: {
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
              supplierUnitMeasureId: supplierUnitMeasureId,
              conversionFactor: Number(conversionFactor),
              unitPrice: Number(li.unitPrice) || 0,
              averageDeliveryTime: li.averageDeliveryTime || null,
              notes: li.notes || null,
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
      const s = await tx.supplier.update({
        where: { id: Number(id) },
        data: { supplierName, contactPerson, phone, email, street, barangay, city, province, status, remarks }
      });

      // Replace supplier items: delete existing and recreate
      await tx.supplierItem.deleteMany({ where: { supplierId: s.id } });

      if (Array.isArray(linkedItems) && linkedItems.length > 0) {
        for (const li of linkedItems) {
          const inv = await tx.inventoryItem.findFirst({ where: { itemId: String(li.item_id) } });
          if (!inv) continue;
          
          // Determine supplier unit measure and conversion factor
          // Default to item's canonical unit if not provided
          const supplierUnitMeasureId = li.supplierUnitMeasureId || inv.unitMeasureId;
          const conversionFactor = li.conversionFactor || 1;
          
          await tx.supplierItem.create({ data: {
            supplierId: s.id,
            itemId: inv.id,
            supplierUnitMeasureId: supplierUnitMeasureId,
            conversionFactor: Number(conversionFactor),
            unitPrice: Number(li.unitPrice) || 0,
            averageDeliveryTime: li.averageDeliveryTime || null,
            notes: li.notes || null,
          }});
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

  await (prisma as any).supplier.update({ where: { id: Number(id) }, data: { isDeleted: true } });
  await (prisma as any).supplierItem.deleteMany({ where: { supplierId: Number(id) } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
