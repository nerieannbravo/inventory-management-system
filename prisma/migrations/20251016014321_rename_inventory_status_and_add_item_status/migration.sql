/*
  Warnings:

  - You are about to drop the column `status` on the `inventory_items` table. All the data in the column will be lost.

*/
-- CreateEnum for new stock status
CREATE TYPE "InventoryStockStatus" AS ENUM ('LOW_STOCK', 'AVAILABLE', 'NOT_AVAILABLE', 'OUT_OF_STOCK', 'UNDER_MAINTENANCE', 'EXPIRED', 'IN_USE', 'DISPOSED');

-- CreateEnum for item status
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable: Add new columns with defaults
ALTER TABLE "inventory_items" 
ADD COLUMN "itemStatus" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "stockStatus" "InventoryStockStatus" NOT NULL DEFAULT 'AVAILABLE';

-- Migrate existing status data to stockStatus
UPDATE "inventory_items" 
SET "stockStatus" = CASE 
  WHEN "status" = 'LOW_STOCK' THEN 'LOW_STOCK'::"InventoryStockStatus"
  WHEN "status" = 'AVAILABLE' THEN 'AVAILABLE'::"InventoryStockStatus"
  WHEN "status" = 'NOT_AVAILABLE' THEN 'NOT_AVAILABLE'::"InventoryStockStatus"
  WHEN "status" = 'OUT_OF_STOCK' THEN 'OUT_OF_STOCK'::"InventoryStockStatus"
  WHEN "status" = 'UNDER_MAINTENANCE' THEN 'UNDER_MAINTENANCE'::"InventoryStockStatus"
  WHEN "status" = 'EXPIRED' THEN 'EXPIRED'::"InventoryStockStatus"
  WHEN "status" = 'IN_USE' THEN 'IN_USE'::"InventoryStockStatus"
  WHEN "status" = 'DISPOSED' THEN 'DISPOSED'::"InventoryStockStatus"
  ELSE 'AVAILABLE'::"InventoryStockStatus"
END;

-- Now drop the old status column
ALTER TABLE "inventory_items" DROP COLUMN "status";

-- DropEnum (old InventoryStatus)
DROP TYPE "InventoryStatus";
