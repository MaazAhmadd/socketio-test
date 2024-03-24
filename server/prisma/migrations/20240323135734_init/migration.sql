/*
  Warnings:

  - You are about to drop the column `length` on the `VideoPlayer` table. All the data in the column will be lost.
  - Added the required column `duration` to the `VideoPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "handle" TEXT NOT NULL,
    "profilePicture" TEXT,
    "isConnected" BOOLEAN NOT NULL,
    "isLeader" BOOLEAN NOT NULL,
    "micEnabled" BOOLEAN NOT NULL,
    "roomId" INTEGER,
    CONSTRAINT "Member_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("handle", "id", "isConnected", "isLeader", "micEnabled", "name", "profilePicture", "roomId") SELECT "handle", "id", "isConnected", "isLeader", "micEnabled", "name", "profilePicture", "roomId" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_handle_key" ON "Member"("handle");
CREATE TABLE "new_VideoPlayer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isPlaying" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "playStatus" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    CONSTRAINT "VideoPlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VideoPlayer" ("id", "isPlaying", "playStatus", "roomId", "source") SELECT "id", "isPlaying", "playStatus", "roomId", "source" FROM "VideoPlayer";
DROP TABLE "VideoPlayer";
ALTER TABLE "new_VideoPlayer" RENAME TO "VideoPlayer";
CREATE UNIQUE INDEX "VideoPlayer_roomId_key" ON "VideoPlayer"("roomId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
