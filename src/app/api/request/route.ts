import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';
import { fetchEmployees } from '../../lib/fetchEmployees';
import { calculateAndUpdateStatus } from "../../lib/itemStatus";

export async function GET() {
  try {
    // Fetch all employees
    const employees = await fetchEmployees();
    if (!employees || employees.length === 0) {
      return NextResponse.json({ success: false, message: 'No employees found' }, { status: 404 });
    }

    // Fetch all categories except 'Bus'
    const requests = await prisma.employeeRequest.findMany({
      where: { isDeleted: false },
      select: {
        requestId: true,
        itemId: true,
        item: { select: { itemId: true, itemName: true } },
        empNumber: true,
        requestType: true,
        quantity: true,
        purpose: true,
        status: true,
        expectedReturnDate: true,
        actualReturnDate: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
    });

    // Attach employee data from new employee structure
    const requestWithEmployee = requests.map((req: any) => {
      const employee = employees.find((emp: any) => emp.employeeNumber === req.empNumber);
      return {
        ...req,
        firstName: employee?.firstName || '',
        lastName: employee?.lastName || '',
        empName: employee ? `${employee.firstName} ${employee.lastName}`.trim() : 'Juan Dela Cruz',
        employee: employee
          ? {
              employeeNumber: employee.employeeNumber,
              firstName: employee.firstName,
              middleName: employee.middleName,
              lastName: employee.lastName,
              phone: employee.phone,
              position: employee.position,
              departmentId: employee.departmentId,
              department: employee.department,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true,request: requestWithEmployee });
  } catch (error: any) {
    console.error('Error fetching employee request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
  const { requests } = await req.json();
    const results = [];

    for (let i = 0; i < requests.length; i++){
        const request = requests[i];
            if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
        }
        const requestId = await generateId('employeeRequest', 'REQ');

        // Resolve inventory item numeric id from provided external id or name
        let inventoryItem = null;
        if (request.itemId) {
          inventoryItem = await prisma.inventoryItem.findFirst({ where: { itemId: request.itemId } });
        }
        if (!inventoryItem && request.itemName) {
          inventoryItem = await prisma.inventoryItem.findFirst({ where: { itemName: request.itemName } });
        }
        if (!inventoryItem) {
          results.push({ success: false, action: 'item_not_found', request: request });
          continue;
        }

        const newRequest = await prisma.employeeRequest.create({
          data: {
            requestId,
            itemId: inventoryItem.id,
            empNumber: request.empNumber || request.empName,
            requestType: request.type as any,
            quantity: Number(request.reqQuantity),
            purpose: request.purpose,
            status: request.reqStatus as any,
            expectedReturnDate: request.expectedDate ? new Date(request.expectedDate) : null,
            isDeleted: false,
          },
        });

      // FIFO batch deduction logic
        let remainingQty = request.reqQuantity;
        const batches = await prisma.batch.findMany({
          where: { itemId: inventoryItem.id, isDeleted: false, usableQuantity: { gt: 0 } },
          orderBy: { expirationDate: 'asc' },
        });

        for (const batch of batches) {
          if (remainingQty <= 0) break;
          const deductQty = Math.min(batch.usableQuantity, remainingQty);
          await prisma.batch.update({ where: { batchId: batch.batchId }, data: { usableQuantity: batch.usableQuantity - deductQty } });
          // call status calc with external itemId
          await calculateAndUpdateStatus(inventoryItem.itemId);
          remainingQty -= deductQty;
        }

        if (remainingQty > 0) {
        // Optionally: handle insufficient stock (rollback, error, etc.)
        results.push({ success: false, action: 'insufficient_stock', request: request.itemName });
        continue;
        }
      results.push({ success: true, action: 'created', request: newRequest });
    } 

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { requestId, status, actualReturnDate } = await request.json();

    if (!requestId || requestId === 'undefined') {
      return NextResponse.json({ success: false, error: 'Missing or invalid requestId' }, { status: 400 });
    }

    // Fetch the original request to get previous status, itemId, and quantity
    const originalRequest = await prisma.employeeRequest.findUnique({ where: { requestId: String(requestId) }, select: { status: true, itemId: true, quantity: true } });

    if (!originalRequest) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

  // If status is 'RETURNED' and actualReturnDate is not provided, set it to now
  let updatedActualReturnDate = actualReturnDate;
    if (status === 'RETURNED') {
      updatedActualReturnDate = new Date();
    }

    // If marking as RETURNED and it was not previously RETURNED, add back the quantity to the batch
    if (status === "RETURNED" && originalRequest.status !== "RETURNED") {
      let remainingQty = originalRequest.quantity;
      // Find all batches for the item (LIFO: latest expiration first)
      const batches = await prisma.batch.findMany({ where: { itemId: originalRequest.itemId, isDeleted: false }, orderBy: { expirationDate: 'desc' } });
      for (const batch of batches) {
        if (remainingQty <= 0) break;
        await prisma.batch.update({ where: { batchId: batch.batchId }, data: { usableQuantity: batch.usableQuantity + remainingQty } });
        // Recalculate using external itemId string
        const inv = await prisma.inventoryItem.findUnique({ where: { id: originalRequest.itemId } });
        if (inv) await calculateAndUpdateStatus(inv.itemId);
        // All returned to the first batch (LIFO), so break after one update
        break;
      }
    }

    const updated = await prisma.employeeRequest.update({ where: { requestId: String(requestId) }, data: { status: status as any, actualReturnDate: updatedActualReturnDate ? new Date(updatedActualReturnDate) : null } });
    return NextResponse.json({ 
      success: true, 
      request: updated,
      message: 'Item request updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH (req: NextRequest) {

    if (req.method === 'PATCH') {
        try {
            const { requestId } = await req.json();
          // Soft-delete 
          await prisma.employeeRequest.update({ where: { requestId: String(requestId) }, data: { isDeleted: true } });
          return NextResponse.json({ success: true });
      } catch (error) {
          console.error("Delete error:", error);
          return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
      }
  }
}