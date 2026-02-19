-- Migración: Order.id de INTEGER a UUID (TEXT)
-- SQLite no permite ALTER COLUMN de tipo, por eso se recrean las tablas.
-- Mismo patrón que 20260214000000_budget_id_uuid.

-- 1. Tabla de mapeo old_id (INTEGER) -> new_id (UUID)
CREATE TABLE "_order_id_map" (
  "old_id" INTEGER NOT NULL PRIMARY KEY,
  "new_id" TEXT NOT NULL
);

-- 2. Generar un UUID por cada Order existente (formato UUID v4 en SQLite)
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

-- 3. Nueva tabla Order con id TEXT (UUID)
CREATE TABLE "Order_new" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_new_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Order_new" (
  "id", "customerId", "type", "status", "totalAmount", "observation", "createdAt", "updatedAt"
)
SELECT
  m."new_id", o."customerId", o."type", o."status", o."totalAmount", o."observation", o."createdAt", o."updatedAt"
FROM "Order" o
JOIN "_order_id_map" m ON o."id" = m."old_id";

-- 4. Nueva tabla OrderItem con orderId TEXT (sin FK todavía)
CREATE TABLE "OrderItem_new" (
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
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "OrderItem_new" (
  "id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount",
  "observation", "createdAt", "updatedAt"
)
SELECT
  oi."id", m."new_id", oi."productId", oi."price", oi."retailPrice", oi."wholesalePrice", oi."quantity", oi."amount",
  oi."observation", oi."createdAt", oi."updatedAt"
FROM "OrderItem" oi
JOIN "_order_id_map" m ON oi."orderId" = m."old_id";

-- 5. Eliminar tablas antiguas (OrderItem primero por FK a Order)
DROP TABLE "OrderItem";
DROP TABLE "Order";

-- 6. Renombrar Order_new -> Order
ALTER TABLE "Order_new" RENAME TO "Order";

-- 7. Recrear OrderItem con FK a Order
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

INSERT INTO "OrderItem" (
  "id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount",
  "observation", "createdAt", "updatedAt"
)
SELECT "id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount",
  "observation", "createdAt", "updatedAt"
FROM "OrderItem_new";

DROP TABLE "OrderItem_new";

-- 8. Índice
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- 9. Limpiar tabla de mapeo
DROP TABLE "_order_id_map";
