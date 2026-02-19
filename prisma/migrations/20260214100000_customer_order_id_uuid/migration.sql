-- Migración: Customer.id y Order.id de INTEGER a UUID (TEXT)
-- También: Budget.customerId, Order.customerId, OrderItem.orderId -> TEXT
-- SQLite no permite ALTER COLUMN de tipo, por eso se recrean las tablas.

-- ========== FASE 1: Customer UUID ==========

-- 1. Backup BudgetItem (tiene budgetId TEXT)
CREATE TABLE "BudgetItem_backup" AS SELECT * FROM "BudgetItem";

-- 2. Mapeo old Customer.id (INT) -> new UUID
CREATE TABLE "_customer_id_map" (
  "old_id" INTEGER NOT NULL PRIMARY KEY,
  "new_id" TEXT NOT NULL
);

INSERT INTO "_customer_id_map" ("old_id", "new_id")
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
FROM "Customer";

-- 3. Customer_new con id TEXT
CREATE TABLE "Customer_new" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'retail',
  "document" TEXT,
  "address" TEXT,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Customer_new" ("id", "name", "email", "phone", "type", "document", "address", "observation", "createdAt", "updatedAt")
SELECT m."new_id", c."name", c."email", c."phone", c."type", c."document", c."address", c."observation", c."createdAt", c."updatedAt"
FROM "Customer" c
JOIN "_customer_id_map" m ON c."id" = m."old_id";

-- 4. Budget con customerId TEXT (sin FK aún; Customer sigue siendo la tabla antigua)
CREATE TABLE "Budget_new" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  "responsibleId" INTEGER
);

INSERT INTO "Budget_new" ("id", "customerId", "observation", "totalAmount", "status", "userId", "isRead", "expiresAt", "approvedAt", "rejectedAt", "createdAt", "updatedAt", "type", "responsibleId")
SELECT b."id", m."new_id", b."observation", b."totalAmount", b."status", b."userId", b."isRead", b."expiresAt", b."approvedAt", b."rejectedAt", b."createdAt", b."updatedAt", b."type", b."responsibleId"
FROM "Budget" b
JOIN "_customer_id_map" m ON b."customerId" = m."old_id";

DROP TABLE "BudgetItem";
DROP TABLE "Budget";
ALTER TABLE "Budget_new" RENAME TO "Budget";

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

INSERT INTO "BudgetItem" ("id", "budgetId", "productId", "price", "quantity", "amount", "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice")
SELECT "id", "budgetId", "productId", "price", "quantity", "amount", "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice"
FROM "BudgetItem_backup";

-- (BudgetItem_backup se mantiene para el paso 6b; no crear índices aún)

-- 5. Order con customerId TEXT (sin FK aún; Order.id sigue INT por ahora)
CREATE TABLE "OrderItem_backup" AS SELECT * FROM "OrderItem";

CREATE TABLE "Order_new" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "customerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Order_new" ("id", "customerId", "type", "status", "totalAmount", "observation", "createdAt", "updatedAt")
SELECT o."id", m."new_id", o."type", o."status", o."totalAmount", o."observation", o."createdAt", o."updatedAt"
FROM "Order" o
JOIN "_customer_id_map" m ON o."customerId" = m."old_id";

DROP TABLE "OrderItem";
DROP TABLE "Order";
ALTER TABLE "Order_new" RENAME TO "Order";

CREATE TABLE "OrderItem" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "retailPrice" INTEGER NOT NULL,
  "wholesalePrice" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "OrderItem" ("id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount", "observation", "createdAt", "updatedAt")
SELECT "id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount", "observation", "createdAt", "updatedAt"
FROM "OrderItem_backup";

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- 6. Reemplazar Customer por Customer_new
DROP TABLE "Customer";
ALTER TABLE "Customer_new" RENAME TO "Customer";

CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE INDEX "Customer_type_idx" ON "Customer"("type");
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

-- 6b. Recrear Budget con FK a Customer (SQLite no actualiza FKs al renombrar tablas)
CREATE TABLE "Budget_temp" (
  "id" TEXT NOT NULL PRIMARY KEY,
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

INSERT INTO "Budget_temp" SELECT * FROM "Budget";
DROP TABLE "BudgetItem";
DROP TABLE "Budget";
ALTER TABLE "Budget_temp" RENAME TO "Budget";

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

INSERT INTO "BudgetItem" ("id", "budgetId", "productId", "price", "quantity", "amount", "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice")
SELECT "id", "budgetId", "productId", "price", "quantity", "amount", "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice"
FROM "BudgetItem_backup";

DROP TABLE "BudgetItem_backup";

CREATE INDEX "Budget_customerId_idx" ON "Budget"("customerId");
CREATE INDEX "Budget_status_idx" ON "Budget"("status");
CREATE INDEX "Budget_createdAt_idx" ON "Budget"("createdAt");
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX "Budget_responsibleId_idx" ON "Budget"("responsibleId");
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- ========== FASE 2: Order.id UUID ==========

-- 7. Mapeo old Order.id (INT) -> new UUID
CREATE TABLE "_order_id_map" (
  "old_id" INTEGER NOT NULL PRIMARY KEY,
  "new_id" TEXT NOT NULL
);

INSERT INTO "_order_id_map" ("old_id", "new_id")
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
FROM "Order";

-- 8. Order con id TEXT (UUID)
CREATE TABLE "OrderItem_backup2" AS SELECT * FROM "OrderItem";

CREATE TABLE "Order_new2" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_new2_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Order_new2" ("id", "customerId", "type", "status", "totalAmount", "observation", "createdAt", "updatedAt")
SELECT m."new_id", o."customerId", o."type", o."status", o."totalAmount", o."observation", o."createdAt", o."updatedAt"
FROM "Order" o
JOIN "_order_id_map" m ON o."id" = m."old_id";

DROP TABLE "OrderItem";
DROP TABLE "Order";
ALTER TABLE "Order_new2" RENAME TO "Order";

CREATE TABLE "OrderItem" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "orderId" TEXT NOT NULL,
  "productId" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "retailPrice" INTEGER NOT NULL,
  "wholesalePrice" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "OrderItem" ("id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount", "observation", "createdAt", "updatedAt")
SELECT bi."id", m."new_id", bi."productId", bi."price", bi."retailPrice", bi."wholesalePrice", bi."quantity", bi."amount", bi."observation", bi."createdAt", bi."updatedAt"
FROM "OrderItem_backup2" bi
JOIN "_order_id_map" m ON bi."orderId" = m."old_id";

DROP TABLE "OrderItem_backup2";
DROP TABLE "OrderItem_backup";
DROP TABLE "_order_id_map";
DROP TABLE "_customer_id_map";

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
