/*
  Warnings:

  - Made the column `password` on table `Team` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "password" SET NOT NULL;
