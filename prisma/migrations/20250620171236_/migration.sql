-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('LOW_STOCK', 'AVAILABLE', 'NOT_AVAILABLE', 'OUT_OF_STOCK', 'UNDER_MAINTENANCE', 'EXPIRED', 'IN_USED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('BORROW', 'CONSUME');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('RETURNED', 'NOT_RETURNED', 'CONSUMED', 'PARTIALLY_CONSUMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BodyBuilder" AS ENUM ('AGILA', 'HILLTOP', 'RBM', 'DARJ');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('AIRCONDITIONED', 'ORDINARY');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('ACTIVE', 'DECOMMISSIONED', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "BusCondition" AS ENUM ('BRAND_NEW', 'SECOND_HAND');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('PURCHASED', 'LEASED', 'DONATED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'NOT_REGISTERED', 'NEEDS_RENEWAL', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BusSource" AS ENUM ('DEALERSHIP', 'AUCTION', 'PRIVATE_INDIVIDUAL');

-- CreateTable
CREATE TABLE "inventory_items" (
    "item_id" VARCHAR(10) NOT NULL,
    "category_id" TEXT NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "unit_measure" VARCHAR(20) NOT NULL,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryStatus" NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "batches" (
    "batch_id" VARCHAR(10) NOT NULL,
    "item_id" TEXT NOT NULL,
    "f_item_id" VARCHAR(10) NOT NULL,
    "usable_quantity" INTEGER NOT NULL DEFAULT 0,
    "defective_quantity" INTEGER NOT NULL DEFAULT 0,
    "missing_quantity" INTEGER NOT NULL DEFAULT 0,
    "remarks" VARCHAR(255),
    "expiration_date" TIMESTAMP(3),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" VARCHAR(10) NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "employee_requests" (
    "request_id" VARCHAR(10) NOT NULL,
    "item_id" TEXT NOT NULL,
    "emp_id" VARCHAR(10) NOT NULL,
    "request_type" "RequestType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "req_purpose" VARCHAR(255) NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "expected_return_date" TIMESTAMP(3),
    "actual_return_date" TIMESTAMP(3),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "employee_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "bus" (
    "bus_id" VARCHAR(10) NOT NULL,
    "item_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "body_number" VARCHAR(20) NOT NULL,
    "body_builder" "BodyBuilder" NOT NULL,
    "bus_type" "BusType" NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "status" "BusStatus" NOT NULL,
    "chasis_number" VARCHAR(50) NOT NULL,
    "engine_number" VARCHAR(50) NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year_model" INTEGER NOT NULL,
    "route" VARCHAR(10),
    "condition" "BusCondition" NOT NULL,
    "acquisition_date" TIMESTAMP(3) NOT NULL,
    "acquisition_method" "AcquisitionMethod" NOT NULL,
    "warranty_expiration_date" TIMESTAMP(3),
    "registration_status" "RegistrationStatus" NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "bus_pkey" PRIMARY KEY ("bus_id")
);

-- CreateTable
CREATE TABLE "SecondHandDetails" (
    "s_bus_id" TEXT NOT NULL,
    "previous_owner" TEXT NOT NULL,
    "previous_owner_contact" TEXT NOT NULL,
    "source" "BusSource" NOT NULL,
    "odometer_reading" INTEGER NOT NULL,
    "last_registration_date" TIMESTAMP(3) NOT NULL,
    "last_maintenance_date" TIMESTAMP(3) NOT NULL,
    "bus_condition_notes" TEXT,

    CONSTRAINT "SecondHandDetails_pkey" PRIMARY KEY ("s_bus_id")
);

-- CreateTable
CREATE TABLE "BrandNewDetails" (
    "b_bus_id" TEXT NOT NULL,
    "dealer_name" TEXT NOT NULL,
    "dealer_contact" TEXT NOT NULL,

    CONSTRAINT "BrandNewDetails_pkey" PRIMARY KEY ("b_bus_id")
);

-- CreateTable
CREATE TABLE "bus_other_files" (
    "bus_files_id" VARCHAR(10) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "date_uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bus_id" TEXT NOT NULL,

    CONSTRAINT "bus_other_files_pkey" PRIMARY KEY ("bus_files_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "bus_plate_number_key" ON "bus"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_body_number_key" ON "bus"("body_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_chasis_number_key" ON "bus"("chasis_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_engine_number_key" ON "bus"("engine_number");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus" ADD CONSTRAINT "bus_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecondHandDetails" ADD CONSTRAINT "SecondHandDetails_s_bus_id_fkey" FOREIGN KEY ("s_bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandNewDetails" ADD CONSTRAINT "BrandNewDetails_b_bus_id_fkey" FOREIGN KEY ("b_bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_other_files" ADD CONSTRAINT "bus_other_files_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;
