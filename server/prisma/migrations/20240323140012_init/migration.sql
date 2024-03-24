/*
  Warnings:

  - You are about to alter the column `lastEmpty` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `String` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lastEmpty" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Public'
);
INSERT INTO "new_Room" ("id", "lastEmpty", "status") SELECT "id", "lastEmpty", "status" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
