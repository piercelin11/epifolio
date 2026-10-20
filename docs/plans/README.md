# 計畫（Plans）

做之前寫的規格。檔名 `PLAN-NNN-<slug>.md`。完成後 `status: done`，持久知識遷移到 `docs/features/` 與 `docs/adr/`。

狀態流轉：`draft` → `approved`（使用者確認）→ `in-progress` → `done`。
進度只記在 GitHub Issues，計畫檔不勾選任務。

## 索引

| 編號     | 標題 | 狀態 | 父 issue |
| -------- | ---- | ---- | -------- |
| [PLAN-001](PLAN-001-menu-book-layout.md) | 菜單書版面與視覺基礎 | done | #5 |
| [PLAN-002](PLAN-002-paper-stack.md) | 紙張堆疊版面與換紙動畫 | done | #13 |
| [PLAN-003](PLAN-003-menu-books.md) | 多本菜單書與菜單總覽 | done | #23 |
| [PLAN-004](PLAN-004-recipe-layout-and-ingredient-card.md) | 食譜紙排版、份數換算與食材卡片 | done | #33 |
| [PLAN-005](PLAN-005-database.md) | 資料庫基礎與菜單書主題切換 | done | #44 |
| [PLAN-006](PLAN-006-menu-recipe-editor.md) | 菜單與食譜編輯卡 | done | #61 |
| [PLAN-007](PLAN-007-llm-import.md) | LLM 匯入食譜 | done | #52 |
| [PLAN-008](PLAN-008-ingredient-editing.md) | 食材卡片翻面編輯、單位換算、料理成本與營養 | done | #42 |
| [PLAN-009](PLAN-009-bilingual-ui.md) | 雙語介面與語言切換 | done | #53 |
| [PLAN-010](PLAN-010-ingredient-matching.md) | 匯入的食材對應改由程式比對 | done | #85 |
| [PLAN-011](PLAN-011-recipe-folder.md) | 食譜資料夾 | done | #114 |

## 模板

````markdown
---
status: draft            # draft | approved | in-progress | done
branch: plan-NNN-slug
issue:                   # 父 issue 編號，approved 後填寫
created: YYYY-MM-DD
---

# PLAN-NNN：標題

## 目標
為什麼做、解決什麼問題

## 非目標
這次不做的事

## 驗收條件
- 可驗證的條件（子 issue 的驗收依據）

## 邊界情況
空狀態、錯誤、極端輸入

## 設計摘要
資料、流程、介面的重點；有取捨之處連到 ADR

## 任務拆解
1. 任務（→ 對應一張子 issue，approved 後在此填入編號）
2. 任務

## 完成後遷移清單
- [ ] 功能頁：docs/features/xxx.md
- [ ] ADR：docs/adr/xxxx-xxx.md
- [ ] glossary 新詞
````
