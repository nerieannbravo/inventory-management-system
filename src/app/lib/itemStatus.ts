import { prisma } from '@/app/lib/prisma';

export async function calculateAndUpdateStatus(item_id: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { item_id },
    include: {
      category: true,
      batches: { where: { isdeleted: false } }
    }
  });
  if (!item) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current_stock = item.batches.reduce((sum, batch) => sum + batch.usable_quantity, 0);
  const hasExpiredBatch = item.batches.some(batch => {
    if (!batch.expiration_date) return false;
    const expirationDate = new Date(batch.expiration_date);
    expirationDate.setHours(0, 0, 0, 0);
    return expirationDate <= today;
  });

  let status: 'EXPIRED' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'AVAILABLE' | 'UNDER_MAINTENANCE'| 'IN_USED';
  if (hasExpiredBatch) {
    status = 'EXPIRED';
  } else if (item.category.category_name === "Consumable" && current_stock === 0) {
    status = 'OUT_OF_STOCK';
  } else if (item.category.category_name === "Consumable" && current_stock <= item.reorder_level) {
    status = 'LOW_STOCK';
  } else if (["Machine", "Tool", "Equipment"].includes(item.category.category_name) && current_stock === 0) {
    status = 'IN_USED';
  } else {
    status = "AVAILABLE";
  }

  await prisma.inventoryItem.update({
    where: { item_id },
    data: { status }
  });
}