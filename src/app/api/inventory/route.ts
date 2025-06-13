import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const whereClause: any = {
            isdeleted: false
        };

        if (type === 'fuel') {
            whereClause.item_name = {
                contains: 'fuel',
                mode: 'insensitive'
            };
        }

        const items = await prisma.inventoryItem.findMany({
            where: whereClause,
            include: {
                category: true
            }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 