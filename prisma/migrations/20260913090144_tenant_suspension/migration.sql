-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedUntil" TIMESTAMP(3),
ADD COLUMN     "suspensionReason" TEXT;

-- CreateIndex
CREATE INDEX "Restaurant_createdAt_idx" ON "Restaurant"("createdAt");
