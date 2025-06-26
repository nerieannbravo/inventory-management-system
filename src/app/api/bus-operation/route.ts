import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      select: {
        bus_id: true,
        plate_number: true,
        body_number: true,
        status: true,
        bus_type: true,
        body_builder: true,
        seat_capacity: true,
      },
    });
    return NextResponse.json({ success: true, buses });
  } catch (error) {
    console.error('❌ Error fetching buses:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}