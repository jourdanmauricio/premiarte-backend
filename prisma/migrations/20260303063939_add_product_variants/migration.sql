-- CreateTable
CREATE TABLE "variation_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "variation_type_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variation_type_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "variation_type_values_variation_type_id_fkey" FOREIGN KEY ("variation_type_id") REFERENCES "variation_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variation_types" (
    "productId" INTEGER NOT NULL,
    "variation_type_id" INTEGER NOT NULL,

    PRIMARY KEY ("productId", "variation_type_id"),
    CONSTRAINT "product_variation_types_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_variation_types_variation_type_id_fkey" FOREIGN KEY ("variation_type_id") REFERENCES "variation_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "retail_price" INTEGER NOT NULL,
    "wholesale_price" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variant_values" (
    "variantId" INTEGER NOT NULL,
    "variation_type_value_id" INTEGER NOT NULL,

    PRIMARY KEY ("variantId", "variation_type_value_id"),
    CONSTRAINT "product_variant_values_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_variant_values_variation_type_value_id_fkey" FOREIGN KEY ("variation_type_value_id") REFERENCES "variation_type_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "productVariantId" INTEGER,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retailPrice" INTEGER NOT NULL DEFAULT 0,
    "wholesalePrice" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BudgetItem" ("amount", "budgetId", "createdAt", "id", "observation", "price", "productId", "quantity", "retailPrice", "updatedAt", "wholesalePrice") SELECT "amount", "budgetId", "createdAt", "id", "observation", "price", "productId", "quantity", "retailPrice", "updatedAt", "wholesalePrice" FROM "BudgetItem";
DROP TABLE "BudgetItem";
ALTER TABLE "new_BudgetItem" RENAME TO "BudgetItem";
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");
CREATE INDEX "BudgetItem_productVariantId_idx" ON "BudgetItem"("productVariantId");
CREATE TABLE "new_OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "productVariantId" INTEGER,
    "price" INTEGER NOT NULL,
    "retailPrice" INTEGER NOT NULL,
    "wholesalePrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("amount", "createdAt", "id", "observation", "orderId", "price", "productId", "quantity", "retailPrice", "updatedAt", "wholesalePrice") SELECT "amount", "createdAt", "id", "observation", "orderId", "price", "productId", "quantity", "retailPrice", "updatedAt", "wholesalePrice" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "variation_types_slug_key" ON "variation_types"("slug");

-- CreateIndex
CREATE INDEX "variation_type_values_variation_type_id_idx" ON "variation_type_values"("variation_type_id");

-- CreateIndex
CREATE INDEX "product_variation_types_variation_type_id_idx" ON "product_variation_types"("variation_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variant_values_variation_type_value_id_idx" ON "product_variant_values"("variation_type_value_id");

-- Data migration: crear una variante default por cada producto existente
INSERT INTO "product_variants" ("product_id", "sku", "stock", "retail_price", "wholesale_price", "is_default")
SELECT "id", COALESCE("sku", 'P-' || "id"), "stock", "retailPrice", "wholesalePrice", 1 FROM "Product";
