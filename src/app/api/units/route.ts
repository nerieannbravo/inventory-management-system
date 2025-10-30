import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
		try {
			const units = await prisma.unitMeasure.findMany({
				where: { is_deleted: false },
			select: {
				id: true,
				unit_name: true,
				abbreviation: true,
				date_created: true,
				date_updated: true,
			},
			orderBy: { unit_name: 'asc' },
		});

		return NextResponse.json({ success: true, units });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error('Error fetching units:', message);
			return NextResponse.json({ success: false, error: message }, { status: 500 });
		}
}

