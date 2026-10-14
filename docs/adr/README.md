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
| 0010 | [Tailwind 改用 @tailwindcss/postcss 整合](0010-tailwind-postcss.md) | Accepted | 2026-10-12 |
| 0011 | [食材獨立成目錄，用量以 id 引用](0011-ingredient-catalog.md) | Accepted | 2026-10-12 |
| 0012 | [食材卡片放進紙張的捲動內容，開啟時依螢幕定位](0012-ingredient-card-layer.md) | Accepted | 2026-10-12 |
| 0013 | [雙語內容以欄位層 JSON 存放](0013-localized-json-fields.md) | Accepted | 2026-10-12 |
| 0014 | [先建一個預設使用者，使用者資料帶 userId](0014-default-user.md) | Accepted | 2026-10-12 |
| 0015 | [步驟文字分段，以用量行 id 引用用量](0015-step-text-references-lines.md) | Accepted | 2026-10-12 |
| 0016 | [主題與單位存字串，由程式碼清單驗證](0016-code-lists-as-strings.md) | Accepted | 2026-10-12 |
| 0017 | [編輯卡是書架上的狀態機，以 pushState 同步網址](0017-editor-cards-with-push-state.md) | Accepted | 2026-10-13 |
| 0018 | [拖曳排序使用 @dnd-kit/core 與 @dnd-kit/sortable](0018-dnd-kit-sortable.md) | Accepted | 2026-10-13 |
| 0019 | [從菜單移除品項時保留食譜](0019-remove-from-menu-keeps-recipe.md) | Accepted | 2026-10-13 |
| 0020 | [文具圖片放 public/stationery，與材質分開](0020-stationery-assets.md) | Accepted | 2026-10-13 |
| 0021 | [以 eslint-plugin-better-tailwindcss 檢查 Tailwind class 的標準寫法](0021-tailwind-eslint-plugin.md) | Accepted | 2026-10-13 |
| 0022 | [LLM 匯入用 Anthropic SDK 與 Claude Haiku 5.5，只產生草稿](0022-llm-import-with-haiku.md) | Accepted（部分由 0026 取代） | 2026-10-13 |
| 0023 | [網址匯入由伺服器抓網頁，先讀 JSON-LD，再抽正文](0023-url-import-extraction.md) | Accepted | 2026-10-13 |
| 0024 | [單位清單加入 pinch、cup、slice、piece，保留原文單位](0024-more-units.md) | Accepted | 2026-10-13 |
| 0025 | [匯入的新食材在食譜存檔時寫入，營養標記為估計值](0025-imported-ingredients.md) | Accepted | 2026-10-13 |
| 0026 | [匯入的食材對應改由程式比對，LLM 只整理食譜](0026-ingredient-matching-pipeline.md) | Accepted | 2026-10-14 |

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
