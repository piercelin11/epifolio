# STATUS

更新：2026-10-14

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `plan-010-ingredient-matching`：PLAN-010（#85，匯入的食材對應改由程式比對，ADR-0026）已完成（`status: done`），CI 通過，等使用者說「合併」。合併時 commit 中的 `Closes` 會關閉 #85、#90。

結果：LLM 不再收到食材目錄，每行給標準名稱、同義詞與營養，由 `matchLine` 比對；確認卡有 Suggested 與「可能是」。模型改為不思考（開啟思考時偶爾提早結束答案、漏掉步驟，實測見 ADR-0022 補充）。食材目錄在 `prisma/dev.db` 有 60 筆，未寫進 `seed-data.json`（重跑 seed 會消失，使用者已同意）。

## 下一步

- 使用者說「合併」後依 `.claude/rules/git.md` 合併；合併後用 `curl` 確認 dev server 的 CSS（R2）。
- 之後：PLAN-008（#42 食材價格與營養）、PLAN-009（#53 雙語介面）；其他候選 #56、#57、#71；匯入的已知限制 #82–#84；2026-10-26 之後處理 #32。
- 測試會呼叫 API 時遵守 R8（單次執行 ≤ US$0.03，從回應的 `usage.costUsd` 累加）。開發模式的原始回應在 `.recipe-import-responses/`。

## 卡點與待決定

- 食材確認卡外觀由 Claude 依現有 UI 先做（底色 `--editor-review-card` 暫與菜單卡同色），使用者之後再調整。
- 使用者確認 #72 的調整後關閉 #72。
- 編輯卡轉場、Tab / Shift+Tab 行為：使用者在考慮是否要改。
