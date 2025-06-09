import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Adjust path as needed

export async function GET() {
    // Get all fuel items
    const fuelItems = await prisma.inventoryItem.findMany({
        where: { item_name: { contains: 'fuel', mode: 'insensitive' } },
        select: { item_id: true },
    });
    const fuelItemIds = fuelItems.map(item => item.item_id);

    // Get monthly consumption for this year
    const result = await prisma.$queryRaw<
        { month: string; month_num: number | bigint; consumption: number | bigint }[]
    >`
        SELECT 
            TO_CHAR("date_created", 'Mon') AS month,
            EXTRACT(MONTH FROM "date_created") AS month_num,
            SUM(quantity) AS consumption
        FROM "employee_requests"
        WHERE "item_id" = ANY(${fuelItemIds})
            AND "request_type" = 'CONSUME'
            AND "isdeleted" = false
            AND EXTRACT(YEAR FROM "date_created") = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY month, month_num
        ORDER BY month_num
    `;
    
    // Convert BigInt to Number for JSON serialization
    const safeResult = result.map((row) => ({
        ...row,
        consumption: typeof row.consumption === 'bigint' ? Number(row.consumption) : row.consumption,
        month_num: typeof row.month_num === 'bigint' ? Number(row.month_num) : row.month_num,
    }));

    return NextResponse.json(safeResult);

    
}