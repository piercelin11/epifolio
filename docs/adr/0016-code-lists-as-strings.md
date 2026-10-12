# ADR-0016：主題與單位存字串，由程式碼清單驗證

日期：2026-10-12
狀態：Accepted

## 背景

菜單書要記錄套用哪個菜單主題，用量要記錄單位。兩者的選項都定義在程式碼（主題見 ADR-0008；單位要配合份數換算、顯示翻譯與之後的單位換算），而且會隨開發增加。

## 決策

- 資料庫存字串（`themeId`、`unit`），不用 Prisma enum。
- 合法值的唯一來源是程式碼清單：主題在 `src/features/menu-theme/menu-themes.ts`，單位在 `src/features/recipe/units.ts`。寫入時用 zod 依清單驗證。
- 讀到清單外的值不改寫資料庫：主題用預設主題顯示；單位照字串顯示。seed 遇到清單外的單位直接報錯。

## 考慮過的替代方案

- Prisma enum：資料庫層就擋住錯誤值，但每新增一個主題或單位都要 migration，且值要在 schema 與 TS 兩處維護。
- 主題或單位各建一張資料表：可在執行期新增；目前沒有自訂主題或單位的需求。

## 後果

- 移除或改名清單中的值時，要考慮資料庫裡既有的資料（目前以退回預設處理）。
- 之後若要讓使用者自訂主題，再改為資料表並另立 ADR。

## 相關

PLAN-005、ADR-0008、`src/features/menu-theme/menu-themes.ts`、`src/features/recipe/units.ts`
