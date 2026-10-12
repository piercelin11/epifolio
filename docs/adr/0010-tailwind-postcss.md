# ADR-0010：Tailwind 改用 @tailwindcss/postcss 整合

日期：2026-10-12
狀態：Accepted

## 背景

專案由 create-next-app 建立時，Tailwind 透過 `next.config.ts` 的 Turbopack loader `@tailwindcss/turbopack` 編譯。開發時改 `src/app/globals.css`，dev server 常常送出舊的 CSS，不論用 Edit 工具、`sed` 或手動存檔都會發生（CLAUDE.md R2、R5）。

讀 `@tailwindcss/turbopack` 4.3.3 的原始碼後確認：loader 快取編譯結果，只用檔案 mtime 判斷要不要重新編譯，不比對內容。編譯期間若又存檔，記下的 mtime 會跟舊內容的編譯結果配在一起，下一次編譯就沿用舊結果。`@tailwindcss/postcss` 4.3.3 除了 mtime 之外也比對輸入的 CSS 內容，內容不同就重新編譯。

## 決策

移除 `@tailwindcss/turbopack` 與 `next.config.ts` 的 `turbopack.rules`，改用 `@tailwindcss/postcss` 加 `postcss.config.mjs`。這是 Next.js 官方文件的做法。

## 考慮過的替代方案

- 維持 `@tailwindcss/turbopack`，每次改完用 curl 檢查、漏讀就再改一次：治標不治本，手動存檔一樣會漏讀。
- 維持現狀，等上游修正：時間不確定。

## 後果

- 多一個 `postcss.config.mjs`；`next.config.ts` 不再自訂 CSS loader。
- 改 `globals.css` 後應直接生效。R2 的 curl 驗證保留觀察一段時間。
- 編譯速度差異預期不明顯，未量測。

## 相關

- `next.config.ts`、`postcss.config.mjs`、`package.json`
- `.claude/rules/coding.md`（技術棧：樣式）
- issue #31
