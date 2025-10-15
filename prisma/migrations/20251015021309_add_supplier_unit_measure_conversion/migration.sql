/*
  Warnings:

  - Added the required column `supplierUnitMeasureId` to the `supplier_items` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns as nullable first
ALTER TABLE "supplier_items" 
  ADD COLUMN "conversionFactor" DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN "supplierUnitMeasureId" INTEGER;

-- Step 2: Populate supplierUnitMeasureId with the canonical unit from InventoryItem
-- This sets each SupplierItem to use the same unit as its linked InventoryItem (1:1 conversion by default)
UPDATE "supplier_items" si
SET "supplierUnitMeasureId" = ii."unitMeasureId"
FROM "inventory_items" ii
WHERE si."itemId" = ii.id;

-- Step 3: Make supplierUnitMeasureId NOT NULL now that it's populated
ALTER TABLE "supplier_items" 
  ALTER COLUMN "supplierUnitMeasureId" SET NOT NULL;

-- Step 4: Create index for performance
CREATE INDEX "supplier_items_supplierUnitMeasureId_idx" ON "supplier_items"("supplierUnitMeasureId");

-- Step 5: Add foreign key constraint
ALTER TABLE "supplier_items" 
  ADD CONSTRAINT "supplier_items_supplierUnitMeasureId_fkey" 
  FOREIGN KEY ("supplierUnitMeasureId") 
  REFERENCES "unit_measures"("id") 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;
