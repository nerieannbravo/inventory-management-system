-- CreateTable
CREATE TABLE "fuel_consumption" (
    "id" TEXT NOT NULL,
    "item_id" VARCHAR(10) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fuel_consumption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fuel_consumption" ADD CONSTRAINT "fuel_consumption_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
