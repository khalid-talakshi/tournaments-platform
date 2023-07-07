/*
  Warnings:

  - You are about to drop the column `category` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryId,teamName]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Team_category_teamName_key";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "category",
ADD COLUMN     "categoryId" INTEGER;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_categoryId_teamName_key" ON "Team"("categoryId", "teamName");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "category_relation" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
