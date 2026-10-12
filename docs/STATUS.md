# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

PLAN-004 已完成，在分支 `plan-004-recipe-layout-and-ingredient-card`。使用者看過畫面後的調整（#43）已實作並通過 CI：卡片底色與陰影、長尾夾、卡片放進捲動內容、捲動區留白（換紙時打孔跟著轉）、標題字級、連結劃線、servings 寬度固定。

## 下一步

- 使用者確認 #43 的調整，特別是 INGREDIENTS / INSTRUCTIONS 改用 `heading` 字級是否太大；確認後關閉 #43。
- 使用者說「合併」後 fast-forward 合併進 `main`。
- 其他食材照片：給原圖即可，轉成 4:3、960×720 webp 放 `public/ingredients/<ingredientId>.webp`。
- 2026-10-26 之後處理 #32。

## 卡點與待決定

- 標題字級：若 `heading` 太大，可考慮在 type scale 加一級介於 title 與 heading 之間的字級（需使用者決定）。
