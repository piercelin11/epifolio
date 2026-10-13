# STATUS

更新：2026-10-13

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `plan-007-llm-import`：PLAN-007（#52 LLM 匯入食譜）計畫草稿已寫好（`docs/plans/PLAN-007-llm-import.md`，`status: draft`），等使用者確認。

已和使用者談定：Haiku 5.5；來源 Text / Photo（圖片、PDF）/ URL（伺服器抓網頁）；不保留原文、不記 token；單位加 pinch / cup / slice / piece；空數量顯示 To taste；獨立的食材卡（全部對上就跳過），新食材預填營養估計；載入用 shadcn `Spinner`。食材卡外觀先由 Claude 依現有 UI 設計，使用者之後再調整。

## 下一步

- 使用者確認計畫與「設計摘要 5. 待確認」的 ADR 提案後：寫 ADR、`status: approved`，#52 加 label `plan` 當父 issue，建立子 issue。
- 實作前載入 claude-api skill 確認 SDK 寫法；讀 `node_modules/next/dist/docs/` 確認 Route Handler。
- 實測會花 API 費用，先告知使用者；會寫入資料庫的測試先 `sqlite3 prisma/dev.db ".backup <scratchpad>/dev-backup.db"`，測完 `.restore`。
- 之後：PLAN-008 = #42、PLAN-009 = #53；其他候選 #56、#57、#71；2026-10-26 之後處理 #32。

## 卡點與待決定

- 計畫中的 ADR 提案（套件、網頁抽取、單位、`nutritionEstimated`、食材寫入時機）待確認。
- 使用者確認 #72 的調整後關閉 #72。
- 編輯卡轉場、Tab / Shift+Tab 行為：使用者在考慮是否要改。
