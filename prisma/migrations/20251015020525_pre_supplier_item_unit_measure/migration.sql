-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('LOW_STOCK', 'AVAILABLE', 'NOT_AVAILABLE', 'OUT_OF_STOCK', 'UNDER_MAINTENANCE', 'EXPIRED', 'IN_USE', 'DISPOSED');

-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN', 'TRANSFER');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('BORROW', 'CONSUME');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'NOT_RETURNED', 'CONSUMED', 'PARTIALLY_CONSUMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FLAGGED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('DRAFT', 'POSTED', 'APPROVED', 'REJECTED', 'REJECTED_INSUFFICIENT_BUDGET', 'CLOSED');

-- CreateEnum
CREATE TYPE "BudgetRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED_PRICE_MISMATCH', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "RefundRequestType" AS ENUM ('REFUND', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'TO_BE_REFUNDED', 'REFUNDED', 'TO_BE_REPLACED', 'REPLACED', 'REJECTED', 'FAILED', 'CLOSED');

-- CreateEnum
CREATE TYPE "BodyBuilder" AS ENUM ('AGILA', 'HILLTOP', 'RBM', 'DARJ', 'OTHER');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('AIRCONDITIONED', 'ORDINARY');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('ACTIVE', 'DECOMMISSIONED', 'UNDER_MAINTENANCE', 'DISPOSED');

-- CreateEnum
CREATE TYPE "BusCondition" AS ENUM ('BRAND_NEW', 'SECOND_HAND');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('PURCHASED', 'LEASED', 'DONATED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'NOT_REGISTERED', 'NEEDS_RENEWAL', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BusSource" AS ENUM ('DEALERSHIP', 'AUCTION', 'PRIVATE_INDIVIDUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DisposalType" AS ENUM ('BUS', 'STOCK');

-- CreateEnum
CREATE TYPE "DisposalMethod" AS ENUM ('SOLD', 'SCRAPPED', 'DONATED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "DisposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalEntity" AS ENUM ('PURCHASE_REQUEST', 'BUDGET_REQUEST', 'REFUND_REQUEST', 'DISPOSAL');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVERTED');

-- CreateTable
CREATE TABLE "employee_references" (
    "id" SERIAL NOT NULL,
    "employeeNumber" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "position" VARCHAR(100),
    "departmentId" INTEGER,
    "departmentName" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSynced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "categoryId" VARCHAR(20) NOT NULL,
    "categoryName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_measures" (
    "id" SERIAL NOT NULL,
    "unitId" VARCHAR(20) NOT NULL,
    "unitName" VARCHAR(50) NOT NULL,
    "abbreviation" VARCHAR(10) NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "itemId" VARCHAR(20) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "itemName" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "unitMeasureId" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" SERIAL NOT NULL,
    "batchId" VARCHAR(20) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "usableQuantity" INTEGER NOT NULL DEFAULT 0,
    "defectiveQuantity" INTEGER NOT NULL DEFAULT 0,
    "missingQuantity" INTEGER NOT NULL DEFAULT 0,
    "remarks" VARCHAR(255),
    "expirationDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" SERIAL NOT NULL,
    "transactionId" VARCHAR(20) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "batchId" INTEGER,
    "transactionType" "StockTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceType" VARCHAR(50),
    "referenceId" VARCHAR(20),
    "remarks" TEXT,
    "handledByEmpNumber" VARCHAR(20) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_requests" (
    "id" SERIAL NOT NULL,
    "requestId" VARCHAR(20) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "empNumber" VARCHAR(20) NOT NULL,
    "requestType" "RequestType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purpose" VARCHAR(255) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "expectedReturnDate" TIMESTAMP(3),
    "actualReturnDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "supplierId" VARCHAR(20) NOT NULL,
    "supplierName" VARCHAR(150) NOT NULL,
    "contactPerson" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "street" VARCHAR(255),
    "barangay" VARCHAR(100),
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_items" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageDeliveryTime" VARCHAR(50),
    "notes" TEXT,
    "lastPurchaseDate" TIMESTAMP(3),
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" SERIAL NOT NULL,
    "prId" VARCHAR(20) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "estimatedAmount" DOUBLE PRECISION NOT NULL,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'NORMAL',
    "justification" TEXT,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "validationStatus" VARCHAR(50),
    "validationRemarks" TEXT,
    "autoTrigger" BOOLEAN NOT NULL DEFAULT false,
    "reorderOfPrId" VARCHAR(20),
    "creatorEmpNumber" VARCHAR(20) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" SERIAL NOT NULL,
    "prId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "estimatedUnitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEstimated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_requests" (
    "id" SERIAL NOT NULL,
    "brId" VARCHAR(20) NOT NULL,
    "prId" INTEGER NOT NULL,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "status" "BudgetRequestStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "approverEmpNumber" VARCHAR(20),
    "approvedDate" TIMESTAMP(3),
    "creatorEmpNumber" VARCHAR(20) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" SERIAL NOT NULL,
    "poId" VARCHAR(20) NOT NULL,
    "prId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'PENDING',
    "priceMismatchFlag" BOOLEAN NOT NULL DEFAULT false,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "remarks" TEXT,
    "creatorEmpNumber" VARCHAR(20) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_receipts" (
    "id" SERIAL NOT NULL,
    "drId" VARCHAR(20) NOT NULL,
    "poId" INTEGER NOT NULL,
    "receivedQuantity" INTEGER NOT NULL,
    "defectiveQuantity" INTEGER NOT NULL DEFAULT 0,
    "missingQuantity" INTEGER NOT NULL DEFAULT 0,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectionStatus" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "inspectionFindings" TEXT,
    "invoiceNumber" VARCHAR(50),
    "invoiceAmount" DOUBLE PRECISION,
    "invoiceAttachment" TEXT,
    "receiverEmpNumber" VARCHAR(20) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" SERIAL NOT NULL,
    "refundId" VARCHAR(20) NOT NULL,
    "poId" INTEGER NOT NULL,
    "requestType" "RefundRequestType" NOT NULL,
    "reason" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "affectedAmount" DOUBLE PRECISION,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PENDING',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "processingRemarks" TEXT,
    "resolutionDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buses" (
    "id" SERIAL NOT NULL,
    "busId" VARCHAR(20) NOT NULL,
    "itemId" INTEGER NOT NULL,
    "plateNumber" VARCHAR(20) NOT NULL,
    "bodyNumber" VARCHAR(20) NOT NULL,
    "bodyBuilder" "BodyBuilder" NOT NULL,
    "busType" "BusType" NOT NULL,
    "manufacturer" VARCHAR(100) NOT NULL,
    "status" "BusStatus" NOT NULL DEFAULT 'ACTIVE',
    "chasisNumber" VARCHAR(50) NOT NULL,
    "engineNumber" VARCHAR(50) NOT NULL,
    "seatCapacity" INTEGER NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "yearModel" INTEGER NOT NULL,
    "route" VARCHAR(10),
    "condition" "BusCondition" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "acquisitionMethod" "AcquisitionMethod" NOT NULL,
    "warrantyExpirationDate" TIMESTAMP(3),
    "registrationStatus" "RegistrationStatus" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "second_hand_details" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "previousOwner" VARCHAR(150) NOT NULL,
    "previousOwnerContact" VARCHAR(50),
    "source" "BusSource" NOT NULL,
    "odometerReading" INTEGER,
    "lastRegistrationDate" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "conditionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "second_hand_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_new_details" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "dealerName" VARCHAR(150) NOT NULL,
    "dealerContact" VARCHAR(50),
    "warrantyDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_new_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_files" (
    "id" SERIAL NOT NULL,
    "fileId" VARCHAR(20) NOT NULL,
    "busId" INTEGER NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bus_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposal_records" (
    "id" SERIAL NOT NULL,
    "disposalId" VARCHAR(20) NOT NULL,
    "disposalType" "DisposalType" NOT NULL,
    "busId" INTEGER,
    "itemId" INTEGER,
    "batchId" VARCHAR(20),
    "quantity" INTEGER,
    "disposalDate" TIMESTAMP(3) NOT NULL,
    "disposalMethod" "DisposalMethod" NOT NULL,
    "reason" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "status" "DisposalStatus" NOT NULL DEFAULT 'PENDING',
    "approverEmpNumber" VARCHAR(20),
    "approvedDate" TIMESTAMP(3),
    "remarks" TEXT,
    "creatorEmpNumber" VARCHAR(20) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disposal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" SERIAL NOT NULL,
    "approvalId" VARCHAR(20) NOT NULL,
    "entityType" "ApprovalEntity" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "prId" INTEGER,
    "brId" INTEGER,
    "refundId" INTEGER,
    "disposalId" INTEGER,
    "approverEmpNumber" VARCHAR(20) NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "remarks" TEXT,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_references_employeeNumber_key" ON "employee_references"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "categories_categoryId_key" ON "categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_categoryName_key" ON "categories"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "unit_measures_unitId_key" ON "unit_measures"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_measures_unitName_key" ON "unit_measures"("unitName");

-- CreateIndex
CREATE UNIQUE INDEX "unit_measures_abbreviation_key" ON "unit_measures"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_itemId_key" ON "inventory_items"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batchId_key" ON "batches"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transactions_transactionId_key" ON "stock_transactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_requests_requestId_key" ON "employee_requests"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierId_key" ON "suppliers"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_items_supplierId_itemId_key" ON "supplier_items"("supplierId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_prId_key" ON "purchase_requests"("prId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_requests_brId_key" ON "budget_requests"("brId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_requests_prId_key" ON "budget_requests"("prId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_poId_key" ON "purchase_orders"("poId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_prId_key" ON "purchase_orders"("prId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_receipts_drId_key" ON "delivery_receipts"("drId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_requests_refundId_key" ON "refund_requests"("refundId");

-- CreateIndex
CREATE UNIQUE INDEX "buses_busId_key" ON "buses"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "buses_plateNumber_key" ON "buses"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buses_bodyNumber_key" ON "buses"("bodyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buses_chasisNumber_key" ON "buses"("chasisNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buses_engineNumber_key" ON "buses"("engineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "second_hand_details_busId_key" ON "second_hand_details"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "brand_new_details_busId_key" ON "brand_new_details"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "bus_files_fileId_key" ON "bus_files"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "disposal_records_disposalId_key" ON "disposal_records"("disposalId");

-- CreateIndex
CREATE UNIQUE INDEX "disposal_records_busId_key" ON "disposal_records"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_approvalId_key" ON "approvals"("approvalId");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_unitMeasureId_fkey" FOREIGN KEY ("unitMeasureId") REFERENCES "unit_measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_handledByEmpNumber_fkey" FOREIGN KEY ("handledByEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_creatorEmpNumber_fkey" FOREIGN KEY ("creatorEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_prId_fkey" FOREIGN KEY ("prId") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_requests" ADD CONSTRAINT "budget_requests_prId_fkey" FOREIGN KEY ("prId") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_requests" ADD CONSTRAINT "budget_requests_creatorEmpNumber_fkey" FOREIGN KEY ("creatorEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_prId_fkey" FOREIGN KEY ("prId") REFERENCES "purchase_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_creatorEmpNumber_fkey" FOREIGN KEY ("creatorEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_receipts" ADD CONSTRAINT "delivery_receipts_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_receipts" ADD CONSTRAINT "delivery_receipts_receiverEmpNumber_fkey" FOREIGN KEY ("receiverEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "second_hand_details" ADD CONSTRAINT "second_hand_details_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_new_details" ADD CONSTRAINT "brand_new_details_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_files" ADD CONSTRAINT "bus_files_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposal_records" ADD CONSTRAINT "disposal_records_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposal_records" ADD CONSTRAINT "disposal_records_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposal_records" ADD CONSTRAINT "disposal_records_creatorEmpNumber_fkey" FOREIGN KEY ("creatorEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approverEmpNumber_fkey" FOREIGN KEY ("approverEmpNumber") REFERENCES "employee_references"("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_prId_fkey" FOREIGN KEY ("prId") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_brId_fkey" FOREIGN KEY ("brId") REFERENCES "budget_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "refund_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_disposalId_fkey" FOREIGN KEY ("disposalId") REFERENCES "disposal_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
