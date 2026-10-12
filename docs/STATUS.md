# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `chore/tailwind-postcss`（#31，未合併）：Tailwind 從 `@tailwindcss/turbopack` 改用 `@tailwindcss/postcss`，解決 dev server 漏讀 `globals.css`（[ADR-0010](adr/0010-tailwind-postcss.md)）。程式與文件已完成、CI 通過。

## 下一步

- 使用者重啟 `pnpm dev` 後，連續修改 `globals.css` 並用 `curl` 確認每次都讀到；通過後 commit 寫 `Closes #31`，等使用者說「合併」。
- 筆電版面微調已合併進 `main`；可調 token 在 `src/app/globals.css`。食譜相關字級 token 等使用者設計好食譜 UI 再討論。
- 其他候選：窄螢幕版面（#10）、新增菜單的表單與資料庫（尚未開 issue）。

## 卡點與待決定

- 等使用者重啟 dev server 才能驗證 #31。
