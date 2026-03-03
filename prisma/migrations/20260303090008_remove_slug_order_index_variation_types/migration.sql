/*
  Warnings:

  - You are about to drop the column `order_index` on the `variation_type_values` table. All the data in the column will be lost.
  - You are about to drop the column `order_index` on the `variation_types` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `variation_types` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_variation_type_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variation_type_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "variation_type_values_variation_type_id_fkey" FOREIGN KEY ("variation_type_id") REFERENCES "variation_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_variation_type_values" ("id", "value", "variation_type_id") SELECT "id", "value", "variation_type_id" FROM "variation_type_values";
DROP TABLE "variation_type_values";
ALTER TABLE "new_variation_type_values" RENAME TO "variation_type_values";
CREATE INDEX "variation_type_values_variation_type_id_idx" ON "variation_type_values"("variation_type_id");
CREATE TABLE "new_variation_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_variation_types" ("id", "name") SELECT "id", "name" FROM "variation_types";
DROP TABLE "variation_types";
ALTER TABLE "new_variation_types" RENAME TO "variation_types";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
