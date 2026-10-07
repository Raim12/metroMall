-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'gas-hobs';
ALTER TYPE "Category" ADD VALUE 'gas-stoves';
ALTER TYPE "Category" ADD VALUE 'kitchen-hoods';
ALTER TYPE "Category" ADD VALUE 'wall-lights';
ALTER TYPE "Category" ADD VALUE 'chandeliers';
ALTER TYPE "Category" ADD VALUE 'down-lights';
ALTER TYPE "Category" ADD VALUE 'outdoor-lights';
