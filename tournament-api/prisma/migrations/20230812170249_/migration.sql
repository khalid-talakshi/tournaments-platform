/*
  Warnings:

  - A unique constraint covering the columns `[jerseyNumber,teamId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Player_jerseyNumber_teamId_key" ON "Player"("jerseyNumber", "teamId");
