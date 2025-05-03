-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Completed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Request', 'Received', 'Consumed', 'Borrowed', 'Returned', 'Disposed', 'Repair');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('Borrow', 'Consume');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('LowStock', 'Available', 'OutOfStock', 'Disposed');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('Bus', 'Tool', 'Consumable');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('Active', 'UnderMaintenance', 'Decommissioned');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('Airconditioned', 'Ordinary');

-- CreateTable
CREATE TABLE "Bus" (
    "bus_id" SERIAL NOT NULL,
    "plate_number" TEXT NOT NULL,
    "body_builder" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "status" "BusStatus" NOT NULL,
    "bus_type" "BusType" NOT NULL,
    "model" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "purchased_date" TIMESTAMP(3) NOT NULL,
    "last_inspection_date" TIMESTAMP(3) NOT NULL,
    "purchased_price" DOUBLE PRECISION NOT NULL,
    "current_condition" TEXT NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("bus_id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "receipt_id" SERIAL NOT NULL,
    "receipt_title" TEXT NOT NULL,
    "date_generate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("receipt_id")
);

-- CreateTable
CREATE TABLE "Item" (
    "item_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_number" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "unit_measure" TEXT NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "usable_quantity" INTEGER NOT NULL,
    "defective_quantity" INTEGER NOT NULL,
    "missing_quantity" INTEGER NOT NULL,
    "status" "ItemStatus" NOT NULL,
    "date_update" TIMESTAMP(3) NOT NULL,
    "bus_id" INTEGER NOT NULL,
    "receipt_id" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "purchase_request_id" SERIAL NOT NULL,
    "request_item" TEXT NOT NULL,
    "unit_measure" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "approval_date" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("purchase_request_id")
);

-- CreateTable
CREATE TABLE "PurchaseRequestItem" (
    "id" SERIAL NOT NULL,
    "purchase_request_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "transaction_id" SERIAL NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "purchase_request_id" INTEGER,
    "item_id" INTEGER NOT NULL,
    "request_id" INTEGER,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "EmployeeRequestItem" (
    "request_id" SERIAL NOT NULL,
    "employee_name" TEXT NOT NULL,
    "request_purpose" TEXT NOT NULL,
    "request_type" "RequestType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL,
    "expected_return_date" TIMESTAMP(3),
    "actual_return_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "EmployeeRequestItem_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "EmployeeRequestItemMap" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "EmployeeRequestItemMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bus_plate_number_key" ON "Bus"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "Item_item_number_key" ON "Item"("item_number");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequestItem_purchase_request_id_item_id_key" ON "PurchaseRequestItem"("purchase_request_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRequestItemMap_request_id_item_id_key" ON "EmployeeRequestItemMap"("request_id", "item_id");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("bus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Receipt"("receipt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_purchase_request_id_fkey" FOREIGN KEY ("purchase_request_id") REFERENCES "PurchaseRequest"("purchase_request_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_purchase_request_id_fkey" FOREIGN KEY ("purchase_request_id") REFERENCES "PurchaseRequest"("purchase_request_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "EmployeeRequestItem"("request_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRequestItemMap" ADD CONSTRAINT "EmployeeRequestItemMap_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "EmployeeRequestItem"("request_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRequestItemMap" ADD CONSTRAINT "EmployeeRequestItemMap_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
