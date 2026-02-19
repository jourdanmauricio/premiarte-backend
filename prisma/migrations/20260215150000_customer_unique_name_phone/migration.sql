-- DropIndex (IF EXISTS por si Turso no tuvo la migración que creó este índice)
DROP INDEX IF EXISTS "Customer_email_key";

-- CreateIndex (IF NOT EXISTS para ser idempotente)
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_phone_key" ON "Customer"("phone");
