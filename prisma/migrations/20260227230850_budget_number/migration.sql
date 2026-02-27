/*
  Warnings:

  - Made the column `number` on table `Budget` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "observation" TEXT,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "responsibleId" INTEGER,
    CONSTRAINT "Budget_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("approvedAt", "createdAt", "customerId", "expiresAt", "id", "isRead", "number", "observation", "rejectedAt", "responsibleId", "status", "totalAmount", "type", "updatedAt", "userId") SELECT "approvedAt", "createdAt", "customerId", "expiresAt", "id", "isRead", "number", "observation", "rejectedAt", "responsibleId", "status", "totalAmount", "type", "updatedAt", "userId" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
CREATE UNIQUE INDEX "Budget_number_key" ON "Budget"("number");
CREATE INDEX "Budget_customerId_idx" ON "Budget"("customerId");
CREATE INDEX "Budget_status_idx" ON "Budget"("status");
CREATE INDEX "Budget_createdAt_idx" ON "Budget"("createdAt");
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX "Budget_responsibleId_idx" ON "Budget"("responsibleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
