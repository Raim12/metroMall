-- CreateTable
CREATE TABLE "LaunchSignup" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LaunchSignup_createdAt_idx" ON "LaunchSignup"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchSignup_brand_phone_key" ON "LaunchSignup"("brand", "phone");
