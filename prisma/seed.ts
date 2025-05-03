import { PrismaClient, RequestStatus, TransactionType, RequestType, ItemStatus, ItemCategory, BusStatus, BusType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Receipts
  await prisma.receipt.createMany({
    data: Array.from({ length: 3 }, (_, i) => ({
      receipt_title: `Receipt ${i + 1}`,
      date_generate: new Date(),
    })),
  });

  // Create Buses
  const buses = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.bus.create({
        data: {
          plate_number: `ABC-${100 + i}`,
          body_builder: 'Agila',
          manufacturer: 'Isuzu',
          fuel_type: 'diesel',
          status: BusStatus.Active,
          bus_type: BusType.Airconditioned,
          model: `Model-${i}`,
          seat_capacity: 45 + i,
          purchased_date: new Date(),
          last_inspection_date: new Date(),
          purchased_price: 4000000 + i * 50000,
          current_condition: 'Good',
        },
      })
    )
  );

  // Create Items
  const items = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.item.create({
        data: {
          item_name: `Item ${i + 1}`,
          item_number: `ITM-${1000 + i}`,
          category: ItemCategory.Tool,
          description: `Description for Item ${i + 1}`,
          unit_measure: 'pcs',
          unit_cost: 100 + i * 10,
          reorder_level: 5,
          current_stock: 20,
          usable_quantity: 15,
          defective_quantity: 2,
          missing_quantity: 3,
          status: ItemStatus.Available,
          date_update: new Date(),
          bus_id: buses[i % buses.length].bus_id,
          receipt_id: (i % 3) + 1,
        },
      })
    )
  );

  // Create Purchase Requests
  const purchaseRequests = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.purchaseRequest.create({
        data: {
          request_item: `Requested Item ${i + 1}`,
          unit_measure: 'pcs',
          quantity: 10 + i,
          request_date: new Date(),
          status: RequestStatus.Pending,
        },
      })
    )
  );

  // Map Items to Purchase Requests
  await Promise.all(
    items.map((item, i) =>
      prisma.purchaseRequestItem.create({
        data: {
          item_id: item.item_id,
          purchase_request_id: purchaseRequests[i % purchaseRequests.length].purchase_request_id,
        },
      })
    )
  );

  // Create Employee Requests
  const employeeRequests = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.employeeRequestItem.create({
        data: {
          employee_name: `Employee ${i + 1}`,
          request_purpose: `Purpose ${i + 1}`,
          request_type: i % 2 === 0 ? RequestType.Borrow : RequestType.Consume,
          quantity: 5 + i,
          request_date: new Date(),
          expected_return_date: i % 2 === 0 ? new Date(Date.now() + 7 * 86400000) : null,
          actual_return_date: null,
          status: i % 2 === 0 ? 'Not Refunded' : 'Consumed',
        },
      })
    )
  );

  // Map Items to Employee Requests
  await Promise.all(
    items.map((item, i) =>
      prisma.employeeRequestItemMap.create({
        data: {
          item_id: item.item_id,
          request_id: employeeRequests[i % employeeRequests.length].request_id,
        },
      })
    )
  );

  // Inventory Transactions
  await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.inventoryTransaction.create({
        data: {
          transaction_date: new Date(),
          transaction_type: TransactionType.Received,
          reference_id: purchaseRequests[i % purchaseRequests.length].purchase_request_id,
          purchase_request_id: purchaseRequests[i % purchaseRequests.length].purchase_request_id,
          item_id: items[i % items.length].item_id,
          request_id: employeeRequests[i % employeeRequests.length].request_id,
        },
      })
    )
  );
}

main()
  .then(() => console.log('🌱 Seed data inserted successfully.'))
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
