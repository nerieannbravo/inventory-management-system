import { prisma } from '@/app/lib/prisma';

export async function calculateAndUpdateStatus(itemId: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { itemId },
    include: {
      category: true,
      batches: { where: { isDeleted: false } }
    }
  });
  if (!item) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current_stock = item.batches.reduce((sum, batch) => sum + batch.usableQuantity, 0);
  const hasExpiredBatch = item.batches.some(batch => {
    if (!batch.expirationDate) return false;
    const expirationDate = new Date(batch.expirationDate as Date);
    expirationDate.setHours(0, 0, 0, 0);
    return expirationDate <= today;
  });

  // Calculate stockStatus (stock-level tracking)
  let stockStatus: 'EXPIRED' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'AVAILABLE' | 'UNDER_MAINTENANCE' | 'IN_USE' | string;
  if (hasExpiredBatch) {
    stockStatus = 'EXPIRED';
  } else if (item.category.categoryName === "Consumable" && current_stock === 0) {
    stockStatus = 'OUT_OF_STOCK';
  } else if (item.category.categoryName === "Consumable" && current_stock <= item.reorderLevel) {
    stockStatus = 'LOW_STOCK';
  } else if (["Machine", "Tool", "Equipment"].includes(item.category.categoryName) && current_stock === 0) {
    stockStatus = 'IN_USE';
  } else {
    stockStatus = "AVAILABLE" as typeof stockStatus;
  }

  await prisma.inventoryItem.update({
    where: { itemId },
    data: { stockStatus: stockStatus as any }
  });
}