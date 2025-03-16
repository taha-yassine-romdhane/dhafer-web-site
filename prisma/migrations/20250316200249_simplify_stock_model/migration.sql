/*
  Warnings:

  - You are about to drop the column `location` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Stock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,size,colorId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Stock_productId_location_size_colorId_key";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "location",
DROP COLUMN "quantity",
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_size_colorId_key" ON "Stock"("productId", "size", "colorId");
