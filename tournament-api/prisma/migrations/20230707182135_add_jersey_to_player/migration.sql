/*
  Warnings:

  - You are about to drop the column `regNumber` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "regNumber",
ADD COLUMN     "jerseyNumber" INTEGER NOT NULL DEFAULT 0;
