-- AlterTable
-- Explicit ordering for featured products in the catalogue. Nullable so every
-- existing row is unranked and sorts after ranked ones, which leaves the
-- current ordering untouched until someone sets a rank in the admin.
ALTER TABLE "Product" ADD COLUMN "featuredRank" INTEGER;

-- DropIndex / CreateIndex
-- The featured sort now reads both columns together.
DROP INDEX IF EXISTS "Product_featured_idx";
CREATE INDEX "Product_featured_featuredRank_idx" ON "Product"("featured", "featuredRank");
