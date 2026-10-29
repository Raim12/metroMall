-- AlterEnum: Street Lights category (Lighting group).
ALTER TYPE "Category" ADD VALUE 'street-lights';

-- Sonex is no longer stocked. The seed only sets `active` when a product is
-- first created, so products already in the database are hidden here.
UPDATE "Product" SET "active" = false, "featured" = false WHERE "brand" = 'sonex';

-- SK Iris on the homepage, as the client asked.
UPDATE "Product" SET "featured" = true WHERE "slug" = 'sk-iris-inverter';
