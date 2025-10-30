import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { generateId } from '@/app/lib/idGenerator';
import type { Prisma } from '@prisma/client';

export async function GET() {
        try {
            const suppliers = await prisma.supplier.findMany({
                where: { isdeleted: false },
                select: {
                    id: true,
                    supplier_id: true,
                    supplier_name: true,
                    contact_number: true,
                    email: true,
                    street: true,
                    barangay: true,
                    city: true,
                    province: true,
                    status: true,
                    remarks: true,
                    date_created: true,
                    date_updated: true,
                    isdeleted: true,
                    _count: { select: { items: true } },
                },
                orderBy: { supplier_name: 'asc' },
            });

        // Map _count to a friendly itemCount field and strip nested _count
        const mapped = suppliers.map((s) => {
            const plain = JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
            const maybeCount = plain['_count'] as unknown;
            let itemCount = 0;
            if (maybeCount && typeof maybeCount === 'object') {
                itemCount = (maybeCount as { items?: number }).items ?? 0;
            }
            delete (plain as Record<string, unknown>)['_count'];
            return { ...plain, itemCount };
        });

        return NextResponse.json({ success: true, suppliers: mapped });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Error fetching suppliers:', message);
            return NextResponse.json({ success: false, error: message }, { status: 500 });
        }
}

// POST /api/suppliers
// Body (JSON): { supplier_name, contact_number, email?, street?, barangay?, city?, province?, status?, remarks? }
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        const required = ['supplier_name', 'contact_number'];
        for (const key of required) {
            if (!body[key]) {
                return NextResponse.json({ error: `${key} is required` }, { status: 400 });
            }
        }

        // Validate contact number format (11 digits expected)
        if (!/^\d{11}$/.test(String(body.contact_number))) {
            return NextResponse.json({ error: 'Invalid contact_number format. Expected 11 digits.' }, { status: 400 });
        }

    // Generate supplier_id using central id generator
    const newSupplierId = await generateId('supplier', 'SUP');

        const createData: Prisma.SupplierCreateInput = {
            supplier_id: newSupplierId,
            supplier_name: String(body.supplier_name),
            contact_number: String(body.contact_number),
            email: body.email ?? undefined,
            street: body.street ?? undefined,
            barangay: body.barangay ?? undefined,
            city: body.city ?? undefined,
            province: body.province ?? undefined,
            status: body.status ?? undefined,
            remarks: body.remarks ?? undefined,
        };

        const created = await prisma.supplier.create({ data: createData });

        return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
        console.error('POST /api/suppliers error', err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}