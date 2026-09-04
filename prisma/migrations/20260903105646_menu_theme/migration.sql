-- CreateEnum
CREATE TYPE "MenuTheme" AS ENUM ('MODERN', 'CLASSIC');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "fontPair" TEXT NOT NULL DEFAULT 'playfair-karla',
ADD COLUMN     "menuTheme" "MenuTheme" NOT NULL DEFAULT 'MODERN';
