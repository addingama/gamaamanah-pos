-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- AlterTable Product: buyPrice, categoryId (keep legacy "category" for backfill)
ALTER TABLE "Product" ADD COLUMN "buyPrice" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

-- Backfill Category from legacy string column
INSERT INTO "Category" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT
    lower(hex(randomblob(8))) || lower(hex(randomblob(8))),
    trim("category"),
    NULL,
    datetime('now'),
    datetime('now')
FROM "Product"
WHERE "category" IS NOT NULL AND trim("category") != ''
GROUP BY lower(trim("category"));

UPDATE "Product"
SET "categoryId" = (
    SELECT c."id"
    FROM "Category" c
    WHERE lower(trim(c."name")) = lower(trim("Product"."category"))
    LIMIT 1
)
WHERE "category" IS NOT NULL;

-- Redefine Product: drop "category", add FK
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "price" INTEGER NOT NULL,
    "buyPrice" INTEGER NOT NULL DEFAULT 0,
    "stock" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "skuNorm" TEXT,
    "barcodeNorm" TEXT,
    "nameNorm" TEXT NOT NULL DEFAULT '',
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" (
    "id", "sku", "barcode", "name", "unit", "price", "buyPrice", "stock", "isActive",
    "skuNorm", "barcodeNorm", "nameNorm", "categoryId", "createdAt", "updatedAt"
)
SELECT
    "id", "sku", "barcode", "name", "unit", "price", "buyPrice", "stock", "isActive",
    "skuNorm", "barcodeNorm", "nameNorm", "categoryId", "createdAt", "updatedAt"
FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
CREATE INDEX "Product_nameNorm_idx" ON "Product"("nameNorm");
CREATE INDEX "Product_skuNorm_idx" ON "Product"("skuNorm");
CREATE INDEX "Product_barcodeNorm_idx" ON "Product"("barcodeNorm");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
