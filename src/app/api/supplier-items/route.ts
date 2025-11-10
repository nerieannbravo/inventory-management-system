import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/supplier-items
// Supports: list all, filter by item_id (?item_id=123 or item_id=ITEM-001) or supplier_id
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const itemId = params.get('item_id') ?? params.get('itemId');
    const supplierId = params.get('supplier_id') ?? params.get('supplierId');

  const where: Record<string, unknown> = { isdeleted: false };
  if (itemId) (where as Record<string, unknown>)['item_id'] = isNaN(Number(itemId)) ? String(itemId) : Number(itemId);
  if (supplierId) (where as Record<string, unknown>)['supplier_id'] = isNaN(Number(supplierId)) ? String(supplierId) : Number(supplierId);

    const data = await prisma.supplierItem.findMany({
      where,
      include: {
        supplier: { select: { id: true, supplier_id: true, supplier_name: true } },
        unit: { select: { id: true, unit_name: true, abbreviation: true } },
        item: { select: { id: true, item_id: true, item_name: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (err: unknown) {
    console.error('GET /api/supplier-items error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/supplier-items
// Body: { item_id, supplier_id, unit_id, unit_price, delivery_time, note?, is_preferred? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = ['item_id', 'supplier_id', 'unit_id', 'unit_price', 'delivery_time'];
    for (const key of required) {
      if (body[key] === undefined || body[key] === null || body[key] === '') {
        return NextResponse.json({ error: `${key} is required` }, { status: 400 });
      }
    }

    const unitId = Number(body.unit_id);
    if (Number.isNaN(unitId) || unitId <= 0) return NextResponse.json({ error: 'Invalid unit_id' }, { status: 400 });
    const supplierIdNum = Number(body.supplier_id);
    if (Number.isNaN(supplierIdNum) || supplierIdNum <= 0) return NextResponse.json({ error: 'Invalid supplier_id' }, { status: 400 });

    // verify existence
    const [unit, supplier] = await Promise.all([
      prisma.unitMeasure.findUnique({ where: { id: unitId } }),
      prisma.supplier.findUnique({ where: { id: supplierIdNum } }),
    ]);
    if (!unit || unit.is_deleted) return NextResponse.json({ error: 'Unit not found or deleted' }, { status: 400 });
    if (!supplier || supplier.isdeleted) return NextResponse.json({ error: 'Supplier not found or deleted' }, { status: 400 });

    // item_id in supplier_items relates to Item.id (int) in schema - accept numeric id or item_id string
  let itemConnect: { id: number } | undefined = undefined;
    const itemIdNum = Number(body.item_id);
    if (!Number.isNaN(itemIdNum)) {
      const it = await prisma.item.findUnique({ where: { id: itemIdNum } });
      if (!it) return NextResponse.json({ error: 'Item not found' }, { status: 400 });
      itemConnect = { id: itemIdNum };
    } else {
      const it = await prisma.item.findUnique({ where: { item_id: String(body.item_id) } });
      if (!it) return NextResponse.json({ error: 'Item not found' }, { status: 400 });
      itemConnect = { id: it.id };
    }

    // create supplierItem
    // if a supplier-item record already exists (including soft-deleted), detect it first
    const existing = await prisma.supplierItem.findUnique({
      where: { supplier_id_item_id: { supplier_id: supplierIdNum, item_id: itemConnect.id } },
      include: { supplier: true, unit: true, item: true },
    });
    if (existing) {
      if (!existing.isdeleted) {
        return NextResponse.json({ error: 'Supplier-item already exists' }, { status: 409 });
      }
      // exists but soft-deleted -> inform client so they can offer to restore
      return NextResponse.json({ error: 'Supplier-item exists but was deleted', deleted: true, supplier: existing.supplier ?? null, supplier_id: existing.supplier_id, item_id: existing.item_id }, { status: 409 });
    }

    const created = await prisma.supplierItem.create({
      data: {
        supplier: { connect: { id: supplierIdNum } },
        item: { connect: itemConnect },
        unit: { connect: { id: unitId } },
        unit_price: Number(body.unit_price),
        delivery_time: String(body.delivery_time),
        note: body.note ? String(body.note) : undefined,
        is_preferred: body.is_preferred ? Boolean(body.is_preferred) : false,
      },
      include: { supplier: true, unit: true, item: true },
    });

    // return created record
    const out = {
      id: created.supplier_id ?? undefined,
      supplier_id: created.supplier_id,
      supplierName: created.supplier?.supplier_name,
      unit_price: created.unit_price,
      delivery_time: created.delivery_time,
      note: created.note,
      date_updated: created.date_updated,
      updated_at: created.date_updated,
    };
    return NextResponse.json(out, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/supplier-items error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/supplier-items
// Body: { supplier_id, item_id, unit_id?, unit_price?, delivery_time?, note?, is_preferred? }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const supplierId = Number(body.supplier_id ?? body.supplierId ?? body.id);
    const itemId = Number(body.item_id ?? body.itemId);
    if (Number.isNaN(supplierId) || Number.isNaN(itemId)) return NextResponse.json({ error: 'supplier_id and item_id are required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    // support restore flag - when present and true, clear soft-delete
    if (body.restore === true) {
      data.isdeleted = false;
    }
    if (body.unit_id !== undefined) data.unit_id = Number(body.unit_id);
    if (body.unit_price !== undefined) data.unit_price = Number(body.unit_price);
    if (body.delivery_time !== undefined) data.delivery_time = String(body.delivery_time);
    if (body.note !== undefined) data.note = body.note === null ? null : String(body.note);
    if (body.is_preferred !== undefined) data.is_preferred = Boolean(body.is_preferred);

    // verify that the supplier-item exists
    const existing = await prisma.supplierItem.findUnique({ where: { supplier_id_item_id: { supplier_id: supplierId, item_id: itemId } } });
    if (!existing) return NextResponse.json({ error: 'Supplier-item not found' }, { status: 404 });

    // if updating unit, validate unit
    if (data.unit_id !== undefined) {
      const unit = await prisma.unitMeasure.findUnique({ where: { id: Number(data.unit_id) } });
      if (!unit || unit.is_deleted) return NextResponse.json({ error: 'Unit not found or deleted' }, { status: 400 });
    }

    const updated = await prisma.supplierItem.update({
      where: { supplier_id_item_id: { supplier_id: supplierId, item_id: itemId } },
      data,
      include: { supplier: true, unit: true, item: true },
    });

    return NextResponse.json({ data: updated, date_updated: updated.date_updated, updated_at: updated.date_updated });
  } catch (err: unknown) {
    console.error('PATCH /api/supplier-items error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/supplier-items
// Body: { supplier_id, item_id }
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const supplierId = Number(body.supplier_id ?? body.supplierId ?? body.id);
    const itemId = Number(body.item_id ?? body.itemId);
    if (Number.isNaN(supplierId) || Number.isNaN(itemId)) return NextResponse.json({ error: 'supplier_id and item_id are required' }, { status: 400 });

    const existing = await prisma.supplierItem.findUnique({ where: { supplier_id_item_id: { supplier_id: supplierId, item_id: itemId } } });
    if (!existing) return NextResponse.json({ error: 'Supplier-item not found' }, { status: 404 });
    if (existing.isdeleted) return NextResponse.json({ error: 'Already deleted' }, { status: 400 });

    const deleted = await prisma.supplierItem.update({
      where: { supplier_id_item_id: { supplier_id: supplierId, item_id: itemId } },
      data: { isdeleted: true },
    });

    return NextResponse.json({ success: true, date_updated: deleted.date_updated, updated_at: deleted.date_updated });
  } catch (err: unknown) {
    console.error('DELETE /api/supplier-items error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
