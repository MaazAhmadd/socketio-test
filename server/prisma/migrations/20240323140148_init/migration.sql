/*
  Warnings:

  - You are about to drop the column `value` on the `Kicked` table. All the data in the column will be lost.
  - Added the required column `memberHandle` to the `Kicked` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Kicked" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberHandle" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    CONSTRAINT "Kicked_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Kicked" ("id", "roomId") SELECT "id", "roomId" FROM "Kicked";
DROP TABLE "Kicked";
ALTER TABLE "new_Kicked" RENAME TO "Kicked";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
