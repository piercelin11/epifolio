# ADR-0006：字體以 next/font 載入，Tailwind 依用途命名

日期：2026-10-11
狀態：Proposed

## 背景

菜單書需要兩種以上字體（標題類與內文），之後還可能換字體或加入新字體（例如價格用的數字字體）。希望在 Tailwind 中能直接用 class 呼叫，且換字體時不必修改元件。

先前專案 rankify 用 `next/font` 載入字體，但 CSS 變數以字形類別命名（`--font-serif`），實際載入的卻是 Geist Mono，名稱與內容脫節。

## 決策

- 用 `next/font/google`（或 `next/font/local`）載入字體，全部集中在 `src/lib/fonts.ts`。
- `next/font` 產生的 CSS 變數以「來源」命名（`--font-heading-src`、`--font-body-src`）。
- `src/app/globals.css` 的 `@theme inline` 把「用途」對應到來源：`--font-heading`、`--font-sans`。
- 元件只使用用途 class（`font-heading`），內文不加 class，由 `<html>` 預設的 `font-sans` 套用。
- 換字體只改 `src/lib/fonts.ts`；新增用途時，`fonts.ts` 加一個字體、`globals.css` 加一行對應。

目前使用的字體見 `src/lib/fonts.ts`。

## 考慮過的替代方案

- Fontsource（npm 套件 + CSS `@import`）：版本可鎖定、可改 `@font-face`，但每換一個字體要裝或移除套件，版面跳動（CLS）的處理要自己做。本專案不需要這些控制。
- Google Fonts `<link>`：最簡單，但會連到外部、沒有自動優化。
- 依字體名命名 class（`font-rufina`）：直觀，但換字體時要修改所有使用處。

## 後果

- 字體由 Next.js 在建置時下載並從本站提供，執行時不連到 Google。
- 元件與字體解耦：換字體不改元件。
- 字體實際可用的字重受字體本身限制（例如只有 400 / 700 的字體，`font-medium` 不會有效果）。

## 相關

PLAN-001（菜單書版面與視覺基礎）
