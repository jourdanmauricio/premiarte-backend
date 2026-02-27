-- Migración: añadir campo "number" a Budget (número secuencial para PDF/display).
-- Los presupuestos existentes reciben 400, 401, 402... ordenados por createdAt.
-- SQLite: ADD COLUMN no permite NOT NULL fácilmente sin recrear tabla; se deja nullable
-- pero la migración asigna valor a todos. Los nuevos los genera el servicio.

-- 1. Añadir columna (nullable para poder hacer backfill)
ALTER TABLE "Budget" ADD COLUMN "number" INTEGER;

-- 2. Asignar 400, 401, 402... a presupuestos existentes (orden por createdAt, id como desempate)
UPDATE "Budget"
SET "number" = 400 + (
  SELECT COUNT(*) FROM "Budget" b2
  WHERE (b2."createdAt" < "Budget"."createdAt")
     OR (b2."createdAt" = "Budget"."createdAt" AND b2."id" < "Budget"."id")
);

-- 3. Índice único para evitar duplicados
CREATE UNIQUE INDEX "Budget_number_key" ON "Budget"("number");
