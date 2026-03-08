-- Schema actual del proyecto (refleja Prisma + migraciones aplicadas).
-- Budget/Order con UUID, Customer con email/phone opcionales, User y BackupLog.
-- Variantes almacenadas como JSON en Product.variants.

-- Customer (id UUID) debe existir antes de Budget y Order
CREATE TABLE "Customer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "type" TEXT NOT NULL DEFAULT 'retail',
  "document" TEXT,
  "address" TEXT,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE INDEX "Customer_type_idx" ON "Customer"("type");
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

CREATE TABLE "Budget" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "number" INTEGER NOT NULL,
  "customerId" TEXT NOT NULL,
  "showCuit" BOOLEAN NOT NULL DEFAULT 0,
  "observation" TEXT,
  "totalAmount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "userId" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT 0,
  "expiresAt" DATETIME,
  "approvedAt" DATETIME,
  "rejectedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" TEXT,
  "responsibleId" INTEGER,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);
CREATE UNIQUE INDEX "Budget_number_key" ON "Budget"("number");
CREATE INDEX "Budget_customerId_idx" ON "Budget"("customerId");
CREATE INDEX "Budget_status_idx" ON "Budget"("status");
CREATE INDEX "Budget_createdAt_idx" ON "Budget"("createdAt");
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX "Budget_responsibleId_idx" ON "Budget"("responsibleId");

CREATE TABLE "Image" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "tag" TEXT,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publicId" TEXT
);

CREATE TABLE "Category" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageId" INTEGER NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("imageId") REFERENCES "Image"("id")
);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

CREATE TABLE "Contact" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "NewsletterSubscriber" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT 1,
  "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

CREATE TABLE "Order" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

CREATE TABLE "Product" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "stock" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT 1,
  "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

CREATE TABLE "BudgetItem" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "budgetId" TEXT NOT NULL,
  "productId" INTEGER NOT NULL,
  "variantId" TEXT,
  "price" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "observation" TEXT,
  "attributes" TEXT,
  "values" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "retailPrice" INTEGER NOT NULL DEFAULT 0,
  "wholesalePrice" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
);
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

CREATE TABLE "OrderItem" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "orderId" TEXT NOT NULL,
  "productId" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "retailPrice" INTEGER NOT NULL,
  "wholesalePrice" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

CREATE TABLE "ProductCategory" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "productId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE,
  UNIQUE("productId", "categoryId")
);
CREATE INDEX "ProductCategory_productId_idx" ON "ProductCategory"("productId");
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

CREATE TABLE "ProductImage" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "productId" INTEGER NOT NULL,
  "imageId" INTEGER NOT NULL,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "isPrimary" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE,
  UNIQUE("productId", "imageId")
);
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX "ProductImage_imageId_idx" ON "ProductImage"("imageId");
CREATE INDEX "ProductImage_productId_isPrimary_idx" ON "ProductImage"("productId", "isPrimary");

CREATE TABLE "ProductRelated" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "productId" INTEGER NOT NULL,
  "relatedProductId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("relatedProductId") REFERENCES "Product"("id") ON DELETE CASCADE,
  UNIQUE("productId", "relatedProductId")
);

CREATE TABLE "Responsible" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "cuit" TEXT NOT NULL,
  "condition" TEXT NOT NULL,
  "observation" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Responsible_cuit_key" ON "Responsible"("cuit");
CREATE INDEX "Responsible_createdAt_idx" ON "Responsible"("createdAt");

CREATE TABLE "Setting" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "backup_logs" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "triggered_by" TEXT NOT NULL
);
