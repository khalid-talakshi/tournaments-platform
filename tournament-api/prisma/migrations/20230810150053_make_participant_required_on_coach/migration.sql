/*
  Warnings:

  - Made the column `participantId` on table `Coach` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coaches_ibfk_2";

-- AlterTable
ALTER TABLE "Coach" ALTER COLUMN "participantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coaches_ibfk_2" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
