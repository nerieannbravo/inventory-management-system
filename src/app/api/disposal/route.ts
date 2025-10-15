import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { generateId } from '@/app/lib/idGenerator';
import type { DisposalMethod, DisposalStatus } from '@prisma/client';

// GET: Fetch all disposals (both bus and stock)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'bus' | 'stock' | null (all)
    const status = searchParams.get('status'); // filter by status

    let busDisposals: any[] = [];
    let stockDisposals: any[] = [];

    if (!type || type === 'bus') {
      busDisposals = await prisma.disposalRecord.findMany({
        where: { disposalType: 'BUS', isDeleted: false },
        include: { bus: { include: { item: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!type || type === 'stock') {
      stockDisposals = await prisma.disposalRecord.findMany({
        where: { disposalType: 'STOCK', isDeleted: false },
        include: { item: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        busDisposals,
        stockDisposals
      }
    });

  } catch (error) {
    console.error('❌ Error fetching disposals:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Create a new disposal (bus or stock)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, ...disposalData } = data;

    if (!type || !['bus', 'stock'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be either "bus" or "stock"' },
        { status: 400 }
      );
    }

    function mapDisposalMethod(value: unknown): DisposalMethod {
      if (typeof value === 'string') {
        const key = value.toLowerCase();
        switch (key) {
          case 'sold':
            return 'SOLD';
          case 'scrapped':
            return 'SCRAPPED';
          case 'donated':
            return 'DONATED';
          case 'transferred':
            return 'TRANSFERRED';
          default:
            return 'SOLD'; // fallback
        }
      }
      return 'SOLD'; // fallback
    }

    function mapDisposalStatus(value: unknown): DisposalStatus {
      if (typeof value === 'string') {
        const key = value.toLowerCase();
        switch (key) {
          case 'pending':
            return 'PENDING';
          case 'approved':
            return 'APPROVED';
          case 'rejected':
            return 'REJECTED';
          case 'completed':
            return 'COMPLETED';
          default:
            return 'PENDING'; // fallback
        }
      }
      return 'PENDING'; // fallback
    }

      if (type === 'bus') {
      // Validate bus exists and is not already disposed
      const bus = await prisma.bus.findUnique({ where: { busId: disposalData.busId } });

      if (!bus) {
        return NextResponse.json(
          { success: false, error: 'Bus not found' },
          { status: 404 }
        );
      }

      if (bus.status === 'DECOMMISSIONED') {
        return NextResponse.json(
          { success: false, error: 'Bus is already decommissioned/disposed' },
          { status: 400 }
        );
      }

      // Check for existing disposal record for this bus
      const existingDisposal = await prisma.disposalRecord.findFirst({ where: { busId: disposalData.busId, isDeleted: false } });

      if (existingDisposal) {
        return NextResponse.json(
          { success: false, error: 'This bus already has an active disposal record' },
          { status: 400 }
        );
      }

  const disposalId = await generateId('busDisposal', 'DISP');

      // Use transaction to create disposal and update bus status atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create the disposal record
        const busDisposal = await tx.disposalRecord.create({
          data: {
            disposalId,
            disposalType: 'BUS',
            busId: disposalData.busId,
            disposalDate: new Date(disposalData.disposalDate),
            disposalMethod: mapDisposalMethod(disposalData.disposalMethod),
            reason: disposalData.reason,
            estimatedValue: disposalData.estimatedValue ? parseFloat(disposalData.estimatedValue) : null,
            actualValue: disposalData.actualValue ? parseFloat(disposalData.actualValue) : null,
            status: mapDisposalStatus(disposalData.disposalStatus || 'PENDING'),
            approverEmpNumber: disposalData.approvedBy || null,
            approvedDate: disposalData.approvedDate ? new Date(disposalData.approvedDate) : null,
            remarks: disposalData.remarks || null,
            creatorEmpNumber: disposalData.createdBy || 'USR-00001',
          },
          include: { bus: true },
        });

        // Update the bus status to DECOMMISSIONED
        await tx.bus.update({ where: { busId: disposalData.busId }, data: { status: 'DECOMMISSIONED' } });

        return busDisposal;
      });

      return NextResponse.json({ success: true, data: result }, { status: 201 });

  } else if (type === 'stock') {
      // Validate inventory item exists. First try exact match by item_id,
      // then fall back to a more forgiving search (partial match on item_id or item_name)
      let item = null;
      if (disposalData.itemId) {
        item = await prisma.inventoryItem.findUnique({ where: { itemId: disposalData.itemId } });
      }
      if (!item && disposalData.itemId) {
        item = await prisma.inventoryItem.findFirst({ where: { isDeleted: false, OR: [{ itemId: { contains: String(disposalData.itemId), mode: 'insensitive' } }, { itemName: { contains: String(disposalData.itemId), mode: 'insensitive' } }] } });
      }

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Inventory item not found' },
          { status: 404 }
        );
      }

      // Check if there's enough stock
      if (disposalData.quantity > item.currentStock) {
        return NextResponse.json(
          { success: false, error: 'Insufficient stock for disposal' },
          { status: 400 }
        );
      }
      const disposalId = await generateId('stockDisposal', 'DISP');
      const stockDisposal = await prisma.disposalRecord.create({
        data: {
          disposalId,
          disposalType: 'STOCK',
          itemId: item.id,
          batchId: disposalData.batchId || null,
          quantity: Number(disposalData.quantity),
          disposalDate: new Date(disposalData.disposalDate),
          disposalMethod: mapDisposalMethod(disposalData.disposalMethod),
          reason: disposalData.reason,
          estimatedValue: disposalData.estimatedValue ? parseFloat(disposalData.estimatedValue) : null,
          actualValue: disposalData.actualValue ? parseFloat(disposalData.actualValue) : null,
          status: mapDisposalStatus(disposalData.disposalStatus || 'PENDING'),
          approverEmpNumber: disposalData.approvedBy || null,
          approvedDate: disposalData.approvedDate ? new Date(disposalData.approvedDate) : null,
          remarks: disposalData.remarks || null,
          creatorEmpNumber: disposalData.createdBy || 'USR-00001',
        },
        include: { item: true },
      });

      return NextResponse.json({ success: true, data: stockDisposal }, { status: 201 });
    }

  } catch (error) {
    console.error('❌ Error creating disposal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Update disposal status or details
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, disposal_id, ...updateData } = data;

    if (!type || !['bus', 'stock'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be either "bus" or "stock"' },
        { status: 400 }
      );
    }

    if (!disposal_id) {
      return NextResponse.json(
        { success: false, error: 'Disposal ID is required' },
        { status: 400 }
      );
    }

    if (type === 'bus') {
      // Check if disposal exists (bus-type)
      const existingDisposal = await prisma.disposalRecord.findUnique({
        where: { disposalId: disposal_id },
        include: { bus: true }
      });

      if (!existingDisposal) {
        return NextResponse.json(
          { success: false, error: 'Bus disposal not found' },
          { status: 404 }
        );
      }

      // Simple update for bus disposal
      await prisma.disposalRecord.update({
        where: { disposalId: disposal_id },
        data: updateData
      });

      const updatedDisposal = await prisma.disposalRecord.findUnique({
        where: { disposalId: disposal_id },
        include: { bus: true }
      });

      return NextResponse.json({ success: true, data: updatedDisposal });

    } else if (type === 'stock') {
      // Check if disposal exists (stock-type)
      const existingDisposal = await prisma.disposalRecord.findUnique({
        where: { disposalId: disposal_id },
        include: { item: true }
      });

      if (!existingDisposal) {
        return NextResponse.json(
          { success: false, error: 'Stock disposal not found' },
          { status: 404 }
        );
      }

      // Simple update for stock disposal
      await prisma.disposalRecord.update({
        where: { disposalId: disposal_id },
        data: updateData
      });

      const updatedDisposal = await prisma.disposalRecord.findUnique({
        where: { disposalId: disposal_id },
        include: { item: true }
      });

      return NextResponse.json({ success: true, data: updatedDisposal });
    }

  } catch (error) {
    console.error('❌ Error updating disposal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Soft delete a disposal record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const disposal_id = searchParams.get('disposal_id');

    if (!type || !['bus', 'stock'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be either "bus" or "stock"' },
        { status: 400 }
      );
    }

    if (!disposal_id) {
      return NextResponse.json(
        { success: false, error: 'Disposal ID is required' },
        { status: 400 }
      );
    }

    if (type === 'bus' || type === 'stock') {
      // Use unified DisposalRecord model for soft-delete
      const disposal = await prisma.disposalRecord.findUnique({
        where: { disposalId: disposal_id }
      });

      if (!disposal) {
        return NextResponse.json(
          { success: false, error: 'Disposal not found' },
          { status: 404 }
        );
      }

      await prisma.disposalRecord.update({
        where: { disposalId: disposal_id },
        data: { isDeleted: true }
      });
    }

    return NextResponse.json({ success: true, message: 'Disposal deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting disposal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
