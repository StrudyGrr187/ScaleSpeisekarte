-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MenuTheme" ADD VALUE 'MINIMAL';
ALTER TYPE "MenuTheme" ADD VALUE 'WARM';
ALTER TYPE "MenuTheme" ADD VALUE 'NIGHT';
ALTER TYPE "MenuTheme" ADD VALUE 'BISTRO';
ALTER TYPE "MenuTheme" ADD VALUE 'BOLD';
ALTER TYPE "MenuTheme" ADD VALUE 'LINEN';
ALTER TYPE "MenuTheme" ADD VALUE 'SLATE';
ALTER TYPE "MenuTheme" ADD VALUE 'GARDEN';
