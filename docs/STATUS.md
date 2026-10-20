# STATUS

更新：2026-10-20

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

PLAN-011 食譜資料夾（#114）已做完，在分支 `plan-011-recipe-folder`，CI 通過，**等使用者確認後合併**。內容：食譜改成固定在畫面底部的資料夾，做法紙與營養卡以 tab 開關，做法紙滾動抽出（ADR-0033）；匯入產生步驟時間、每步重點與筆記（ADR-0034）；後層資料夾顏色由主題推算（ADR-0035）。`prisma/dev.db` 已補齊重點與時間、Porcini 的 Tip 移到筆記（備份 `backups/dev-2026-10-20-163413.db`）。

驗證方式：dev server 沒開，用 `pnpm build` + `next start -p 3100` 搭配無頭 Chrome 檢查（1440×900、1440×1200）。

## 下一步

- 使用者在 dev server 看過後合併；開 dev server 後依 R2 確認 `globals.css` 的變更有送出。
- 視覺參數都標「待校準」：資料夾高度、tab 尺寸、打孔、營養卡位置（`globals.css` 的 Recipe folder 區塊），動畫與抽紙手感（`src/features/recipe/folder-motion.ts`），各主題的後層資料夾顏色（必要時在 `menu-themes.ts` 填 `primaryDeep`）。
- 候選：#124、#125（本計畫的已知限制）、#58 編輯時間與筆記、#113、#109、#110、#108、#111；2026-10-26 之後處理 #32。

## 卡點與待決定

- Avgolemono 有 5 個標題是「Note / 注意」的步驟，以及最後一組提示（Serve fresh 等），都還是步驟；要不要也移到食譜筆記，等使用者決定。
- 營養卡分頁標籤用字典既有的 Nutrition / 營養（示意圖寫 NUTRITIONS）。
- `seed-data.json` 的範例資料沒有補重點與時間（範例只在資料庫缺資料時補）。
- PLAN-008、PLAN-009 留下的待確認項目（新單位中文、價格不完整的標記、娃娃菜譯名、#72 等）：同前。
