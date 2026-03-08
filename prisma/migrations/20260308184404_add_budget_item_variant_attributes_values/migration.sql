-- Ajuste: Prisma puede haber detectado drift; en SQLite Json se almacena como TEXT.
-- No redefinir Product.variants ni cambiar tipos; solo asegurar BudgetItem con columnas TEXT para JSON.
-- (Si las columnas ya existen por la migración anterior, este archivo puede quedar como no-op o fallar en ADD COLUMN;
--  en ese caso aplicar manualmente o marcar como aplicada.)

-- En SQLite, las columnas attributes y values ya fueron añadidas como TEXT en 20260308184252.
-- Esta migración no modifica datos; Prisma con SQLite usa TEXT para Json.
