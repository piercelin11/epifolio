# STATUS

更新：2026-10-11

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `feat/menu-layout-refine`（已 push，尚未合併）：紙張捲動時蓋過頁首、菜單紙變窄並置中（食譜紙左側露出約一個紙張內距）、菜單版面依參考圖調整、內文字體改 Inter、light `primary` 改 `#b03828`、title 字級移除字距。功能說明見 [紙張堆疊](features/paper-stack.md)。

## 下一步

- 使用者準備提出下一輪微調，已知第一項：食譜紙右側超出菜單紙的距離改為「打孔區 + 紙張內距」。參數在 `src/app/globals.css`（`--paper-padding`、`--paper-overhang`、`--paper-offset-x`、`--paper-base-width`、打孔 token）。
- 微調確認後合併進 `main`。
- 之後的候選：大類之間的切換（#21）、窄螢幕版面（#10）。

## 卡點與待決定

目前沒有。
