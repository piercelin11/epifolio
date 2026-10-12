-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Menu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuId" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "themeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "MenuGroup_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "label" JSONB,
    "position" INTEGER NOT NULL,
    CONSTRAINT "Section_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MenuGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "price" REAL NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "MenuItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "serves" INTEGER,
    "timeMinutes" INTEGER,
    "notes" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngredientGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "label" JSONB,
    "position" INTEGER NOT NULL,
    CONSTRAINT "IngredientGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "quantityMin" REAL,
    "quantityMax" REAL,
    "unit" TEXT,
    "name" JSONB NOT NULL,
    "note" JSONB,
    "position" INTEGER NOT NULL,
    CONSTRAINT "RecipeIngredient_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "IngredientGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "label" JSONB,
    "position" INTEGER NOT NULL,
    CONSTRAINT "StepGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "title" JSONB,
    "minutes" INTEGER,
    "text" JSONB NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "Step_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StepGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferenceLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" JSONB,
    "position" INTEGER NOT NULL,
    CONSTRAINT "ReferenceLink_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingredient" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Menu_userId_idx" ON "Menu"("userId");

-- CreateIndex
CREATE INDEX "MenuGroup_menuId_position_idx" ON "MenuGroup"("menuId", "position");

-- CreateIndex
CREATE INDEX "Section_groupId_position_idx" ON "Section"("groupId", "position");

-- CreateIndex
CREATE INDEX "MenuItem_sectionId_position_idx" ON "MenuItem"("sectionId", "position");

-- CreateIndex
CREATE INDEX "MenuItem_recipeId_idx" ON "MenuItem"("recipeId");

-- CreateIndex
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");

-- CreateIndex
CREATE INDEX "IngredientGroup_recipeId_position_idx" ON "IngredientGroup"("recipeId", "position");

-- CreateIndex
CREATE INDEX "RecipeIngredient_groupId_position_idx" ON "RecipeIngredient"("groupId", "position");

-- CreateIndex
CREATE INDEX "RecipeIngredient_ingredientId_idx" ON "RecipeIngredient"("ingredientId");

-- CreateIndex
CREATE INDEX "StepGroup_recipeId_position_idx" ON "StepGroup"("recipeId", "position");

-- CreateIndex
CREATE INDEX "Step_groupId_position_idx" ON "Step"("groupId", "position");

-- CreateIndex
CREATE INDEX "ReferenceLink_recipeId_position_idx" ON "ReferenceLink"("recipeId", "position");
