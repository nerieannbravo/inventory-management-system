import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';

export async function GET() {
  try {
    // Fetch all categories except 'Bus'
    const categories = await prisma.category.findMany({
      where: {
        categoryName: { not: 'Bus' },
        isDeleted: false,
      },
      select: {
        id: true,
        categoryId: true,
        categoryName: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { categoryName: 'asc' }
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
    const { categoryName, categoryDescription } = await request.json();

    // Validate required fields
    if (!categoryName || !categoryDescription) {
      return NextResponse.json(
        { success: false, error: 'Category name and description are required' },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        categoryName: categoryName,
        isDeleted: false,
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 409 }
      );
    }

    // Generate new category ID
    const categoryId = await generateId('category', 'CAT');

    // Create new category
    const category = await prisma.category.create({
      data: {
        categoryId,
        categoryName,
        description: categoryDescription,
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
    const { id, categoryName, categoryDescription } = await request.json();

    // Validate required fields
    if (!id || !categoryName || !categoryDescription) {
      return NextResponse.json(
        { success: false, error: 'Category ID, name, and description are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory || existingCategory.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if new category name conflicts with another category
    const nameConflict = await prisma.category.findFirst({
      where: {
        categoryName: categoryName,
        isDeleted: false,
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
        categoryName,
        description: categoryDescription,
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