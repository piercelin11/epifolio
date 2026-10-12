# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `chore/tailwind-postcss`（#31，未合併）：Tailwind 從 `@tailwindcss/turbopack` 改用 `@tailwindcss/postcss`，解決 dev server 漏讀 `globals.css`（[ADR-0010](adr/0010-tailwind-postcss.md)）。已完成並驗證：重啟 dev server 後，連續快速修改 `globals.css`（Edit 工具連改三次、`sed` 0.1 秒內寫兩次）都能讀到最後一次。

## 下一步

- 等使用者說「合併」。合併後若 R2 的 curl 驗證一段時間都沒再漏讀，可考慮簡化 R2。
- 筆電版面微調已合併進 `main`；可調 token 在 `src/app/globals.css`。食譜相關字級 token 等使用者設計好食譜 UI 再討論。
- 其他候選：窄螢幕版面（#10）、新增菜單的表單與資料庫（尚未開 issue）。

## 卡點與待決定

- 無。
