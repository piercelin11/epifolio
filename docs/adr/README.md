# 決策紀錄（ADR）

一個決策一個檔案，檔名 `NNNN-<slug>.md`（四位數編號）。只記錄「有取捨的決定」，不記過程細節。

## 索引

| 編號 | 標題                                                       | 狀態     | 日期       |
| ---- | ---------------------------------------------------------- | -------- | ---------- |
| 0001 | [資料庫使用 Prisma 7 + SQLite](0001-prisma-with-sqlite.md) | Accepted | 2026-10-07 |
| 0002 | [圖片存放在本機 public/uploads](0002-local-image-storage.md) | Accepted | 2026-10-07 |
| 0003 | [UI 元件使用 shadcn（Base UI）](0003-shadcn-base-ui.md)     | Accepted | 2026-10-07 |
| 0004 | [翻頁以 motion 與 CSS 3D 自製](0004-custom-page-flip.md)    | Superseded by 0007 | 2026-10-07 |
| 0005 | [文件與任務管理：Issues + git + STATUS + plans](0005-docs-and-task-management.md) | Accepted | 2026-10-07 |
| 0006 | [字體以 next/font 載入，Tailwind 依用途命名](0006-role-based-fonts-with-next-font.md) | Accepted | 2026-10-11 |
| 0007 | [首頁改用紙張堆疊，取代左右跨頁](0007-paper-stack-layout.md) | Accepted | 2026-10-11 |
| 0008 | [菜單主題的配色放在 TS 設定檔，以 CSS 變數套用](0008-menu-theme-colors.md) | Accepted | 2026-10-12 |
| 0009 | [總覽的滾輪卡點使用 wheel-gestures](0009-shelf-wheel-snap.md) | Accepted | 2026-10-12 |

## 模板

````markdown
# ADR-NNNN：用決定本身當標題

日期：YYYY-MM-DD
狀態：Proposed | Accepted | Superseded by ADR-XXXX

## 背景
當時遇到什麼問題、有什麼限制，逼你要做這個決定

## 決策
最後選了哪個方案

## 考慮過的替代方案
- 方案 A：否決理由

## 後果
往後的程式碼與流程因此要遵守什麼；有哪些代價

## 相關
功能頁、plan、issue、程式碼路徑
````
