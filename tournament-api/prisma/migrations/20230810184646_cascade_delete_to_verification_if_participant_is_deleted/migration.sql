-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "user_relation";

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Participant_verificationId_fkey";

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "user_relation" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Participant_verificationId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
