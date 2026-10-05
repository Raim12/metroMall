-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'table-fans';
ALTER TYPE "Category" ADD VALUE 'air-coolers';
ALTER TYPE "Category" ADD VALUE 'water-heaters';
ALTER TYPE "Category" ADD VALUE 'washing-machines';
ALTER TYPE "Category" ADD VALUE 'kitchen-appliances';
ALTER TYPE "Category" ADD VALUE 'water-dispensers';
ALTER TYPE "Category" ADD VALUE 'heaters';
ALTER TYPE "Category" ADD VALUE 'other-appliances';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'metro',
ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE INDEX "Product_brand_active_idx" ON "Product"("brand", "active");
