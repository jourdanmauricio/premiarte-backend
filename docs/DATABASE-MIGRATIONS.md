# Migraciones de Base de Datos - Prisma + Turso

## Arquitectura

- **`dev.db`**: Base de datos SQLite local para desarrollo y generación de migraciones
- **Turso**: Base de datos de producción (libSQL)
- **Prisma**: ORM que genera migraciones contra SQLite local

## Flujo de trabajo para cambios en la BD

### 1. Modificar el schema

Edita `prisma/schema.prisma` con los cambios deseados:

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Int      // <- nuevo campo
  // ...
}
```

### 2. Crear la migración (local)

```bash
npx prisma migrate dev --name nombre_descriptivo
```

Esto:

- Genera el archivo SQL en `prisma/migrations/[timestamp]_nombre_descriptivo/migration.sql`
- Aplica la migración a `dev.db` (local)
- Regenera el cliente de Prisma

### 3. Revisar la migración generada

Abre el archivo generado y verifica que el SQL sea correcto:

```bash
cat prisma/migrations/[timestamp]_nombre_descriptivo/migration.sql
```

### 4. Aplicar la migración a Turso (producción)

```bash
turso db shell premiarte-db < prisma/migrations/[timestamp]_nombre_descriptivo/migration.sql
```

### 5. Verificar en Turso

```bash
turso db shell premiarte-db ".schema nombre_tabla"
```

---

## Comandos útiles

| Comando                                 | Descripción                           |
| --------------------------------------- | ------------------------------------- |
| `npx prisma migrate dev --name xxx`     | Crear y aplicar migración local       |
| `npx prisma migrate dev --create-only`  | Solo crear archivo, no aplicar        |
| `npx prisma generate`                   | Regenerar cliente Prisma              |
| `npx prisma studio`                     | Abrir GUI para ver datos (usa dev.db) |
| `turso db shell premiarte-db`           | Shell interactivo de Turso            |
| `turso db shell premiarte-db ".schema"` | Ver schema completo en Turso          |

---

## Ejemplo completo: Agregar campo `discount` a Product

```bash
# 1. Editar prisma/schema.prisma
# Agregar: discount Int @default(0)

# 2. Crear migración
npx prisma migrate dev --name add_product_discount

# 3. Verificar el SQL generado
cat prisma/migrations/*_add_product_discount/migration.sql
# Output: ALTER TABLE "Product" ADD COLUMN "discount" INTEGER NOT NULL DEFAULT 0;

# 4. Aplicar a Turso
turso db shell premiarte-db < prisma/migrations/*_add_product_discount/migration.sql

# 5. Verificar
turso db shell premiarte-db "PRAGMA table_info(Product);"
```

---

## Migración Budget.id a UUID (20260214000000_budget_id_uuid)

Esta migración cambia `Budget.id` de `INTEGER` a `TEXT` (UUID). Es una migración manual porque SQLite no permite cambiar el tipo de una columna con `ALTER COLUMN`.

**Aplicar en Turso (producción):**

```bash
turso db shell premiarte-db < prisma/migrations/20260214000000_budget_id_uuid/migration.sql
```

**Si tienes `dev.db` local con datos:** aplica el mismo SQL y marca la migración como aplicada:

```bash
sqlite3 prisma/dev.db < prisma/migrations/20260214000000_budget_id_uuid/migration.sql
npx prisma migrate resolve --applied 20260214000000_budget_id_uuid
npx prisma generate
```

**Si `dev.db` está vacío o puedes recrearlo:** elimínalo y aplica todas las migraciones desde cero, o aplica esta migración y `migrate resolve` como arriba.

---

## Migración Customer.id y Order.id a UUID (20260214100000_customer_order_id_uuid)

Esta migración cambia `Customer.id` y `Order.id` de `INTEGER` a `TEXT` (UUID), y las FKs asociadas: `Budget.customerId`, `Order.customerId`, `OrderItem.orderId`.

**Requisito:** Debe estar aplicada antes la migración `20260214000000_budget_id_uuid` (Budget.id UUID).

**Aplicar en Turso (producción):**

```bash
turso db shell premiarte-db < prisma/migrations/20260215143704_customer_email_optional/migration.sql
```

**Si tienes `dev.db` local con datos:**

```bash
sqlite3 prisma/dev.db < prisma/migrations/20260214100000_customer_order_id_uuid/migration.sql
npx prisma migrate resolve --applied 20260214100000_customer_order_id_uuid
npx prisma generate
```

---

## Notas importantes

1. **Nunca ejecutes `prisma migrate deploy` contra Turso** - no está soportado
2. **Siempre revisa el SQL generado** antes de aplicarlo a producción
3. **Haz backup antes de migraciones destructivas** (DROP, ALTER que elimina datos)
4. **El archivo `dev.db` es solo para desarrollo** - puedes eliminarlo y recrearlo si hay problemas
