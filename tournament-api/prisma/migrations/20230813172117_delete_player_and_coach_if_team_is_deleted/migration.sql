-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coaches_ibfk_1";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Players_ibfk_1";

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coaches_ibfk_1" FOREIGN KEY ("TeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Players_ibfk_1" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
