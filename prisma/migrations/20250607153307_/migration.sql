-- CreateEnum
CREATE TYPE "BodyBuilder" AS ENUM ('AGILA', 'HILLTOP', 'RBM', 'DARJ');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('AIRCONDITIONED', 'ORDINARY');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('ACTIVE', 'DECOMMISSIONED', 'UNDER_MAINTENANCE');

-- CreateTable
CREATE TABLE "bus" (
    "bus_id" VARCHAR(10) NOT NULL,
    "item_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "body_number" TEXT NOT NULL,
    "body_builder" "BodyBuilder" NOT NULL,
    "bus_type" "BusType" NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "status" "BusStatus" NOT NULL,
    "chasis_number" VARCHAR(20) NOT NULL,
    "engine_number" VARCHAR(20) NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "purchase_price" INTEGER NOT NULL DEFAULT 0,
    "purchase_date" TIMESTAMP(3),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "bus_pkey" PRIMARY KEY ("bus_id")
);

-- AddForeignKey
ALTER TABLE "bus" ADD CONSTRAINT "bus_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
