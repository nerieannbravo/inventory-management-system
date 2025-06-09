import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../lib/prisma';
import { generateId } from '../../lib/idGenerator';
import { calculateAndUpdateStatus } from "../../lib/itemStatus";

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


// try {
//     const { requests } = await request.json();
//     const results = [];

//     for (let i = 0; i < requests.length; i++){
//         const request = requests[i];

//         const newRequest = await prisma.employeeRequest.create({
//         data: {
//           request_id: request_id,
//           item_id: request.itemName,
//           emp_id: request.empName,
//           request_type: request.type,
//           quantity: request.reqQuantity,
//           req_purpose: request.purpose,
//           status: request.reqStatus,
//           expected_return_date: request.expectedDate ? new Date(request.expectedDate) : null,
//           isdeleted: false,
//           created_by: 1, // set as needed
//         },
//       });
//       results.push({ success: true, action: 'created', item: newRequest });
//     } 
//     return NextResponse.json({ success: true, results });

// } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
