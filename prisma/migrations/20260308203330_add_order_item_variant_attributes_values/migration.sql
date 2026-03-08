/*
  Warnings:

  - You are about to alter the column `attributes` on the `BudgetItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `values` on the `BudgetItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `variants` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "attributes" JSONB;
ALTER TABLE "OrderItem" ADD COLUMN "values" JSONB;
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "observation" TEXT,
    "attributes" JSONB,
    "values" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retailPrice" INTEGER NOT NULL DEFAULT 0,
    "wholesalePrice" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetItem" ("amount", "attributes", "budgetId", "createdAt", "id", "observation", "price", "productId", "quantity", "retailPrice", "updatedAt", "values", "variantId", "wholesalePrice") SELECT "amount", "attributes", "budgetId", "createdAt", "id", "observation", "price", "productId", "quantity", "retailPrice", "updatedAt", "values", "variantId", "wholesalePrice" FROM "BudgetItem";
DROP TABLE "BudgetItem";
ALTER TABLE "new_BudgetItem" RENAME TO "BudgetItem";
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "retailPrice" INTEGER NOT NULL,
    "wholesalePrice" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sku" TEXT,
    "priceUpdatedAt" DATETIME,
    "priceUpdated" TEXT,
    "variants" JSONB
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "id", "isActive", "isFeatured", "name", "priceUpdated", "priceUpdatedAt", "retailPrice", "sku", "slug", "stock", "updatedAt", "variants", "wholesalePrice") SELECT "categoryId", "createdAt", "description", "id", "isActive", "isFeatured", "name", "priceUpdated", "priceUpdatedAt", "retailPrice", "sku", "slug", "stock", "updatedAt", "variants", "wholesalePrice" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
