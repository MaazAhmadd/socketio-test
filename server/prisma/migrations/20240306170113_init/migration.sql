/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Member` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Kicked" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    CONSTRAINT "Kicked_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,
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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;