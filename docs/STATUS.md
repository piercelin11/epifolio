# STATUS

更新：2026-10-11

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `feat/menu-layout-refine`（已 push，CI 通過，尚未合併）：紙張捲動時蓋過頁首；菜單紙變窄並在畫面置中，食譜紙依菜單紙定位（左側露出一個紙張內距，右側露出打孔區加紙張內距）；菜單版面依參考圖調整，右上角顯示廚師名稱；內文字體改 Inter；light `primary` 改 `#b03828`。功能說明見 [紙張堆疊](features/paper-stack.md)。

## 下一步

- 使用者在瀏覽器確認第二輪微調；參數在 `src/app/globals.css`（`--paper-base-width`、`--paper-padding`、`--paper-offset-x`、type scale）與 `src/features/menu/components/`。
- 確認後合併進 `main`。
- 之後的候選：大類之間的切換（#21）、窄螢幕版面（#10）。

## 卡點與待決定

目前沒有。
