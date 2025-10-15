import { NextResponse } from 'next/server';
import { PrismaClient, RequestType, RequestStatus } from '@prisma/client';
import { AdvancedFuelForecasting } from '@/utils/advancedForecasting';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);      
        const forecastPeriods = parseInt(searchParams.get('periods') || '3');
        const method = searchParams.get('method') || 'ml-ensemble';

        // Get all fuel items
        const fuelItems = await prisma.inventoryItem.findMany({
            where: {
                itemName: { contains: 'fuel', mode: 'insensitive' },
                isDeleted: false
            },
            select: { id: true, itemId: true }
        });

        if (fuelItems.length === 0) {
            return NextResponse.json({ error: 'No fuel items found' }, { status: 400 });
        }

    const fuelItemIds = fuelItems.map(item => item.id);

        // Get historical consumption data for all fuel items
        const consumptionData = await prisma.employeeRequest.findMany({
            where: {
                itemId: { in: fuelItemIds },
                requestType: RequestType.CONSUME,
                isDeleted: false,
            },
            orderBy: { createdAt: 'asc' },
            select: {
                quantity: true,
                createdAt: true,
                itemId: true,
                item: { select: { itemName: true } }
            }
        });

        if (consumptionData.length < 2) {
            return NextResponse.json({ 
                error: 'Insufficient data for forecasting',
                data: [] 
            }, { status: 200 });
        }

        // Process historical data by month
        const monthlyData = consumptionData.reduce((acc: any, curr) => {
            const date = new Date(curr.createdAt);
            const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    month: monthKey,
                    consumption: 0,
                    date: date
                };
            }
            // Data is already in gallons, just add it
            acc[monthKey].consumption += curr.quantity;
            return acc;
        }, {});

        // Convert to array and sort by date
        const processedData = Object.values(monthlyData)
            .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
            .map((item: any) => ({
                month: item.month,
                consumption: Number(item.consumption.toFixed(2)),
                predicted: null,
                confidence: null,
                isActual: true,
                isForecast: false
            }));

        // Get quantities for forecasting
        const quantities = processedData.map((d: any) => d.consumption);
        
        // Get forecast based on selected method
        let forecast;
        switch (method) {
            case 'arima':
                forecast = AdvancedFuelForecasting.arimaForecast(quantities, forecastPeriods);
                break;
            case 'neural-network':
                forecast = AdvancedFuelForecasting.neuralNetworkForecast(quantities, forecastPeriods);
                break;
            default:
                forecast = AdvancedFuelForecasting.mlEnsembleForecast(quantities, forecastPeriods);
        }

        // Add forecast data
        const currentDate = new Date();
        const forecastData = forecast.values.map((value: number, index: number) => {
            const forecastDate = new Date(currentDate);
            forecastDate.setMonth(currentDate.getMonth() + index + 1);
            return {
                month: forecastDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                consumption: null,
                predicted: Number(value.toFixed(2)),
                confidence: forecast.confidence[index],
                isActual: false,
                isForecast: true
            };
        });

        // Calculate total consumption for debugging
        const totalConsumption = consumptionData.reduce((sum, curr) => sum + curr.quantity, 0);
        console.log('Total fuel consumption:', totalConsumption, 'gallons');

        return NextResponse.json({
            historical: processedData,
            forecast: {
                ...forecast,
                data: forecastData
            },
            debug: {
                totalConsumption,
                itemsCount: fuelItems.length,
                consumptionRecords: consumptionData.length
            }
        });

    } catch (error) {
        console.error('Error in fuel consumption forecast:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { item_id, quantity, created_by } = body;

        if (!item_id || !quantity || !created_by) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify if item exists and is a fuel item
        const item = await prisma.inventoryItem.findFirst({
            where: { itemId: item_id, isDeleted: false, itemName: { contains: 'fuel', mode: 'insensitive' } },
            include: { batches: { where: { isDeleted: false, usableQuantity: { gt: 0 } }, orderBy: { expirationDate: 'asc' } } }
        });

        if (!item) {
            return NextResponse.json({ error: 'Invalid fuel item' }, { status: 400 });
        }

        // Check if there's enough quantity available
    const totalAvailableQuantity = item.batches.reduce((sum: number, batch) => sum + batch.usableQuantity, 0);
        if (totalAvailableQuantity < quantity) {
            return NextResponse.json({ 
                error: 'Insufficient fuel quantity available',
                available: totalAvailableQuantity 
            }, { status: 400 });
        }

        // Create employee request
        const employeeRequest = await prisma.employeeRequest.create({
            data: {
                requestId: `REQ${Date.now()}`,
                itemId: item_id,
                empNumber: created_by,
                quantity: parseInt(quantity.toString()),
                requestType: RequestType.CONSUME,
                purpose: 'Fuel consumption request',
                status: RequestStatus.CONSUMED,
                isDeleted: false
            }
        });

        // Update batch quantities
        let remainingQuantity = quantity;
        for (const batch of item.batches) {
            if (remainingQuantity <= 0) break;

            const quantityToDeduct = Math.min(batch.usableQuantity, remainingQuantity);
            await prisma.batch.update({ where: { batchId: batch.batchId }, data: { usableQuantity: batch.usableQuantity - quantityToDeduct } });
            remainingQuantity -= quantityToDeduct;
        }

        return NextResponse.json(employeeRequest);
    } catch (error) {
        console.error('Error processing fuel request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 