# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

PLAN-004（父 issue #33）在分支 `plan-004-recipe-layout-and-ingredient-card`：食譜紙排版、份數換算與勾選、選填小標、食材卡片都已完成並通過 CI，文件已遷移（ADR-0011、ADR-0012、`features/ingredient-card.md`）。只剩 #39 的食材照片。

## 下一步

- 使用者提供食材照片 → 裁成 4:3、960×720 webp，放 `public/ingredients/<ingredientId>.webp`，在 mock JSON 的 `ingredients[].image` 填路徑，實測卡片圖片後關閉 #39、計畫改 `done`、關閉 #33。
- 使用者確認畫面後說「合併」才合併進 `main`。
- 2026-10-26 之後處理 #32。

## 卡點與待決定

- 等使用者提供食材照片。
