-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" JSONB NOT NULL,
    "aliases" JSONB NOT NULL,
    "image" TEXT,
    "priceAmount" REAL,
    "priceUnit" TEXT,
    "calories" REAL,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "nutritionEstimated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Ingredient" ("aliases", "calories", "carbs", "createdAt", "fat", "id", "image", "name", "priceAmount", "priceUnit", "protein", "updatedAt") SELECT "aliases", "calories", "carbs", "createdAt", "fat", "id", "image", "name", "priceAmount", "priceUnit", "protein", "updatedAt" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
