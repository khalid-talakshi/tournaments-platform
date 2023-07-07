/*
  Warnings:

  - You are about to drop the column `TeamId` on the `Player` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participantId,teamId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Players_ibfk_1";

-- DropIndex
DROP INDEX "Player_participantId_TeamId_key";

-- DropIndex
DROP INDEX "TeamId";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "TeamId",
ADD COLUMN     "teamId" INTEGER;

-- CreateIndex
CREATE INDEX "TeamId" ON "Player"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_participantId_teamId_key" ON "Player"("participantId", "teamId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Players_ibfk_1" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
