---
paths:
  - 'docs/**/*.md'
---

# 文件撰寫規範

<!-- docs-system:begin docs-rules v1 -->

- 語言：繁體中文；程式碼識別字、檔名、指令保持英文。
- 一件事只寫在一個地方。要引用別處的內容就放連結，不複製。
- 不手抄參數；寫「參數見 `<程式碼路徑>`」。
- `docs/` 內的文件互相引用用相對連結；引用 `docs/` 以外的程式碼路徑用行內程式碼（`` `src/config.ts` ``），不要寫成 markdown 連結。
- 功能頁（`docs/features/*.md`）一律使用固定模板，frontmatter 包含 `status`、`updated`、`source`、`adr`、`plan`。修改功能頁時同步更新 `updated`（`YYYY-MM-DD`）。
- 決策放 `docs/adr/`，一個決策一個檔，用 `docs/adr/README.md` 的模板；功能頁只放一行 ADR 連結。
- 待辦、進度、路線圖不得出現在 md 檔，一律在 GitHub Issues。
- 流程與狀態圖用 Mermaid；規則、因子、狀態用表格。
- 每份文件控制在一到兩頁；超過就拆分，不要寫成流水帳。
- 新增文件後，更新對應索引（`features/index.md`、`adr/README.md`、`plans/README.md`）。
<!-- docs-system:end docs-rules -->

## 專案補充

- `docs/` 以外的程式碼路徑寫成 markdown 連結時，`mkdocs build --strict` 會判定為無效連結。
- 新增文件後，除了索引，也要更新 `docs/index.md` 的導覽。
