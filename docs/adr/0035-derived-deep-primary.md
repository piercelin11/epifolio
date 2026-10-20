# ADR-0035：後層資料夾的顏色由主題色推算，主題可覆寫

日期：2026-10-20
狀態：Accepted

## 背景

PLAN-011 的後層資料夾要用主題主色（`primary`）的深色版。可以每個主題多填一個顏色，也可以由主色推算。ADR-0008 的原則是主題只存基本色，其餘在 `[data-menu-theme]` 區塊推算。

## 決策

- 在 `globals.css` 的 `[data-menu-theme]` 區塊以 CSS 相對色語法推算 `--primary-deep`：`oklch(from var(--primary) …)`，降低亮度、保留彩度與色相。降低多少見該區塊。
- `MenuThemeColors` 加選填的 `primaryDeep`；有填就覆寫推算結果，給推算不好看的主題微調。

## 考慮過的替代方案

- 每個主題都填一個深色：可逐一調整，但新增主題的成本變高，之後使用者自訂配色也要多選一個顏色。
- `color-mix()` 混黑色：寫法與現有推算一致，但混黑會讓顏色變灰。
- Sass 或 JS 色彩套件（例如 culori）在 TS 計算：多一個相依套件，且推算結果要另外傳進 CSS。

## 後果

- 需要支援 CSS 相對色語法的瀏覽器（Chrome 119、Safari 18、Firefox 128 以上）。
- `menuThemeStyle()` 只在有 `primaryDeep` 時才輸出 `--primary-deep`，否則保留 CSS 推算。

## 相關

計畫：[PLAN-011](../plans/PLAN-011-recipe-folder.md)；[ADR-0008](0008-menu-theme-colors.md)；`src/features/menu-theme/menu-themes.ts`、`src/app/globals.css`
