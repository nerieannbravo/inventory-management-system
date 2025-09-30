-- CreateEnum
CREATE TYPE "public"."DisposalMethod" AS ENUM ('SOLD', 'SCRAPPED', 'DONATED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "public"."DisposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- AlterEnum
ALTER TYPE "public"."BusStatus" ADD VALUE 'DISPOSED';

-- CreateTable
CREATE TABLE "public"."bus_disposals" (
    "disposal_id" VARCHAR(20) NOT NULL,
    "bus_id" TEXT NOT NULL,
    "disposal_date" TIMESTAMP(3) NOT NULL,
    "disposal_method" "public"."DisposalMethod" NOT NULL,
    "reason" TEXT NOT NULL,
    "estimated_value" DOUBLE PRECISION,
    "actual_value" DOUBLE PRECISION,
    "disposal_status" "public"."DisposalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" VARCHAR(20),
    "approved_date" TIMESTAMP(3),
    "remarks" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(20) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bus_disposals_pkey" PRIMARY KEY ("disposal_id")
);

-- CreateTable
CREATE TABLE "public"."stock_disposals" (
    "disposal_id" VARCHAR(20) NOT NULL,
    "item_id" TEXT NOT NULL,
    "batch_id" VARCHAR(20),
    "quantity" INTEGER NOT NULL,
    "disposal_date" TIMESTAMP(3) NOT NULL,
    "disposal_method" "public"."DisposalMethod" NOT NULL,
    "reason" TEXT NOT NULL,
    "estimated_value" DOUBLE PRECISION,
    "actual_value" DOUBLE PRECISION,
    "disposal_status" "public"."DisposalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" VARCHAR(20),
    "approved_date" TIMESTAMP(3),
    "remarks" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(20) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stock_disposals_pkey" PRIMARY KEY ("disposal_id")
);

-- CreateTable
CREATE TABLE "public"."disposal_files" (
    "file_id" VARCHAR(20) NOT NULL,
    "disposal_type" TEXT NOT NULL,
    "disposal_id" VARCHAR(20) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "date_uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "disposal_files_pkey" PRIMARY KEY ("file_id")
);

-- AddForeignKey
ALTER TABLE "public"."bus_disposals" ADD CONSTRAINT "bus_disposals_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "public"."bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_disposals" ADD CONSTRAINT "stock_disposals_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."disposal_files" ADD CONSTRAINT "bus_disposal_files_fkey" FOREIGN KEY ("disposal_id") REFERENCES "public"."bus_disposals"("disposal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."disposal_files" ADD CONSTRAINT "stock_disposal_files_fkey" FOREIGN KEY ("disposal_id") REFERENCES "public"."stock_disposals"("disposal_id") ON DELETE CASCADE ON UPDATE CASCADE;
