# STATUS

更新：2026-10-26

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

PLAN-011 食譜資料夾（#114）已合併進 `main`（CI 通過）。

文件系統首次同步 docs-system 模板，在分支 `chore/docs-system-sync`，CI 通過，**等使用者確認後合併**。CLAUDE.md、`.claude/rules/`、`doc-audit` 與三份索引的模板段落改成受管區塊；計畫流程移到 `.claude/rules/plans.md`；CLAUDE.md 新增「完成定義」「不可復原的操作」「驗收方式」三個固定區段，編號規則改為第 12 節。

## 下一步

- 使用者看過 `chore/docs-system-sync` 後合併。
- PLAN-011 的視覺參數都標「待校準」：資料夾高度、tab 尺寸、打孔、營養卡位置（`globals.css` 的 Recipe folder 區塊），動畫與抽紙手感（`src/features/recipe/folder-motion.ts`），各主題的後層資料夾顏色（必要時在 `menu-themes.ts` 填 `primaryDeep`）。
- 候選：#124、#125、#126（PLAN-011 的已知限制）、#58 編輯時間與筆記、#113、#109、#110、#108、#111、#32。

## 卡點與待決定

- 合併 PLAN-011 時 dev server 沒開，R2 的 CSS 檢查沒做；下次開 dev server 若畫面停在舊樣式，照 R2 處理。
- 「不可復原的操作」的專案特有四條（`dev.db` 等資料、schema / migrate / seed、字串清單值與 JSON 格式、付費 API）是 Claude 寫的初稿，待使用者確認；其中 schema / migrate 從「先備份」（R10）升級為「先問」。
- 模板 `coding-core` 寫「能寫成純函式就附測試」，但專案目前沒有測試框架；要不要加測試待決定（加套件屬於不可復原的操作）。
- Avgolemono 有 5 個標題是「Note / 注意」的步驟，以及最後一組提示（Serve fresh 等），都還是步驟；要不要也移到食譜筆記，等使用者決定。
- 營養卡分頁標籤用字典既有的 Nutrition / 營養（示意圖寫 NUTRITIONS）。
- `seed-data.json` 的範例資料沒有補重點與時間（範例只在資料庫缺資料時補）。
- PLAN-008、PLAN-009 留下的待確認項目（新單位中文、價格不完整的標記、娃娃菜譯名、#72 等）：同前。
