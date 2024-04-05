-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "handle" TEXT NOT NULL,
    "profilePicture" TEXT,
    "isConnected" BOOLEAN NOT NULL,
    "isLeader" BOOLEAN NOT NULL,
    "micEnabled" BOOLEAN NOT NULL,
    "leaderPriorityCounter" INTEGER NOT NULL,
    "roomId" TEXT,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoPlayer" (
    "id" TEXT NOT NULL,
    "isPlaying" BOOLEAN NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "playedTill" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "VideoPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Public',

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kicked" (
    "id" TEXT NOT NULL,
    "memberHandle" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Kicked_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YtVideo" (
    "id" TEXT NOT NULL,
    "ytId" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YtVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Member_handle_idx" ON "Member"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "VideoPlayer_roomId_key" ON "VideoPlayer"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "YtVideo_ytId_key" ON "YtVideo"("ytId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPlayer" ADD CONSTRAINT "VideoPlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kicked" ADD CONSTRAINT "Kicked_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
