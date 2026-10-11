# STATUS

更新：2026-10-11

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `feat/menu-layout-refine`（已 push，尚未合併）：紙張捲動時蓋過頁首；菜單紙在畫面置中，食譜紙依菜單紙定位（左緣縮在菜單紙內、右緣超出打孔區加兩個紙張內距、稍微往下錯開）；兩張紙各有自己的材質與透明度；食譜紙預設顯示菜單第一個品項；菜單版面依參考圖調整，右上角顯示廚師名稱；內文字體改 Inter。使用者正在手動微調字級、顏色與間距。功能說明見 [紙張堆疊](features/paper-stack.md)。

## 下一步

- 使用者繼續微調；紙張位置與材質參數在 `src/app/globals.css`（`--paper-base-width`、`--paper-padding`、`--paper-inset-x`、`--paper-offset-x`、`--paper-offset-y`、`--paper-texture-*`、type scale），菜單間距在 `src/features/menu/components/`。
- 確認後合併進 `main`。
- 之後的候選：大類之間的切換（#21）、窄螢幕版面（#10）。

## 卡點與待決定

目前沒有。
