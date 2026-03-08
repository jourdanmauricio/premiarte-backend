-- Añade variantId, attributes y values a BudgetItem (variantes en producto vía JSON)

ALTER TABLE "BudgetItem" ADD COLUMN "variantId" TEXT;
ALTER TABLE "BudgetItem" ADD COLUMN "attributes" TEXT;
ALTER TABLE "BudgetItem" ADD COLUMN "values" TEXT;
