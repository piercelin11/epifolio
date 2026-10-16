-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" JSONB NOT NULL,
    "aliases" JSONB NOT NULL,
    "image" TEXT,
    "priceAmount" REAL,
    "priceQuantity" REAL,
    "priceUnit" TEXT,
    "calories" REAL,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "nutritionEstimated" BOOLEAN NOT NULL DEFAULT false,
    "defaultUnit" TEXT,
    "unitWeights" JSONB NOT NULL DEFAULT '{}',
    "density" REAL,
    "unitsEstimated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- A price unit such as "100 g" becomes quantity 100 and unit "g".
INSERT INTO "new_Ingredient" ("aliases", "calories", "carbs", "createdAt", "fat", "id", "image", "name", "nutritionEstimated", "priceAmount", "priceQuantity", "priceUnit", "protein", "updatedAt")
SELECT "aliases", "calories", "carbs", "createdAt", "fat", "id", "image", "name", "nutritionEstimated", "priceAmount",
    CASE WHEN instr(trim("priceUnit"), ' ') > 0 THEN CAST(substr(trim("priceUnit"), 1, instr(trim("priceUnit"), ' ') - 1) AS REAL) WHEN "priceUnit" IS NOT NULL THEN 1 END,
    CASE WHEN instr(trim("priceUnit"), ' ') > 0 THEN trim(substr(trim("priceUnit"), instr(trim("priceUnit"), ' ') + 1)) ELSE "priceUnit" END,
    "protein", "updatedAt" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "position" INTEGER NOT NULL,
    CONSTRAINT "MenuItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("description", "id", "name", "position", "recipeId", "sectionId") SELECT "description", "id", "name", "position", "recipeId", "sectionId" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE INDEX "MenuItem_sectionId_position_idx" ON "MenuItem"("sectionId", "position");
CREATE INDEX "MenuItem_recipeId_idx" ON "MenuItem"("recipeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

