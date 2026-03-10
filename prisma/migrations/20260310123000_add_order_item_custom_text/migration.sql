-- Add customText to OrderItem
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" TEXT,
    "price" INTEGER NOT NULL,
    "retailPrice" INTEGER NOT NULL,
    "wholesalePrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "observation" TEXT,
    "customText" TEXT,
    "attributes" TEXT,
    "values" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_OrderItem" (
    "id",
    "orderId",
    "productId",
    "variantId",
    "price",
    "retailPrice",
    "wholesalePrice",
    "quantity",
    "amount",
    "observation",
    "attributes",
    "values",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "orderId",
    "productId",
    "variantId",
    "price",
    "retailPrice",
    "wholesalePrice",
    "quantity",
    "amount",
    "observation",
    "attributes",
    "values",
    "createdAt",
    "updatedAt"
FROM "OrderItem";

DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

PRAGMA foreign_keys=ON;

