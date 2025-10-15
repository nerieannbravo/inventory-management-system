import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      select: {
        busId: true,
        plateNumber: true,
        bodyNumber: true,
        status: true,
        busType: true,
        bodyBuilder: true,
        seatCapacity: true,
      },
    });
    return NextResponse.json({ success: true, buses });
  } catch (error) {
    console.error('❌ Error fetching buses:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}