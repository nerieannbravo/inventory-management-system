import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateId(
  model: 'category' | 'unitMeasure' | 'inventoryItem' | 'batch' | 'employeeRequest' | 'bus' | 'busOtherFiles' | 'busFile' | 'busDisposal' | 'stockDisposal' | 'stockTransaction' | 'supplier' | 'purchaseRequest' | 'budgetRequest' | 'purchaseOrder' | 'deliveryReceipt' | 'disposal' | 'approval',
  prefix: string,
  idField?: string
): Promise<string> {
  let lastEntry: { [key: string]: any } | null = null;

  switch (model) {
    case 'category':
      lastEntry = await prisma.category.findFirst({
        orderBy: { categoryId: 'desc' },
        select: { categoryId: true }
      });
      idField = 'categoryId';
      break;

    case 'unitMeasure':
      lastEntry = await prisma.unitMeasure.findFirst({
        orderBy: { unitId: 'desc' },
        select: { unitId: true }
      });
      idField = 'unitId';
      break;

    case 'inventoryItem':
      lastEntry = await prisma.inventoryItem.findFirst({
        orderBy: { itemId: 'desc' },
        select: { itemId: true }
      });
      idField = 'itemId';
      break;

    case 'batch':
      lastEntry = await prisma.batch.findFirst({
        orderBy: { batchId: 'desc' },
        select: { batchId: true }
      });
      idField = 'batchId';
      break;

    case 'employeeRequest':
      lastEntry = await prisma.employeeRequest.findFirst({
        orderBy: { requestId: 'desc' },
        select: { requestId: true }
      });
      idField = 'requestId';
      break;

    case 'stockTransaction':
      lastEntry = await prisma.stockTransaction.findFirst({
        orderBy: { transactionId: 'desc' },
        select: { transactionId: true }
      });
      idField = 'transactionId';
      break;

    case 'supplier':
      lastEntry = await prisma.supplier.findFirst({
        orderBy: { supplierId: 'desc' },
        select: { supplierId: true }
      });
      idField = 'supplierId';
      break;

    case 'bus':
      lastEntry = await prisma.bus.findFirst({
        orderBy: { busId: 'desc' },
        select: { busId: true }
      });
      idField = 'busId';
      break;

    case 'busOtherFiles':
    case 'busFile':
      // Schema model is BusFile (mapped to bus_files). Use fileId as identifier
      lastEntry = await prisma.busFile.findFirst({
        orderBy: { fileId: 'desc' },
        select: { fileId: true },
      });
      idField = 'fileId';
      break;

    case 'purchaseRequest':
      lastEntry = await prisma.purchaseRequest.findFirst({
        orderBy: { prId: 'desc' },
        select: { prId: true }
      });
      idField = 'prId';
      break;

    case 'budgetRequest':
      lastEntry = await prisma.budgetRequest.findFirst({
        orderBy: { brId: 'desc' },
        select: { brId: true }
      });
      idField = 'brId';
      break;

    case 'purchaseOrder':
      lastEntry = await prisma.purchaseOrder.findFirst({
        orderBy: { poId: 'desc' },
        select: { poId: true }
      });
      idField = 'poId';
      break;

    case 'deliveryReceipt':
      lastEntry = await prisma.deliveryReceipt.findFirst({
        orderBy: { drId: 'desc' },
        select: { drId: true }
      });
      idField = 'drId';
      break;

    case 'busDisposal':
    case 'stockDisposal':
    case 'disposal':
      // DisposalRecord is used for both bus and stock disposals in current schema
      lastEntry = await prisma.disposalRecord.findFirst({
        orderBy: { disposalId: 'desc' },
        select: { disposalId: true },
      });
      idField = 'disposalId';
      break;

    case 'approval':
      lastEntry = await prisma.approval.findFirst({
        orderBy: { approvalId: 'desc' },
        select: { approvalId: true }
      });
      idField = 'approvalId';
      break;
  }

  const lastId = lastEntry ? lastEntry[idField!] : null;
  const lastNumber = lastId ? parseInt(String(lastId).split('-')[1], 10) : 0;
  const nextNumber = lastNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(5, '0')}`;
}
