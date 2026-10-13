# STATUS

更新：2026-10-13

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `chore/tailwind-canonical-lint`（#73）：ESLint 加入 `eslint-plugin-better-tailwindcss`，只開 `enforce-canonical-classes`（ADR-0021），現有違規已修正。已推上，等使用者說「合併」。

## 下一步

- 合併後用 `curl` 確認 dev server 的 CSS 含 `group-has-focus-visible`（R2）。
- 瀏覽器實測會寫入資料庫時，先 `sqlite3 prisma/dev.db ".backup <scratchpad>/dev-backup.db"`，測完 `.restore`；使用者改過的主題在資料庫裡，不要用 seed 覆蓋。
- 使用者確認 #72 的調整後關閉 #72。
- 合併 PLAN-006 後依序規劃：PLAN-007 = #52（LLM 匯入）、PLAN-008 = #42（食材價格與營養）、PLAN-009 = #53（雙語介面）。issue 標題有預定編號，交接資訊在各 issue 留言。API 金鑰已在 `.env`（`ANTHROPIC_API_KEY`）。
- 其他候選：#56、#57、#71。
- 2026-10-26 之後處理 #32。

## 卡點與待決定

- 編輯卡的轉場（↗、Next）先做成「往下收、從下方冒出」，使用者在考慮是否要改。
- Tab / Shift+Tab 只在第一個欄位或整列被選取時切換「內容 ↔ 小標」，其他欄位的 Tab 照常換欄；使用者若想改再調整。
