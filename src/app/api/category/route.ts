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
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category_name, category_description } = await request.json();

    // Validate required fields
    if (!category_name || !category_description) {
      return NextResponse.json(
        { success: false, error: 'Category name and description are required' },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        category_name: category_name,
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
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, category_name, category_description } = await request.json();

    // Validate required fields
    if (!id || !category_name || !category_description) {
      return NextResponse.json(
        { success: false, error: 'Category ID, name, and description are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) } 
    });

    if (!existingCategory || existingCategory.isdeleted) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if new category name conflicts with another category
    const nameConflict = await prisma.category.findFirst({
      where: {
        category_name: category_name,
        isdeleted: false,
        NOT: { id: parseInt(id) }
      }
    });

    if (nameConflict) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 409 }
      );
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        category_name,
        category_description: category_description,
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}