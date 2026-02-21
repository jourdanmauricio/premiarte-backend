# Premiarte API

API REST del backend de **Premiarte**, construida con [NestJS](https://nestjs.com/) y TypeScript. Gestiona catálogo de productos, clientes, presupuestos, pedidos, responsables y suscripciones, con autenticación JWT y documentación Swagger.

## Requisitos

- **Node.js** >= 22.10.7
- **npm** (o yarn/pnpm)
- Cuenta en [Turso](https://turso.tech/) (base de datos)
- Cuenta en [Cloudinary](https://cloudinary.com/) (almacenamiento de imágenes)

## Instalación

```bash
# Clonar el repositorio (si aplica)
git clone <url-del-repositorio>
cd premiarte-backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env-example .env
# Editar .env con tus valores (ver sección Variables de entorno)

# Generar cliente Prisma y aplicar migraciones
npx prisma generate
npx prisma migrate dev
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto a partir de `.env-example`:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (ej. 3000) |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `TURSO_DATABASE_URL` | URL de la base de datos Turso |
| `TURSO_AUTH_TOKEN` | Token de autenticación Turso |
| `DATABASE_URL` | URL de conexión usada por Prisma (p. ej. para migraciones) |
| `ADMIN_USER_NAME` | Nombre del usuario administrador inicial |
| `ADMIN_USER_EMAIL` | Email del administrador |
| `ADMIN_USER_PASSWORD` | Contraseña del administrador |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `CLOUDINARY_FOLDER` | Carpeta por defecto para subidas |

## Ejecución

```bash
# Desarrollo (con recarga en caliente)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Debug
npm run start:debug
```

Por defecto el servidor escucha en `http://localhost:3000` (o el `PORT` definido en `.env`).

## API y documentación

- **Prefijo global:** todas las rutas están bajo `/api`.
- **Documentación Swagger:** disponible en `/docs` (p. ej. `http://localhost:3000/docs`).
- **JSON de Swagger:** `/docs/swagger/json`.

La API está protegida con **JWT**. En Swagger puedes autorizarte con el token usando el botón «Authorize» y el esquema **access-token**.

## Estructura del proyecto

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Login y emisión de JWT |
| **Users** | Usuarios del sistema |
| **Categories** | Categorías de productos |
| **Products** | Productos (precios, stock, imágenes, categorías) |
| **Images** | Imágenes (subida a Cloudinary) |
| **Customers** | Clientes (minorista/mayorista, importación) |
| **Budgets** | Presupuestos y líneas de presupuesto |
| **Orders** | Pedidos y líneas de pedido |
| **Responsibles** | Responsables (CUIT, condición) |
| **Settings** | Configuración clave-valor |
| **Subscribe** | Suscripciones a newsletter |

## Base de datos

Se utiliza **Prisma** con adaptador para **Turso** (libSQL). El esquema está en `prisma/schema.prisma`.

```bash
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (opcional)
npx prisma studio
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Compila el proyecto |
| `npm run start` | Inicia la app (modo normal) |
| `npm run start:dev` | Inicia en modo desarrollo con watch |
| `npm run start:prod` | Inicia en modo producción |
| `npm run start:debug` | Inicia en modo debug con watch |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea código con Prettier |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:e2e` | Ejecuta tests e2e |

## Seguridad y CORS

- Se usa **Helmet** para cabeceras HTTP seguras.
- CORS está configurado (origen, métodos y cabeceras permitidas en `main.ts`). Ajusta `origin` en producción según tu frontend.

## Licencia

UNLICENSED (proyecto privado).
