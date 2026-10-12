# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

[PLAN-003 多本菜單書與菜單總覽](plans/PLAN-003-menu-books.md) 在分支 `plan-003-menu-books`，子 issue #24–#29 已完成，CI 通過，尚未合併。功能說明見 [菜單書架](features/menu-shelf.md)。

## 下一步

- 使用者實測總覽滾輪卡點（`wheel-gestures`，#30）：保留 → 寫 ADR-0009、關閉 #30；不保留 → 移除套件，改用自寫門檻 + 冷卻。
- #30 決定後：PLAN-003 改 `status: done`、關閉父 issue #23，等使用者說「合併」。
- 動畫參數（`src/features/menu-shelf/shelf-motion.ts`）與總覽 token（`globals.css`）待使用者校準。

## 卡點與待決定

- `wheel-gestures` 去留（#30）。
