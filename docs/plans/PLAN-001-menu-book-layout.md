---
status: draft
branch: plan-001-menu-book-layout
issue:
created: 2026-10-11
---

# PLAN-001：菜單書版面與視覺基礎

## 目標

漸進式開發的第一步：讓首頁就是一本攤開的菜單書，先確立版面、配色與字體，作為之後翻頁、編輯與真實資料的基礎。

## 非目標

- 翻頁動畫（`FlipView` 的互動）
- 窄螢幕版面（本步固定左右兩頁並排）
- 資料庫與 Prisma model
- 點擊品項進入食譜、編輯菜單
- 菜名、描述、價格以外的品項資訊

## 驗收條件

- 首頁整個視窗是菜單，左右兩頁鋪滿，中間以實線表示摺痕。
- 原本獨立的水平 header 移除：網站標題是左頁頁首，色彩模式切換是右頁頁首。
- 品項顯示菜名、描述、價格，依章節分布在左右兩頁。
- 淺色與深色模式各套用指定配色，切換後整頁跟著換。
- 字體依 [ADR-0006](../adr/0006-role-based-fonts-with-next-font.md) 管理：標題、章節名、菜名用 `font-heading`，其他為預設 `font-sans`；換字體只需改 `src/lib/fonts.ts`。
- 元件只依賴 `MenuItem` 等呈現用型別，不直接讀取 mock JSON 的結構。
- `pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 通過。

## 邊界情況

- 品項沒有描述：只顯示菜名與價格，不留空行。
- 章節沒有品項：該章節不顯示。
- 內容超過一頁高度：本步只放少量品項，頁面內可捲動，不做分頁。
- 色彩模式為 system：依作業系統設定套用淺色或深色配色。

## 設計摘要

**配色**（實作後以 `src/app/globals.css` 為準）

| 模式 | background | foreground | primary | border |
| ---- | ---------- | ---------- | ------- | ------ |
| Light | `#E5D8C4` | `#000000` | `#BA3D2C` | `#3E3E3E` |
| Dark | `#3F4328` | `#F2E8D8` | `#DBC437` | `#E2CDAC` |

shadcn 其餘 token（`muted`、`card` 等）由上述顏色調配，摺痕使用 `border` 色。

**字體**：見 [ADR-0006](../adr/0006-role-based-fonts-with-next-font.md)。目前標題類為 Rufina、內文為 IBM Plex Sans。

**資料流**

```mermaid
flowchart LR
    JSON[mock-data.json] --> MAP[轉換函式] --> TYPE[MenuItem 等呈現型別] --> UI[菜單書元件]
```

- 使用者提供的 mock 資料原樣存為 `src/features/menu/mock-data.json`，其餘欄位保留給之後使用。
- mock 資料的 `dishes` 同時含食譜與品項欄位；程式碼只取菜名、描述、價格轉為 `MenuItem`，不把食譜與品項混為同一型別（見 [architecture](../architecture.md)）。

**版面**：左頁放 Starters、Pasta，右頁放 Mains；細部排版之後再調。

## 任務拆解

1. 字體：新增 `src/lib/fonts.ts`，`globals.css` 依用途對應字體
2. 配色：淺色與深色 design tokens
3. 資料：mock JSON 與轉換成 `MenuItem` 的函式
4. 版面：左右兩頁、摺痕、頁首（標題與色彩模式切換）、品項列表

## 完成後遷移清單

- [ ] 功能頁：docs/features/menu-book.md
- [ ] ADR：docs/adr/0006-role-based-fonts-with-next-font.md 改為 Accepted
- [ ] glossary 新詞（如有）
