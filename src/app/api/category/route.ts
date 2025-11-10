import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';

export async function GET() {
  try {
    // Fetch all categories except 'Bus'
    const categories = await prisma.category.findMany({
      where: {
        category_name: { not: 'Bus' },
        isdeleted: false,
      },
      select: {
        id: true,
        category_id: true,
        category_name: true,
        category_description: true,
        date_created: true,
        date_updated: true,
      },
      orderBy: { category_name: 'asc' }
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category_name, category_description } = await request.json();

    // Check if category name already exists (case-insensitive)
    const existingCategory = await prisma.category.findFirst({
      where: {
        category_name: { equals: category_name, mode: 'insensitive' },
        isdeleted: false,
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 409 }
      );
    }

    // Generate new category ID
    const category_id = await generateId('category', 'CAT');

    // Create new category
    const category = await prisma.category.create({
      data: {
        category_id,
        category_name,
        category_description: category_description,
      }
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, category_name, category_description } = await request.json();

    // Validate required fields
    if (!id || !category_name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({ where: { id: Number(id) } });

    if (!existingCategory || existingCategory.isdeleted) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if new category name conflicts with another category (only if name is changing)
    const isNameChanging = String(category_name).trim() !== String(existingCategory.category_name).trim();
    if (isNameChanging) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          category_name: { equals: category_name, mode: 'insensitive' },
          isdeleted: false,
          NOT: { id: Number(id) }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'Category name already exists' },
          { status: 409 }
        );
      }
    }

    // Check if category is linked/used by items or inventory
    const linkedItemsCount = await prisma.item.count({ where: { category_id: Number(id), isdeleted: false } });
    const linkedInventoryCount = await prisma.inventoryItem.count({ where: { category_id: existingCategory.category_id, isdeleted: false } });

    // If linked and user attempts to change the name, block only the name change but allow description update
    if ((linkedItemsCount > 0 || linkedInventoryCount > 0) && isNameChanging) {
      return NextResponse.json({ success: false, error: 'Category name cannot be edited because it is linked to items or inventory' }, { status: 400 });
    }

    // Build update payload: allow description update always; allow name update only when not changing while linked
    const updateData: Record<string, unknown> = {
      category_description: category_description,
    };
    if (!isNameChanging || (isNameChanging && linkedItemsCount === 0 && linkedInventoryCount === 0)) {
      // safe to update name
      updateData.category_name = category_name;
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Category id is required' }, { status: 400 });

    const category = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!category || category.isdeleted) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });

    // Check linked usage
    const linkedItemsCount = await prisma.item.count({ where: { category_id: Number(id), isdeleted: false } });
    const linkedInventoryCount = await prisma.inventoryItem.count({ where: { category_id: category.category_id, isdeleted: false } });

    if (linkedItemsCount > 0 || linkedInventoryCount > 0) {
      return NextResponse.json({ success: false, error: 'Category is linked to items or inventory and cannot be deleted' }, { status: 400 });
    }

    const deleted = await prisma.category.update({ where: { id: Number(id) }, data: { isdeleted: true } });
    return NextResponse.json({ success: true, category: deleted });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}