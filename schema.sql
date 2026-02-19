CREATE TABLE Budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerId INTEGER NOT NULL,
  observation TEXT,
  totalAmount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  userId TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  expiresAt DATETIME,
  approvedAt DATETIME,
  rejectedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, type TEXT, responsibleId INTEGER,
  FOREIGN KEY (customerId) REFERENCES Customer(id)
);
CREATE INDEX idx_budget_customer_id ON Budget(customerId);
CREATE INDEX idx_budget_status ON Budget(status);
CREATE INDEX idx_budget_created_at ON Budget(createdAt);
CREATE INDEX idx_budget_user_id ON Budget(userId);
CREATE INDEX idx_budget_responsible_id ON Budget(responsibleId);

CREATE TABLE "BudgetItem" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budgetId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  price INTEGER NOT NULL, -- precio unitario en centavos al momento de la cotización
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- precio total del item (price * quantity)
  observation TEXT, -- observaciones específicas del item
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, retailPrice INTEGER NOT NULL DEFAULT 0, wholesalePrice INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (budgetId) REFERENCES Budget(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);
CREATE INDEX idx_budget_item_budget_id ON BudgetItem(budgetId);

CREATE TABLE Category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  imageId INTEGER NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imageId) REFERENCES Image(id)
);

CREATE TABLE Contact (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Customer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'retail' CHECK (type IN ('wholesale', 'retail')),
  document TEXT, -- opcional
  address TEXT, -- opcional
  observation TEXT, -- opcional
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_customer_email_unique ON Customer(email);
CREATE INDEX idx_customer_type ON Customer(type);
CREATE INDEX idx_customer_created_at ON Customer(createdAt);

CREATE TABLE Image (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  tag TEXT,
  observation TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
, publicId TEXT);

CREATE TABLE NewsletterSubscriber (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        isActive BOOLEAN DEFAULT TRUE,
        subscribedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        unsubscribedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
CREATE UNIQUE INDEX idx_newsletter_email_unique ON NewsletterSubscriber(email);

CREATE TABLE "Order" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        totalAmount INTEGER NOT NULL,
        observation TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES Customer(id)
      );

CREATE TABLE OrderItem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  price INTEGER NOT NULL,
  retailPrice INTEGER NOT NULL,
  wholesalePrice INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  observation TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);
CREATE INDEX idx_order_item_order_id ON OrderItem(orderId);

CREATE TABLE Product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stock INTEGER NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  isFeatured BOOLEAN DEFAULT FALSE,
  retailPrice INTEGER NOT NULL,
  wholesalePrice INTEGER NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  categoryId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, sku TEXT, priceUpdatedAt DATETIME, priceUpdated TEXT,
  FOREIGN KEY (categoryId) REFERENCES Category(id)
);
CREATE UNIQUE INDEX idx_product_sku_unique ON Product(sku) WHERE sku IS NOT NULL;

CREATE TABLE ProductCategory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE,
  UNIQUE(productId, categoryId) -- Evita duplicados
);
CREATE INDEX idx_product_category_product ON ProductCategory(productId);
CREATE INDEX idx_product_category_category ON ProductCategory(categoryId);

CREATE TABLE ProductImage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  imageId INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0, -- Para ordenar las imágenes del producto
  isPrimary BOOLEAN DEFAULT FALSE, -- Para marcar la imagen principal
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (imageId) REFERENCES Image(id) ON DELETE CASCADE,
  UNIQUE(productId, imageId) -- Evita duplicados
);
CREATE INDEX idx_product_image_product ON ProductImage(productId);
CREATE INDEX idx_product_image_image ON ProductImage(imageId);
CREATE INDEX idx_product_image_primary ON ProductImage(productId, isPrimary);

CREATE TABLE ProductRelated (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        relatedProductId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
        FOREIGN KEY (relatedProductId) REFERENCES Product(id) ON DELETE CASCADE,
        UNIQUE(productId, relatedProductId)
      );

CREATE TABLE Responsible (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cuit TEXT NOT NULL UNIQUE,
  condition TEXT NOT NULL,
  observation TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_responsible_cuit_unique ON Responsible(cuit);
CREATE INDEX idx_responsible_created_at ON Responsible(createdAt);
CREATE TABLE Setting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
