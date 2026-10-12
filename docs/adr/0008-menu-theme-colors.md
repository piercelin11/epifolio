# ADR-0008：菜單主題的配色放在 TS 設定檔，以 CSS 變數套用

日期：2026-10-12
狀態：Accepted

## 背景

PLAN-003 讓首頁有多本菜單書，每本有自己的配色（`MenuTheme`）。之後可能讓使用者新增菜單、挑選或自訂配色，配色要能存進資料庫。同時移除了深色模式，全站只剩一組預設配色。

## 決策

- 配色定義在 `src/features/menu-theme/menu-themes.ts`：每組只有菜單紙底色、文字、大標（兼食譜紙底色）、食譜紙文字四個基本色，加上兩種紙張的材質透明度。書以 `themeId` 引用配色。
- 套用方式是把基本色寫成 inline CSS 變數，放在標有 `data-menu-theme` 的元素上：`<html>` 套第一組作為網站預設，每本書各自套自己的。
- 其餘 shadcn 語意 token（`card`、`popover`、`muted`、`border`…）在 `globals.css` 的 `:root, [data-menu-theme]` 區塊用 `color-mix()` 由基本色推算。CSS 變數在宣告處就解析，所以推算必須在每個套用配色的元素上重新宣告，不能只寫在 `:root`。
- 元件只用語意 token，不需要知道自己在哪一本書。

## 考慮過的替代方案

- 在 `globals.css` 為每組寫 `[data-menu-theme="olive"]` 區塊：顏色與其他 token 放在一起，但 id 要在 CSS 與 TS 各寫一次，且使用者自訂的配色無法事先寫進 CSS。
- 每組配色完整填寫 shadcn 的二十多個 token：可逐一微調，但新增一組配色的成本高，目前菜單上也用不到。

## 後果

- 基本色不在 `globals.css`；調整配色要改 `menu-themes.ts`。
- 推算出的 `card`、`popover` 等顏色與原本手填的值略有差異，只影響對話框、toast 等介面元件。
- 新增會隨配色變動的 token 時，要加在 `menu-themes.ts` 或 `[data-menu-theme]` 推算區塊，見 `.claude/rules/coding.md`。

## 相關

PLAN-003、#25、`src/features/menu-theme/`、`src/app/globals.css`、`src/app/layout.tsx`
