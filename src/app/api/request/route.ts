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
    const request = await prisma.employeeRequest.findMany({
      where: {
        isdeleted: false
      },
      select: {
        request_id: true,
        item_id: true,
        inventoryItem: {
          select: { item_id: true, item_name: true }
        },
        emp_id: true,
        request_type: true,
        quantity: true,
        req_purpose: true,
        status: true,
        expected_return_date: true,
        actual_return_date: true,
        date_created: true,
        date_updated: true,
        isdeleted: true,
        created_by: true,
      }
    });

    // Attach employee data from new employee structure
    const requestWithEmployee = request.map((req: any) => {
      const employee = employees.find((emp: any) => emp.employeeNumber === req.emp_id);
      return {
        ...req,
        firstName: employee?.firstName || '',
        lastName: employee?.lastName || '',
        empName: employee ? `${employee.firstName} ${employee.lastName}`.trim() : 'Juan Dela Cruz',
        employee: employee ? {
          employeeNumber: employee.employeeNumber,
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
          phone: employee.phone,
          position: employee.position,
          departmentId: employee.departmentId,
          department: employee.department
        } : null
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
        const request_id = await generateId('employeeRequest', 'REQ');
        const newRequest = await prisma.employeeRequest.create({
        data: {
          request_id,
          item_id: request.itemName,
          emp_id: request.empName,
          request_type: request.type,
          quantity: request.reqQuantity,
          req_purpose: request.purpose,
          status: request.reqStatus,
          expected_return_date: request.expectedDate ? new Date(request.expectedDate) : null,
          isdeleted: false,
          created_by: 1, // set as needed
        },
      });

      // FIFO batch deduction logic
        let remainingQty = request.reqQuantity;
        const batches = await prisma.batch.findMany({
        where: {
            item_id: request.itemName,
            isdeleted: false,
            usable_quantity: { gt: 0 },
        },
        orderBy: { expiration_date: 'asc' },
        });

        for (const batch of batches) {
        if (remainingQty <= 0) break;
        const deductQty = Math.min(batch.usable_quantity, remainingQty);
        await prisma.batch.update({
            where: { batch_id: batch.batch_id },
            data: { usable_quantity: batch.usable_quantity - deductQty },
        });
        await calculateAndUpdateStatus(batch.item_id);
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
    const { request_id, status, actual_return_date } = await request.json();

    if (!request_id || request_id === "undefined") {
      return NextResponse.json({ success: false, error: "Missing or invalid request_id" }, { status: 400 });
    }

    // If status is 'returned' and actual_return_date is not provided, set it to now
    let updatedActualReturnDate = actual_return_date;
    if (status === "RETURNED") {
      updatedActualReturnDate = new Date();
    }

    const updated = await prisma.employeeRequest.update({
      where: { request_id: String(request_id) },
      data: {
        status: status,
        actual_return_date: updatedActualReturnDate ? new Date(updatedActualReturnDate) : null,
        date_updated: new Date(),
      },
    });
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
            const { request_id } = await req.json();
          // Soft-delete 
          await prisma.employeeRequest.update({
              where: { request_id: String(request_id) },
              data: { isdeleted: true },
          });
          return NextResponse.json({ success: true });
      } catch (error) {
          console.error("Delete error:", error);
          return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
      }
  }
}