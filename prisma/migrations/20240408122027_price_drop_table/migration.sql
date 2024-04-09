-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_priceDrop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "originalPrice" TEXT NOT NULL,
    "oldPriceDrop" TEXT,
    "priceDrop" TEXT,
    "dropRangeFrom" TEXT NOT NULL,
    "dropRangeTo" TEXT NOT NULL,
    "dropTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_priceDrop" ("createdAt", "dropRangeFrom", "dropRangeTo", "dropTime", "id", "oldPriceDrop", "originalPrice", "priceDrop", "productHandle", "productId", "productVariantId", "shop", "title") SELECT "createdAt", "dropRangeFrom", "dropRangeTo", "dropTime", "id", "oldPriceDrop", "originalPrice", "priceDrop", "productHandle", "productId", "productVariantId", "shop", "title" FROM "priceDrop";
DROP TABLE "priceDrop";
ALTER TABLE "new_priceDrop" RENAME TO "priceDrop";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
