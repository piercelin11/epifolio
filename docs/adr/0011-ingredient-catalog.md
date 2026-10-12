# ADR-0011：食材獨立成目錄，用量以 id 引用

日期：2026-10-12
狀態：Accepted

## 背景

PLAN-004 加入食材卡片：點菜單描述或食譜用量中的食材，顯示照片、價格與營養。之後還要用多筆價格算料理成本、用營養算整道菜的營養（#42），且食材資訊可能成為常駐的參考資料，供多位使用者共用。原本 `Ingredient` 指的是食譜中的一行用量（名稱 + 份量字串），沒有地方放食材本身的資料。

## 決策

- 食材（`Ingredient`）是獨立的目錄資料：名稱、照片、價格、營養（每 100 g）。放在 `src/features/ingredient/`。
- 原本的用量改名為 `RecipeIngredient`，欄位改為數值的 `quantity`（單值或範圍）、`unit`、`name`、`note`，並可用 `ingredientId` 引用食材；菜單品項描述改為片段（`DescriptionPart`），片段同樣可用 `ingredientId` 引用。
- 食譜與菜單只存 id，不複製食材資料。用量的 `name` 保留食譜裡的寫法（`Garlic, minced`），與食材名稱分開。
- 目錄照片跟著 app 走，放 `public/ingredients/`（進 git）；使用者上傳的圖片仍依 ADR-0002 放 `public/uploads/`。資料庫化後維持此做法，`Ingredient.image` 存路徑（PLAN-005）；兩種圖片的區分留給 #42。

## 考慮過的替代方案

- 食材資料直接寫在每一行用量：不用新模組，但同一食材在每道食譜各存一份，價格與營養無法統一更新，也算不出成本。
- 保留 `Ingredient` 指用量，食材另取名（如 `IngredientProfile`）：不用改名，但「Ingredient」最自然的意思是食材本身，之後資料庫的 model 也會用這個名字。

## 後果

- 沒有 `ingredientId` 的用量與描述片段照常顯示，只是不能開卡片。
- 份數換算要求數量是數值；mock 的份量字串由 `src/features/recipe/lib/mock-recipes.ts` 解析（PLAN-005 移到 `prisma/seed.ts`），之後的表單要直接輸入數量與單位。
- 價格紀錄、單位換算（「1 單位 = 幾 g」）、成本與營養計算留給 #42。

## 相關

PLAN-004、#34、#42、[食材卡片](../features/ingredient-card.md)、`src/features/ingredient/`、`src/features/recipe/types.ts`
