-- AlterEnum
ALTER TYPE "MenuTheme" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "customTheme" JSONB;
