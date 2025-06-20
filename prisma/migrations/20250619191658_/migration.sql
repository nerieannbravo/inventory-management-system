/*
  Warnings:

  - You are about to drop the column `isdeleted` on the `bus` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_date` on the `bus` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_price` on the `bus` table. All the data in the column will be lost.
  - You are about to alter the column `body_number` on the `bus` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - A unique constraint covering the columns `[plate_number]` on the table `bus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[body_number]` on the table `bus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chasis_number]` on the table `bus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[engine_number]` on the table `bus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `acquisition_date` to the `bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `acquisition_method` to the `bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condition` to the `bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_status` to the `bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_model` to the `bus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusCondition" AS ENUM ('BRAND_NEW', 'SECOND_HAND');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('PURCHASED', 'LEASED', 'DONATED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'NOT_REGISTERED', 'NEEDS_RENEWAL', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BusSource" AS ENUM ('DEALERSHIP', 'ACTION', 'PRIVATE_INDIVIDUAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryStatus" ADD VALUE 'NOT_AVAILABLE';
ALTER TYPE "InventoryStatus" ADD VALUE 'IN_USED';
ALTER TYPE "InventoryStatus" ADD VALUE 'DISPOSED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'PARTIALLY_CONSUMED';
ALTER TYPE "RequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "batches" ADD COLUMN     "remarks" VARCHAR(255);

-- AlterTable
ALTER TABLE "bus" DROP COLUMN "isdeleted",
DROP COLUMN "purchase_date",
DROP COLUMN "purchase_price",
ADD COLUMN     "acquisition_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "acquisition_method" "AcquisitionMethod" NOT NULL,
ADD COLUMN     "condition" "BusCondition" NOT NULL,
ADD COLUMN     "model" VARCHAR(50) NOT NULL,
ADD COLUMN     "registration_status" "RegistrationStatus" NOT NULL,
ADD COLUMN     "route" VARCHAR(10),
ADD COLUMN     "warranty_expiration_date" TIMESTAMP(3),
ADD COLUMN     "year_model" INTEGER NOT NULL,
ALTER COLUMN "body_number" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "chasis_number" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "engine_number" SET DATA TYPE VARCHAR(50);

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
CREATE TABLE "BusOtherFiles" (
    "bus_files_id" VARCHAR(10) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "date_uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bus_id" TEXT NOT NULL,

    CONSTRAINT "BusOtherFiles_pkey" PRIMARY KEY ("bus_files_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bus_plate_number_key" ON "bus"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_body_number_key" ON "bus"("body_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_chasis_number_key" ON "bus"("chasis_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_engine_number_key" ON "bus"("engine_number");

-- AddForeignKey
ALTER TABLE "SecondHandDetails" ADD CONSTRAINT "SecondHandDetails_s_bus_id_fkey" FOREIGN KEY ("s_bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandNewDetails" ADD CONSTRAINT "BrandNewDetails_b_bus_id_fkey" FOREIGN KEY ("b_bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusOtherFiles" ADD CONSTRAINT "BusOtherFiles_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;
