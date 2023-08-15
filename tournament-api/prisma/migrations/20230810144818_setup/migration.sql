-- CreateTable
CREATE TABLE "Coach" (
    "id" SERIAL NOT NULL,
    "certification" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "TeamId" INTEGER,
    "participantId" INTEGER,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "homeTeamId" INTEGER,
    "awayTeamId" INTEGER,
    "homeTeamScore" INTEGER NOT NULL DEFAULT 0,
    "awayTeamScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "field" VARCHAR(255),
    "gameType" VARCHAR(255),
    "venue" VARCHAR(255),
    "category" VARCHAR(255),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "dob" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "userId" INTEGER NOT NULL,
    "phoneNumber" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "parentEmail" VARCHAR(255),
    "headshotKey" VARCHAR(255),
    "photoIdKey" VARCHAR(255),
    "waiverKey" VARCHAR(255),
    "gender" VARCHAR(255) NOT NULL,
    "verificationId" INTEGER,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "teamId" INTEGER,
    "jerseyNumber" INTEGER NOT NULL DEFAULT 0,
    "participantId" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "teamName" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "categoryId" INTEGER,
    "password" VARCHAR(255) NOT NULL,
    "teamManagerId" INTEGER,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamManager" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "dob" DATE NOT NULL,
    "userId" INTEGER NOT NULL,
    "headshot" VARCHAR(255),

    CONSTRAINT "TeamManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255),
    "password" VARCHAR(255),
    "permission" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "female" BOOLEAN DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "participantIdIndex" ON "Coach"("participantId");

-- CreateIndex
CREATE INDEX "TeamIdIndex" ON "Coach"("TeamId");

-- CreateIndex
CREATE INDEX "awayTeamId" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "homeTeamId" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Participant_userId_fkey" ON "Participant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_name_userId_key" ON "Participant"("name", "userId");

-- CreateIndex
CREATE INDEX "participantId" ON "Player"("participantId");

-- CreateIndex
CREATE INDEX "TeamId" ON "Player"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_participantId_teamId_key" ON "Player"("participantId", "teamId");

-- CreateIndex
CREATE INDEX "teamManagerId" ON "Team"("teamManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_categoryId_teamName_key" ON "Team"("categoryId", "teamName");

-- CreateIndex
CREATE UNIQUE INDEX "TeamManager_userId_key" ON "TeamManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_participantId_key" ON "Verification"("participantId");

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coaches_ibfk_1" FOREIGN KEY ("TeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coaches_ibfk_2" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Matches_ibfk_1" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Matches_ibfk_2" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "user_relation" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Players_ibfk_1" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Players_ibfk_2" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Teams_ibfk_1" FOREIGN KEY ("teamManagerId") REFERENCES "TeamManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "category_relation" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamManager" ADD CONSTRAINT "TeamManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Participant_verificationId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
