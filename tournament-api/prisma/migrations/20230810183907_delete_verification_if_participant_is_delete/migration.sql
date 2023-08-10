-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "user_relation";

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "user_relation" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
