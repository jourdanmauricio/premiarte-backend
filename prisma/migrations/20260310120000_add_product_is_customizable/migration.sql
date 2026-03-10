-- Add isCustomizable to Product
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
    "isCustomizable" BOOLEAN NOT NULL DEFAULT 0,
    "retailPrice" INTEGER NOT NULL,
    "wholesalePrice" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sku" TEXT,
    "priceUpdatedAt" DATETIME,
    "priceUpdated" TEXT,
    "variants" TEXT,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);

INSERT INTO "new_Product" (
    "id",
    "name",
    "description",
    "stock",
    "isActive",
    "isFeatured",
    "retailPrice",
    "wholesalePrice",
    "slug",
    "categoryId",
    "createdAt",
    "updatedAt",
    "sku",
    "priceUpdatedAt",
    "priceUpdated",
    "variants"
)
SELECT
    "id",
    "name",
    "description",
    "stock",
    "isActive",
    "isFeatured",
    "retailPrice",
    "wholesalePrice",
    "slug",
    "categoryId",
    "createdAt",
    "updatedAt",
    "sku",
    "priceUpdatedAt",
    "priceUpdated",
    "variants"
FROM "Product";

DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

PRAGMA foreign_keys=ON;

