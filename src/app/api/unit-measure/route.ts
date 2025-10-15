import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';

/*
  Unit Measure API
  - GET: list all unit measures
  - POST: create a new unit measure
  - PUT: update an existing unit measure
  - PATCH: soft-delete a unit measure
*/

export async function GET() {
  try {
    const unitMeasures = await prisma.unitMeasure.findMany({
      where: { isDeleted: false },
      orderBy: { unitName: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      unitMeasures: unitMeasures.map(um => ({
        id: um.id,
        unitId: um.unitId,
        unitName: um.unitName,
        abbreviation: um.abbreviation,
        description: um.description,
        createdAt: um.createdAt,
        updatedAt: um.updatedAt,
      }))
    });
  } catch (error: any) {
    console.error('Error fetching unit measures:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitName, abbreviation, description } = body;

    // Validate required fields
    if (!unitName || !abbreviation) {
      return NextResponse.json(
        { success: false, error: 'Unit name and abbreviation are required' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await prisma.unitMeasure.findFirst({
      where: {
        OR: [
          { unitName: { equals: unitName, mode: 'insensitive' } },
          { abbreviation: { equals: abbreviation, mode: 'insensitive' } }
        ],
        isDeleted: false
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Unit name or abbreviation already exists' },
        { status: 409 }
      );
    }

    // Generate unique ID
    const unitId = await generateId('unitMeasure', 'UNIT');

    // Create unit measure
    const unitMeasure = await prisma.unitMeasure.create({
      data: {
        unitId,
        unitName,
        abbreviation,
        description,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Unit measure created successfully',
      unitMeasure: {
        id: unitMeasure.id,
        unitId: unitMeasure.unitId,
        unitName: unitMeasure.unitName,
        abbreviation: unitMeasure.abbreviation,
        description: unitMeasure.description,
      }
    });
  } catch (error: any) {
    console.error('Error creating unit measure:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, unitName, abbreviation, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Unit measure ID is required' },
        { status: 400 }
      );
    }

    // Check if unit measure exists
    const existing = await prisma.unitMeasure.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Unit measure not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names/abbreviations (excluding current record)
    if (unitName || abbreviation) {
      const duplicate = await prisma.unitMeasure.findFirst({
        where: {
          OR: [
            unitName ? { unitName: { equals: unitName, mode: 'insensitive' } } : {},
            abbreviation ? { abbreviation: { equals: abbreviation, mode: 'insensitive' } } : {}
          ],
          isDeleted: false,
          id: { not: id }
        }
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Unit name or abbreviation already exists' },
          { status: 409 }
        );
      }
    }

    // Update unit measure
    const updated = await prisma.unitMeasure.update({
      where: { id },
      data: {
        ...(unitName && { unitName }),
        ...(abbreviation && { abbreviation }),
        ...(description !== undefined && { description }),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Unit measure updated successfully',
      unitMeasure: {
        id: updated.id,
        unitId: updated.unitId,
        unitName: updated.unitName,
        abbreviation: updated.abbreviation,
        description: updated.description,
      }
    });
  } catch (error: any) {
    console.error('Error updating unit measure:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Unit measure ID is required' },
        { status: 400 }
      );
    }

    // Check if unit measure is in use
    const inUse = await prisma.inventoryItem.count({
      where: { unitMeasureId: id, isDeleted: false }
    });

    if (inUse > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete unit measure. It is currently used by ${inUse} inventory item(s).` },
        { status: 409 }
      );
    }

    // Soft delete
    await prisma.unitMeasure.update({
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Unit measure deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting unit measure:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
