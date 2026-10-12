# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

沒有進行中的功能分支。PLAN-004（食譜紙排版、份數換算與勾選、選填小標、食材卡片）與後續調整（#43）已合併進 `main`。

## 下一步

- dev server 重新啟動後，用 `curl` 確認送出的 CSS 含 `--text-subheading`、`--paper-scroll-bleed`、`--ingredient-card-texture-opacity: 0.7`（R2）。
- 其他食材照片：給原圖即可，轉成 4:3、960×720 webp 放 `public/ingredients/<ingredientId>.webp`，並在 mock JSON 填 `image`。
- 候選：#42（食材價格、成本與營養，規劃資料庫時處理）、#10（窄螢幕）。
- 2026-10-26 之後處理 #32。

## 卡點與待決定

- 無。
