import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';
import { generateId } from '../../lib/idGenerator';

// GET /api/items
// Supports:
// - fetch all with pagination and search: ?q=term&page=1&limit=25&sortBy=item_name&order=asc
// - fetch single by numeric id: ?id=123
// - fetch single by item_id string: ?item_id=ITEM-001
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const idParam = params.get('id');
    const itemIdParam = params.get('item_id') || params.get('itemId');
    const q = params.get('q') ?? undefined;

    // If client requests a single item by primary id (number) or item_id (string)
    if (idParam) {
      const id = Number(idParam);
      if (Number.isNaN(id)) {
        return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
      }

      const item = await prisma.item.findUnique({
        where: { id },
        include: {
          unit: { select: { id: true, unit_name: true, abbreviation: true } },
          category: { select: { id: true, category_name: true, category_id: true } },
        },
      });
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      // compute supplier count excluding soft-deleted supplier_items
      const supplierCount = await prisma.supplierItem.count({ where: { item_id: item.id, isdeleted: false } });
      return NextResponse.json({ ...item, supplierCount });
    }

    if (itemIdParam) {
      const item = await prisma.item.findUnique({
        where: { item_id: itemIdParam },
        include: {
          unit: { select: { id: true, unit_name: true, abbreviation: true } },
          category: { select: { id: true, category_name: true, category_id: true } },
        },
      });
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      const supplierCount2 = await prisma.supplierItem.count({ where: { item_id: item.id, isdeleted: false } });
      return NextResponse.json({ ...item, supplierCount: supplierCount2 });
    }

    // Pagination & filtering for list
    const page = Math.max(1, Number(params.get('page') ?? 1));
    const limit = Math.min(1000, Math.max(1, Number(params.get('limit') ?? 50)));
    const skip = (page - 1) * limit;

    const sortBy = params.get('sortBy') ?? 'date_created';
    const order = (params.get('order') ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  // Build where clause
  const where: Prisma.ItemWhereInput = { isdeleted: false };
    if (q) {
      where.OR = [
        { item_name: { contains: q, mode: 'insensitive' } },
        { item_id: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          unit: { select: { id: true, unit_name: true, abbreviation: true } },
          category: { select: { id: true, category_name: true, category_id: true } },
        },
      }),
    ]);

    // Get supplier counts for the returned items (exclude soft-deleted supplier_items)
    const itemIds = items.map(i => i.id);
    const counts = itemIds.length > 0
      ? await prisma.supplierItem.groupBy({
          by: ['item_id'],
          where: { item_id: { in: itemIds }, isdeleted: false },
          _count: { item_id: true },
        })
      : [];
    const countsMap = new Map<number, number>();
    for (const c of counts) {
      countsMap.set(c.item_id as number, (c._count?.item_id as number) ?? 0);
    }

    const mapped = items.map(it => ({
      ...it,
      supplierCount: countsMap.get(it.id) ?? 0,
    }));

    return NextResponse.json({
      data: mapped,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('GET /api/items error', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/items
// Body (JSON): { item_id, item_name, unit_id, category_id, status?, description? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ensure item_name uniqueness (case-insensitive) before creating
    if (body.item_name) {
      const existing = await prisma.item.findFirst({ where: { item_name: { equals: String(body.item_name), mode: 'insensitive' }, isdeleted: false } });
      if (existing) {
        return NextResponse.json({ error: 'Item name already exists' }, { status: 409 });
      }
    }

    // Basic validation (item_id is generated)
    const required = ['item_name', 'unit_id', 'category_id'];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `${key} is required` }, { status: 400 });
      }
    }

    // Validate unit_id exists and is not deleted
    const unitId = Number(body.unit_id);
    if (Number.isNaN(unitId) || unitId <= 0) {
      return NextResponse.json({ error: 'Invalid unit_id' }, { status: 400 });
    }

    const unit = await prisma.unitMeasure.findUnique({ where: { id: unitId } });
    if (!unit || unit.is_deleted) {
      return NextResponse.json({ error: 'Unit not found or has been deleted' }, { status: 400 });
    }

    // Validate category exists and is not deleted.
    // Accept either numeric PK id or the string category_id.
    const maybeCategoryNum = Number(body.category_id);
    let category: Awaited<ReturnType<typeof prisma.category.findUnique>> | null = null;
    if (!Number.isNaN(maybeCategoryNum)) {
      category = await prisma.category.findUnique({ where: { id: maybeCategoryNum } });
    } else {
      category = await prisma.category.findUnique({ where: { category_id: String(body.category_id) } });
    }
    if (!category || category.isdeleted) {
      return NextResponse.json({ error: 'Category not found or has been deleted' }, { status: 400 });
    }

    // Generate a new item_id using the project's generator
    const newItemId = await generateId('item', 'ITM');

    const createData: Prisma.ItemCreateInput = {
      item_id: newItemId,
      item_name: String(body.item_name),
      unit: { connect: { id: unitId } },
      // Connect category by numeric id (Item.category_id is an Int FK)
      category: { connect: { id: category.id } },
      status: body.status ?? undefined,
      description: body.description ?? undefined,
    } as unknown as Prisma.ItemCreateInput;

    const created = await prisma.item.create({ data: createData });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/items error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/items - update existing item. Body should include id (numeric) or item_id.
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Must provide id of the item to update
    const id = body.id ?? null;
    if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 });

    const itemIdNum = Number(id);
    if (Number.isNaN(itemIdNum)) return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });

    // If name provided, check uniqueness excluding current record
    if (body.item_name) {
      const conflict = await prisma.item.findFirst({ where: { item_name: { equals: String(body.item_name), mode: 'insensitive' }, NOT: { id: itemIdNum }, isdeleted: false } });
      if (conflict) return NextResponse.json({ error: 'Item name already exists' }, { status: 409 });
    }

    // Validate unit/category if provided
    if (body.unit_id) {
      const unitId = Number(body.unit_id);
      if (Number.isNaN(unitId) || unitId <= 0) return NextResponse.json({ error: 'Invalid unit_id' }, { status: 400 });
      const unit = await prisma.unitMeasure.findUnique({ where: { id: unitId } });
      if (!unit || unit.is_deleted) return NextResponse.json({ error: 'Unit not found or has been deleted' }, { status: 400 });
    }

    if (body.category_id) {
      const maybeCategoryNum = Number(body.category_id);
      let category = null;
      if (!Number.isNaN(maybeCategoryNum)) category = await prisma.category.findUnique({ where: { id: maybeCategoryNum } });
      else category = await prisma.category.findUnique({ where: { category_id: String(body.category_id) } });
      if (!category || category.isdeleted) return NextResponse.json({ error: 'Category not found or has been deleted' }, { status: 400 });
    }

    // Build update data
    const updateData: Prisma.ItemUpdateInput = {} as unknown as Prisma.ItemUpdateInput;
    if (body.item_name) updateData.item_name = String(body.item_name);
    if (body.unit_id) updateData.unit = { connect: { id: Number(body.unit_id) } };
    if (body.category_id) {
      const maybeCategoryNum = Number(body.category_id);
      const catId = Number.isNaN(maybeCategoryNum) ? undefined : maybeCategoryNum;
      if (catId) updateData.category = { connect: { id: catId } };
    }
    if (body.status) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description ?? undefined;

    const updated = await prisma.item.update({ where: { id: itemIdNum }, data: updateData });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error('PUT /api/items error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
