# Premiarte Backend - NestJS (Coolify)
# Puerto por defecto: 6001
# Base Debian (glibc) requerida: @prisma/adapter-libsql/@libsql usa binarios nativos que fallan en Alpine (musl)

FROM node:22-bookworm-slim AS base

# Stage: dependencias
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage: build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de la aplicación
RUN npm run build

# Stage: producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6001

# Instalar Turso CLI (necesario para el backup con turso db shell .dump)
# El instalador oficial falla con exit code por intentar modificar .bashrc en Docker,
# por eso se usa || true y se verifica manualmente que el binario quedó instalado.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates xz-utils \
  && (curl -sSfL https://get.tur.so/install.sh | bash || true) \
  && ln -sf /root/.turso/bin/turso /usr/local/bin/turso \
  && turso --version \
  && apt-get purge -y curl xz-utils && apt-get autoremove -y --purge && rm -rf /var/lib/apt/lists/*

# Copiar artefactos: dist, Prisma y node_modules (incluye Prisma Client ya generado)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Usuario no root
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nestjs
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 6001

# Coolify inyecta las variables de entorno (DATABASE_URL, JWT_SECRET, etc.)
# Opcional: ejecutar migraciones antes de arrancar descomentando la línea siguiente
# y añadiendo prisma a dependencies en package.json
# CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
CMD ["node", "dist/src/main.js"]
