-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "price" INTEGER NOT NULL,
    "stock" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "skuNorm" TEXT,
    "barcodeNorm" TEXT,
    "nameNorm" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("createdAt", "id", "isActive", "name", "price", "sku", "unit", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "price", "sku", "unit", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
CREATE INDEX "Product_nameNorm_idx" ON "Product"("nameNorm");
CREATE INDEX "Product_skuNorm_idx" ON "Product"("skuNorm");
CREATE INDEX "Product_barcodeNorm_idx" ON "Product"("barcodeNorm");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
