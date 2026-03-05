-- Revierte: 20260303090008_remove_slug_order_index_variation_types
-- Revierte: 20260303063939_add_product_variants
-- Agrega: campo variants (JSON) en Product

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- 1. Eliminar tablas de variantes (orden por FKs: hijas primero)
DROP TABLE IF EXISTS "product_variant_values";
DROP TABLE IF EXISTS "product_variants";
DROP TABLE IF EXISTS "product_variation_types";
DROP TABLE IF EXISTS "variation_type_values";
DROP TABLE IF EXISTS "variation_types";

-- 2. Quitar productVariantId de BudgetItem (recrear tabla sin esa columna)
CREATE TABLE "new_BudgetItem" (
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
INSERT INTO "new_BudgetItem" ("id", "budgetId", "productId", "price", "quantity", "amount", "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice")
    SELECT "id", "budgetId", "productId", "price", "quantity", "amount", "observation", "createdAt", "updatedAt", "retailPrice", "wholesalePrice"
    FROM "BudgetItem";
DROP TABLE "BudgetItem";
ALTER TABLE "new_BudgetItem" RENAME TO "BudgetItem";
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- 3. Quitar productVariantId de OrderItem (recrear tabla sin esa columna)
CREATE TABLE "new_OrderItem" (
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
INSERT INTO "new_OrderItem" ("id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount", "observation", "createdAt", "updatedAt")
    SELECT "id", "orderId", "productId", "price", "retailPrice", "wholesalePrice", "quantity", "amount", "observation", "createdAt", "updatedAt"
    FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- 4. Agregar columna variants (JSON) a Product sin modificar datos existentes
ALTER TABLE "Product" ADD COLUMN "variants" TEXT;

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
