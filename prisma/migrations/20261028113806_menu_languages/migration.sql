-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "translations" JSONB;
