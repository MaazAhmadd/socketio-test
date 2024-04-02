-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "handle" TEXT NOT NULL,
    "profilePicture" TEXT,
    "isConnected" BOOLEAN NOT NULL,
    "isLeader" BOOLEAN NOT NULL,
    "micEnabled" BOOLEAN NOT NULL,
    "leaderPriorityCounter" INTEGER NOT NULL,
    "roomId" TEXT,
    CONSTRAINT "Member_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isPlaying" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "playedTill" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "VideoPlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'Public'
);

-- CreateTable
CREATE TABLE "Kicked" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberHandle" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "Kicked_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_handle_key" ON "Member"("handle");

-- CreateIndex
CREATE INDEX "Member_handle_idx" ON "Member"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "VideoPlayer_roomId_key" ON "VideoPlayer"("roomId");
