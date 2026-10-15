# 功能總覽

每個功能一頁，記錄「現在怎麼運作」。功能完成時才建立頁面。

| 功能     | 狀態 | 最後更新 |
| -------- | ---- | -------- |
| [紙張堆疊](paper-stack.md) | draft | 2026-10-12 |
| [菜單書架](menu-shelf.md) | draft | 2026-10-13 |
| [食材卡片](ingredient-card.md) | draft | 2026-10-12 |
| [編輯卡](editor.md) | draft | 2026-10-13 |
| [食譜匯入](recipe-import.md) | draft | 2026-10-13 |
| [雙語介面](bilingual-ui.md) | draft | 2026-10-15 |

## 功能頁模板

新增功能頁時複製下面的結構（frontmatter 與章節都要保留）：

````markdown
---
status: draft            # draft | stable
updated: YYYY-MM-DD
source:                  # 對應的程式碼路徑
  - path/to/code
adr: []                  # 相關決策，例如 [0001, 0003]
plan: PLAN-NNN
---

# 功能名稱

## 一句話
這個功能回答什麼問題

## 流程
（Mermaid 流程圖）

## 規則 / 狀態
（表格）

## 參數
參數見 `<設定檔路徑>`。（標註「已確認」或「待校準」）

## 已知限制
（同時開 issue 標 `known-limitation`）

## 相關連結
ADR、plan、issue
````
