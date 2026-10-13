# STATUS

更新：2026-10-13

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `plan-007-llm-import`（PLAN-007，父 issue #52）：所有子任務都已實作並推上，CI 通過。#74–#78 已關閉；#79（匯入卡）、#80（食材確認卡）、#81（文件）等最後一步驗證。

最後一步：瀏覽器實測時，Text 匯入 → 食材確認卡 → 食譜卡都正常，但食譜卡按 Save 沒有寫入。推測是 R6：#76 加了 `Ingredient.nutritionEstimated`，dev server 仍用舊的 Prisma client（用新 client 直接寫入的測試是成功的）。

## 下一步

- 使用者重啟 dev server 後，重跑瀏覽器流程到 Save（腳本在 scratchpad 的 `flow.mjs`，用 puppeteer-core + 本機 Chrome；每次約 US$0.005）。測前 `sqlite3 prisma/dev.db ".backup <scratchpad>/dev-backup.db"`，測完 `.restore`。
- 通過後：計畫 `status: done`、計畫索引更新、關閉 #79 #80 #81 #52，等使用者說「合併」。
- 若 Save 仍失敗：看 toast 與 dev server log，找原因。
- 之後：PLAN-008 = #42、PLAN-009 = #53；其他候選 #56、#57、#71；匯入的已知限制 #82–#84；2026-10-26 之後處理 #32。

## 卡點與待決定

- 食材確認卡外觀由 Claude 依現有 UI 先做（底色 `--editor-review-card` 暫與菜單卡同色），使用者之後再調整。
- 使用者確認 #72 的調整後關閉 #72。
- 編輯卡轉場、Tab / Shift+Tab 行為：使用者在考慮是否要改。
