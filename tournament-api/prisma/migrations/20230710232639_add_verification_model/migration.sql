-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "verificationId" INTEGER;

-- CreateTable
CREATE TABLE "Verification" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "status" TEXT NOT NULL,
    "participantId" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verification_participantId_key" ON "Verification"("participantId");

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Participant_verificationId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
