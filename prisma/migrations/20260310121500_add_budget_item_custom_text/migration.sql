-- Add customText to BudgetItem
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
    "customText" TEXT,
    "attributes" TEXT,
    "values" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retailPrice" INTEGER NOT NULL DEFAULT 0,
    "wholesalePrice" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_BudgetItem" (
    "id",
    "budgetId",
    "productId",
    "variantId",
    "price",
    "quantity",
    "amount",
    "observation",
    "attributes",
    "values",
    "createdAt",
    "updatedAt",
    "retailPrice",
    "wholesalePrice"
)
SELECT
    "id",
    "budgetId",
    "productId",
    "variantId",
    "price",
    "quantity",
    "amount",
    "observation",
    "attributes",
    "values",
    "createdAt",
    "updatedAt",
    "retailPrice",
    "wholesalePrice"
FROM "BudgetItem";

DROP TABLE "BudgetItem";
ALTER TABLE "new_BudgetItem" RENAME TO "BudgetItem";

CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

PRAGMA foreign_keys=ON;

