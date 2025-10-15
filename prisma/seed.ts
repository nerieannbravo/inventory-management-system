import {
  PrismaClient,
  BodyBuilder,
  BusType,
  BusStatus,
  BusCondition,
  AcquisitionMethod,
  RegistrationStatus,
  BusSource,
  InventoryStatus,
  StockTransactionType,
  RequestType,
  RequestStatus,
  PurchaseRequestStatus,
  BudgetRequestStatus,
  PurchaseOrderStatus,
  InspectionStatus,
  DisposalType,
  DisposalMethod,
  DisposalStatus,
  ApprovalEntity,
  ApprovalAction,
  PriorityLevel,
  SupplierStatus
} from '@prisma/client';
import { generateId } from '../src/app/lib/idGenerator';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Clearing existing data (preserves referential order)...');
    
    // Delete in safe order respecting relations
    await prisma.approval.deleteMany();
    await prisma.refundRequest.deleteMany();
    await prisma.deliveryReceipt.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.budgetRequest.deleteMany();
    await prisma.purchaseItem.deleteMany();
    await prisma.purchaseRequest.deleteMany();
    await prisma.disposalRecord.deleteMany();
    await prisma.busFile.deleteMany();
    await prisma.secondHandDetails.deleteMany();
    await prisma.brandNewDetails.deleteMany();
    await prisma.bus.deleteMany();
    await prisma.employeeRequest.deleteMany();
    await prisma.stockTransaction.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.supplierItem.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.unitMeasure.deleteMany();
    await prisma.employeeReference.deleteMany();

    // ========================================================================
    // 1. SEED EMPLOYEE REFERENCES (1000 records)
    // ========================================================================
    console.log('👥 Seeding 1000 employee references...');
    const employees: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const created = await prisma.employeeReference.create({
        data: {
          employeeNumber: `EMP-${String(i).padStart(4, '0')}`,
          firstName: `FirstName${i}`,
          middleName: i % 2 === 0 ? `MiddleName${i}` : null,
          lastName: `LastName${i}`,
          phone: `0917${String(1000000 + i).slice(1)}`,
          position: i % 3 === 0 ? 'Manager' : i % 2 === 0 ? 'Supervisor' : 'Staff',
          departmentId: (i % 5) + 1,
          departmentName: `Department ${(i % 5) + 1}`,
          isActive: true,
        },
      });
      employees.push(created);
    }

    // ========================================================================
    // 2. SEED CATEGORIES (1000 records)
    // ========================================================================
    console.log('📦 Seeding 1000 categories...');
    const categories: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const categoryId = await generateId('category', 'CAT');
      const created = await prisma.category.create({
        data: {
          categoryId,
          categoryName: `Category ${i}`,
          description: `Description for category ${i}`,
        },
      });
      categories.push(created);
    }

    // ========================================================================
    // 3. SEED UNIT MEASURES (Common units)
    // ========================================================================
    console.log('📏 Seeding unit measures...');
    const unitMeasuresData = [
      { unitName: 'Pieces', abbreviation: 'pcs', description: 'Individual countable items' },
      { unitName: 'Liters', abbreviation: 'L', description: 'Liquid volume measurement' },
      { unitName: 'Kilograms', abbreviation: 'kg', description: 'Weight measurement' },
      { unitName: 'Grams', abbreviation: 'g', description: 'Weight measurement (small)' },
      { unitName: 'Meters', abbreviation: 'm', description: 'Length measurement' },
      { unitName: 'Centimeters', abbreviation: 'cm', description: 'Length measurement (small)' },
      { unitName: 'Gallons', abbreviation: 'gal', description: 'Liquid volume measurement (large)' },
      { unitName: 'Boxes', abbreviation: 'box', description: 'Packaged units' },
      { unitName: 'Cartons', abbreviation: 'ctn', description: 'Bulk packaging' },
      { unitName: 'Sets', abbreviation: 'set', description: 'Grouped items' },
      { unitName: 'Rolls', abbreviation: 'roll', description: 'Rolled materials' },
      { unitName: 'Bags', abbreviation: 'bag', description: 'Bagged items' },
      { unitName: 'Bottles', abbreviation: 'btl', description: 'Bottled liquids' },
      { unitName: 'Cans', abbreviation: 'can', description: 'Canned items' },
      { unitName: 'Pairs', abbreviation: 'pr', description: 'Matched items' },
    ];
    
    const unitMeasures: any[] = [];
    for (const unitData of unitMeasuresData) {
      const unitId = await generateId('unitMeasure', 'UNIT');
      const created = await prisma.unitMeasure.create({
        data: {
          unitId,
          ...unitData,
        },
      });
      unitMeasures.push(created);
    }

    // ========================================================================
    // 4. SEED INVENTORY ITEMS (1000 records)
    // ========================================================================
    console.log('🧾 Seeding 1000 inventory items...');
    const items: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const itemId = await generateId('inventoryItem', 'ITEM');
      const category = categories[(i - 1) % categories.length];
      const unitMeasure = unitMeasures[(i - 1) % unitMeasures.length];
      const created = await prisma.inventoryItem.create({
        data: {
          itemId,
          categoryId: category.id,
          itemName: `Inventory Item ${i}`,
          description: `Description for item ${i}`,
          unitMeasureId: unitMeasure.id,
          currentStock: 50 + i * 10,
          reorderLevel: 10 + i,
          status: InventoryStatus.AVAILABLE,
        },
      });
      items.push(created);
    }

    // ========================================================================
    // 4. SEED BATCHES (1000 records)
    // ========================================================================
    console.log('📊 Seeding 1000 batches...');
    const batches: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const batchId = await generateId('batch', 'BAT');
      const item = items[(i - 1) % items.length];
      const created = await prisma.batch.create({
        data: {
          batchId,
          itemId: item.id,
          usableQuantity: 40 + i * 5,
          defectiveQuantity: i % 3,
          missingQuantity: i % 4,
          remarks: `Batch remarks ${i}`,
          expirationDate: i % 2 === 0 ? new Date('2026-12-31') : null,
        },
      });
      batches.push(created);
    }

    // ========================================================================
    // 5. SEED STOCK TRANSACTIONS (1000 records)
    // ========================================================================
    console.log('📈 Seeding 1000 stock transactions...');
    for (let i = 1; i <= 1000; i++) {
      const transactionId = await generateId('stockTransaction', 'STK');
      const item = items[(i - 1) % items.length];
      const batch = batches[(i - 1) % batches.length];
      const employee = employees[(i - 1) % employees.length];
      
      await prisma.stockTransaction.create({
        data: {
          transactionId,
          itemId: item.id,
          batchId: batch.id,
          transactionType: i % 3 === 0 ? StockTransactionType.STOCK_IN : 
                          i % 2 === 0 ? StockTransactionType.STOCK_OUT : 
                          StockTransactionType.ADJUSTMENT,
          quantity: 5 + i,
          referenceType: 'PurchaseOrder',
          referenceId: `PO-${String(i).padStart(3, '0')}`,
          remarks: `Transaction remarks ${i}`,
          handledByEmpNumber: employee.employeeNumber,
        },
      });
    }

    // ========================================================================
    // 6. SEED EMPLOYEE REQUESTS (1000 records)
    // ========================================================================
    console.log('📝 Seeding 1000 employee requests...');
    for (let i = 1; i <= 1000; i++) {
      const requestId = await generateId('employeeRequest', 'REQ');
      const item = items[(i - 1) % items.length];
      const employee = employees[(i - 1) % employees.length];
      
      await prisma.employeeRequest.create({
        data: {
          requestId,
          itemId: item.id,
          empNumber: employee.employeeNumber,
          requestType: i % 2 === 0 ? RequestType.BORROW : RequestType.CONSUME,
          quantity: 2 + i,
          purpose: `Purpose for request ${i}`,
          status: i % 3 === 0 ? RequestStatus.APPROVED : 
                  i % 2 === 0 ? RequestStatus.PENDING : RequestStatus.REJECTED,
          expectedReturnDate: i % 2 === 0 ? new Date('2025-12-31') : null,
        },
      });
    }

    // ========================================================================
    // 7. SEED SUPPLIERS (1000 records)
    // ========================================================================
    console.log('🏷️ Seeding 1000 suppliers...');
    const suppliers: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const supplierId = await generateId('supplier', 'SUP');
      const statuses: SupplierStatus[] = [
        SupplierStatus.ACTIVE,
        SupplierStatus.INACTIVE,
        SupplierStatus.FLAGGED,
        SupplierStatus.BLOCKED,
      ];

      const created = await prisma.supplier.create({
        data: {
          supplierId,
          supplierName: `Supplier Company ${i}`,
          contactPerson: `Contact Person ${i}`,
          phone: `0917${String(1000000 + i).slice(1)}`,
          email: `supplier${i}@example.com`,
          street: `${i * 10} Main Street`,
          barangay: `Barangay ${i}`,
          city: `City ${i}`,
          province: `Province ${i}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          remarks: `Supplier remarks ${i}`,
        },
      });
      suppliers.push(created);
    }

    // ========================================================================
    // 8. SEED SUPPLIER ITEMS (1000 records)
    // ========================================================================
    console.log('🔗 Seeding 1000 supplier-item relations...');
    for (let i = 0; i < 1000; i++) {
      const supplier = suppliers[i % suppliers.length];
      const item = items[i % items.length];
      
      await prisma.supplierItem.create({
        data: {
          supplierId: supplier.id,
          itemId: item.id,
          unitPrice: 100 + i * 10,
          averageDeliveryTime: `${3 + (i % 5)} days`,
          notes: `Supplier item notes ${i + 1}`,
          isPreferred: i % 3 === 0,
        },
      });
    }

    // ========================================================================
    // 9. SEED BUSES (1000 records)
    // ========================================================================
    console.log('🚌 Seeding 1000 buses...');
    const buses: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const busId = await generateId('bus', 'BUS');
      const isSecondHand = i % 2 === 0;
      const itemLink = items[i % items.length];
      
      const created = await prisma.bus.create({
        data: {
          busId,
          itemId: itemLink.id,
          plateNumber: `ABC-${String(i * 100).padStart(4, '0')}`,
          bodyNumber: `BDY-${String(i).padStart(3, '0')}`,
          bodyBuilder: [BodyBuilder.AGILA, BodyBuilder.HILLTOP, BodyBuilder.RBM, BodyBuilder.DARJ][i % 4],
          busType: i % 2 === 0 ? BusType.ORDINARY : BusType.AIRCONDITIONED,
          manufacturer: i % 2 === 0 ? 'Daewoo' : 'Hyundai',
          status: BusStatus.ACTIVE,
          chasisNumber: `CHS-${String(i * 1000).padStart(6, '0')}`,
          engineNumber: `ENG-${String(i * 500).padStart(6, '0')}`,
          seatCapacity: 30 + i * 2,
          model: `Model ${2020 + i}`,
          yearModel: 2020 + (i % 5),
          route: `Route ${i}`,
          condition: isSecondHand ? BusCondition.SECOND_HAND : BusCondition.BRAND_NEW,
          acquisitionDate: new Date(`202${(i % 5)}-01-01`),
          acquisitionMethod: isSecondHand ? AcquisitionMethod.PURCHASED : AcquisitionMethod.PURCHASED,
          warrantyExpirationDate: isSecondHand ? null : new Date('2027-12-31'),
          registrationStatus: RegistrationStatus.REGISTERED,
          ...(isSecondHand
            ? {
                secondHandDetails: {
                  create: {
                    previousOwner: `Previous Owner ${i}`,
                    previousOwnerContact: `0917${i}000000`,
                    source: BusSource.DEALERSHIP,
                    odometerReading: 50000 + i * 10000,
                    conditionNotes: `Good condition, unit ${i}`,
                  },
                },
              }
            : {
                brandNewDetails: {
                  create: {
                    dealerName: `Dealer ${i}`,
                    dealerContact: `0917${i}111111`,
                    warrantyDetails: `Full warranty coverage for unit ${i}`,
                  },
                },
              }),
        },
      });
      buses.push(created);
    }

    // ========================================================================
    // 10. SEED BUS FILES (1000 records)
    // ========================================================================
    console.log('📄 Seeding 1000 bus files...');
    for (let i = 1; i <= 1000; i++) {
      const fileId = await generateId('busFile', 'BFL');
      const bus = buses[(i - 1) % buses.length];
      
      await prisma.busFile.create({
        data: {
          fileId,
          busId: bus.id,
          fileName: `bus_document_${i}.pdf`,
          fileType: 'PDF',
          fileUrl: `/uploads/bus_files/document_${i}.pdf`,
          description: `Bus document ${i}`,
        },
      });
    }

    // ========================================================================
    // 11. SEED PURCHASE REQUESTS (1000 records)
    // ========================================================================
    console.log('🛒 Seeding 1000 purchase requests...');
    const purchaseRequests: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const prId = await generateId('purchaseRequest', 'PR');
      const category = categories[(i - 1) % categories.length];
      const employee = employees[(i - 1) % employees.length];
      
      const created = await prisma.purchaseRequest.create({
        data: {
          prId,
          categoryId: category.id,
          estimatedAmount: 5000 + i * 1000,
          priority: [PriorityLevel.LOW, PriorityLevel.NORMAL, PriorityLevel.HIGH, PriorityLevel.URGENT][i % 4],
          justification: `Justification for PR ${i}`,
          status: PurchaseRequestStatus.POSTED,
          creatorEmpNumber: employee.employeeNumber,
        },
      });
      purchaseRequests.push(created);
    }

    // ========================================================================
    // 12. SEED PURCHASE ITEMS (1000 records)
    // ========================================================================
    console.log('📋 Seeding 1000 purchase items...');
    for (let i = 0; i < 1000; i++) {
      const pr = purchaseRequests[i];
      const item = items[i % items.length];
      
      await prisma.purchaseItem.create({
        data: {
          prId: pr.id,
          itemId: item.id,
          quantity: 5 + i,
          estimatedUnitPrice: 500 + i * 50,
          totalEstimated: (5 + i) * (500 + i * 50),
          remarks: `Purchase item remarks ${i + 1}`,
        },
      });
    }

    // ========================================================================
    // 13. SEED BUDGET REQUESTS (1000 records)
    // ========================================================================
    console.log('💰 Seeding 1000 budget requests...');
    const budgetRequests: any[] = [];
    for (let i = 0; i < 1000; i++) {
      const brId = await generateId('budgetRequest', 'BR');
      const pr = purchaseRequests[i];
      const employee = employees[i % employees.length];
      
      const created = await prisma.budgetRequest.create({
        data: {
          brId,
          prId: pr.id,
          requestedAmount: 5000 + i * 1000,
          approvedAmount: i % 2 === 0 ? 5000 + i * 1000 : null,
          status: i % 2 === 0 ? BudgetRequestStatus.APPROVED : BudgetRequestStatus.PENDING,
          remarks: `Budget request remarks ${i + 1}`,
          creatorEmpNumber: employee.employeeNumber,
        },
      });
      budgetRequests.push(created);
    }

    // ========================================================================
    // 14. SEED PURCHASE ORDERS (1000 records)
    // ========================================================================
    console.log('📦 Seeding 1000 purchase orders...');
    const purchaseOrders: any[] = [];
    for (let i = 0; i < 1000; i++) {
      const poId = await generateId('purchaseOrder', 'PO');
      const pr = purchaseRequests[i];
      const supplier = suppliers[i % suppliers.length];
      const employee = employees[i % employees.length];
      
      const created = await prisma.purchaseOrder.create({
        data: {
          poId,
          prId: pr.id,
          supplierId: supplier.id,
          totalAmount: 5000 + i * 1000,
          actualAmount: i % 2 === 0 ? 5000 + i * 1000 : null,
          status: PurchaseOrderStatus.PENDING,
          expectedDeliveryDate: new Date('2025-12-31'),
          remarks: `Purchase order remarks ${i + 1}`,
          creatorEmpNumber: employee.employeeNumber,
        },
      });
      purchaseOrders.push(created);
    }

    // ========================================================================
    // 15. SEED DELIVERY RECEIPTS (1000 records)
    // ========================================================================
    console.log('📬 Seeding 1000 delivery receipts...');
    for (let i = 0; i < 1000; i++) {
      const drId = await generateId('deliveryReceipt', 'DR');
      const po = purchaseOrders[i];
      const employee = employees[i % employees.length];
      
      await prisma.deliveryReceipt.create({
        data: {
          drId,
          poId: po.id,
          receivedQuantity: 5 + i,
          defectiveQuantity: i % 3,
          missingQuantity: i % 4,
          inspectionStatus: i % 2 === 0 ? InspectionStatus.PASSED : InspectionStatus.PENDING,
          inspectionFindings: `Inspection findings ${i + 1}`,
          invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
          invoiceAmount: 5000 + i * 1000,
          receiverEmpNumber: employee.employeeNumber,
        },
      });
    }

    // ========================================================================
    // 16. SEED DISPOSAL RECORDS (1000 records - 500 bus, 500 stock)
    // ========================================================================
    console.log('🗑️ Seeding 1000 disposal records...');
    const disposalRecords: any[] = [];
    for (let i = 1; i <= 1000; i++) {
      const disposalId = await generateId('disposal', 'DSP');
      const employee = employees[(i - 1) % employees.length];
      const isBusDisposal = i <= 500;
      
      const created = await prisma.disposalRecord.create({
        data: {
          disposalId,
          disposalType: isBusDisposal ? DisposalType.BUS : DisposalType.STOCK,
          busId: isBusDisposal ? buses[(i - 1) % buses.length].id : null,
          itemId: !isBusDisposal ? items[(i - 501) % items.length].id : null,
          batchId: !isBusDisposal ? batches[(i - 501) % batches.length].batchId : null,
          quantity: !isBusDisposal ? 5 + i : null,
          disposalDate: new Date('2025-01-01'),
          disposalMethod: [DisposalMethod.SOLD, DisposalMethod.SCRAPPED, DisposalMethod.DONATED][i % 3],
          reason: `Disposal reason ${i}`,
          estimatedValue: 10000 + i * 1000,
          status: DisposalStatus.PENDING,
          creatorEmpNumber: employee.employeeNumber,
        },
      });
      disposalRecords.push(created);
    }

    // ========================================================================
    // 17. SEED APPROVALS (1000 records)
    // ========================================================================
    console.log('✅ Seeding 1000 approvals...');
    for (let i = 0; i < 1000; i++) {
      const approvalId = await generateId('approval', 'APV');
      const employee = employees[i % employees.length];
      
      // Alternate between different approval types
      const entityTypes = [
        ApprovalEntity.PURCHASE_REQUEST,
        ApprovalEntity.BUDGET_REQUEST,
        ApprovalEntity.DISPOSAL,
      ];
      const entityType = entityTypes[i % 3];
      
      let entityData: any = { entityType };
      
      if (entityType === ApprovalEntity.PURCHASE_REQUEST) {
        entityData.prId = purchaseRequests[i % purchaseRequests.length].id;
      } else if (entityType === ApprovalEntity.BUDGET_REQUEST) {
        entityData.brId = budgetRequests[i % budgetRequests.length].id;
      } else if (entityType === ApprovalEntity.DISPOSAL) {
        entityData.disposalId = disposalRecords[i % disposalRecords.length].id;
      }
      
      await prisma.approval.create({
        data: {
          approvalId,
          ...entityData,
          entityId: i + 1,
          approverEmpNumber: employee.employeeNumber,
          action: [ApprovalAction.APPROVED, ApprovalAction.PENDING, ApprovalAction.REJECTED][i % 3],
          remarks: `Approval remarks ${i + 1}`,
        },
      });
    }

    console.log('✅ Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 1000 Employee References');
    console.log('   - 1000 Categories');
    console.log('   - 15 Unit Measures');
    console.log('   - 1000 Inventory Items');
    console.log('   - 1000 Batches');
    console.log('   - 1000 Stock Transactions');
    console.log('   - 1000 Employee Requests');
    console.log('   - 1000 Suppliers');
    console.log('   - 1000 Supplier Items');
    console.log('   - 1000 Buses (500 second-hand, 500 brand new)');
    console.log('   - 1000 Bus Files');
    console.log('   - 1000 Purchase Requests');
    console.log('   - 1000 Purchase Items');
    console.log('   - 1000 Budget Requests');
    console.log('   - 1000 Purchase Orders');
    console.log('   - 1000 Delivery Receipts');
    console.log('   - 1000 Disposal Records (500 bus, 500 stock)');
    console.log('   - 1000 Approvals');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();