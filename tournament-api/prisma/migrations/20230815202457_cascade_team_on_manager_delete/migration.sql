-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Teams_ibfk_1";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Teams_ibfk_1" FOREIGN KEY ("teamManagerId") REFERENCES "TeamManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;
