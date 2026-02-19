-- Migración: Budget.id de INTEGER a UUID (TEXT)
-- SQLite no permite ALTER COLUMN de tipo, por eso se recrean las tablas.

-- 1. Tabla de mapeo old_id (INTEGER) -> new_id (UUID)
CREATE TABLE "_budget_id_map" (
  "old_id" INTEGER NOT NULL PRIMARY KEY,
  "new_id" TEXT NOT NULL
);

-- 2. Generar un UUID por cada Budget existente (formato UUID v4 en SQLite)
INSERT INTO "_budget_id_map" ("old_id", "new_id")
SELECT
  "id",
  lower(
    hex(randomblob(4)) || '-' ||
    hex(randomblob(2)) || '-4' ||
    substr(hex(randomblob(2)), 2) || '-' ||
    substr('89ab', abs(random()) % 4 + 1, 1) ||
    hex(randomblob(2)) || '-' ||
    hex(randomblob(6))
  )
FROM "Budget";

-- 3. Nueva tabla Budget con id TEXT (UUID)
CREATE TABLE "Budget_new" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" INTEGER NOT NULL,
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
  CONSTRAINT "Budget_new_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Budget_new" (
  "id", "customerId", "observation", "totalAmount", "status", "userId",
  "isRead", "expiresAt", "approvedAt", "rejectedAt", "createdAt", "updatedAt",
  "type", "responsibleId"
)
SELECT
  m."new_id", b."customerId", b."observation", b."totalAmount", b."status", b."userId",
  b."isRead", b."expiresAt", b."approvedAt", b."rejectedAt", b."createdAt", b."updatedAt",
  b."type", b."responsibleId"
FROM "Budget" b
JOIN "_budget_id_map" m ON b."id" = m."old_id";

-- 4. Nueva tabla BudgetItem con budgetId TEXT (sin FK todavía)
CREATE TABLE "BudgetItem_new" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "budgetId" TEXT NOT NULL,
  "productId" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "retailPrice" INTEGER NOT NULL DEFAULT 0,
  "wholesalePrice" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "BudgetItem_new" (
  "id", "budgetId", "productId", "price", "quantity", "amount",
  "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice"
)
SELECT
  bi."id", m."new_id", bi."productId", bi."price", bi."quantity", bi."amount",
  bi."observation", bi."createdAt", bi."updatedAt", bi."retailPrice", bi."wholesalePrice"
FROM "BudgetItem" bi
JOIN "_budget_id_map" m ON bi."budgetId" = m."old_id";

-- 5. Eliminar tablas antiguas (BudgetItem primero por FK a Budget)
DROP TABLE "BudgetItem";
DROP TABLE "Budget";

-- 6. Renombrar Budget_new -> Budget
ALTER TABLE "Budget_new" RENAME TO "Budget";

-- 7. Recrear BudgetItem con FK a Budget
CREATE TABLE "BudgetItem" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "budgetId" TEXT NOT NULL,
  "productId" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "retailPrice" INTEGER NOT NULL DEFAULT 0,
  "wholesalePrice" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BudgetItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "BudgetItem" (
  "id", "budgetId", "productId", "price", "quantity", "amount",
  "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice"
)
SELECT "id", "budgetId", "productId", "price", "quantity", "amount",
  "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice"
FROM "BudgetItem_new";

DROP TABLE "BudgetItem_new";

-- 8. Índices (los de Budget ya no existen tras DROP; los recreamos)
CREATE INDEX "Budget_customerId_idx" ON "Budget"("customerId");
CREATE INDEX "Budget_status_idx" ON "Budget"("status");
CREATE INDEX "Budget_createdAt_idx" ON "Budget"("createdAt");
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX "Budget_responsibleId_idx" ON "Budget"("responsibleId");
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- 9. Limpiar tabla de mapeo
DROP TABLE "_budget_id_map";
