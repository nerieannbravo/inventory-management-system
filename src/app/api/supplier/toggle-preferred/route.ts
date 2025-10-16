import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

/**
 * PATCH /api/supplier/toggle-preferred
 * Toggle the isPreferred field for a specific SupplierItem
 * 
 * Request body: { supplierItemId: number }
 * Response: { success: boolean, isPreferred: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierItemId } = body;

    if (!supplierItemId) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierItemId' },
        { status: 400 }
      );
    }

    // Get current isPreferred value
    const currentSupplierItem = await prisma.supplierItem.findUnique({
      where: { id: Number(supplierItemId) },
      select: { isPreferred: true }
    });

    if (!currentSupplierItem) {
      return NextResponse.json(
        { success: false, error: 'SupplierItem not found' },
        { status: 404 }
      );
    }

    // Toggle the isPreferred value
    const newIsPreferred = !currentSupplierItem.isPreferred;

    const updatedSupplierItem = await prisma.supplierItem.update({
      where: { id: Number(supplierItemId) },
      data: { isPreferred: newIsPreferred }
    });

    return NextResponse.json({
      success: true,
      isPreferred: updatedSupplierItem.isPreferred
    });
  } catch (error: any) {
    console.error('Error toggling isPreferred:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
