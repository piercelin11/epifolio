---
description: 檢查文件與程式碼的一致性，只產出報告，不修改任何檔案
---

# 文件健檢

<!-- docs-system:begin doc-audit v1 -->

只讀取、不修改。依序檢查並彙整成一份報告：

1. **功能頁來源**：對 `docs/features/*.md`（不含 `index.md`）逐頁讀 frontmatter 的 `source`。
   - `source` 指向的路徑是否仍存在？
   - 用 `git log -1 --format=%cs -- <path>` 取得來源最後修改日期，若晚於該頁的 `updated`，標記為「疑似過期」。
   - 缺少 `status`、`updated`、`source` 任一欄位者標記。
2. **索引完整性**：`docs/features/` 下每個頁面是否都列在 `features/index.md`；`docs/adr/` 下每個 ADR 是否都列在 `adr/README.md`；`docs/plans/` 下每份計畫是否都列在 `plans/README.md`。
3. **連結**：`docs/` 內的相對連結是否指向存在的檔案；行內程式碼中的路徑（`` `src/...` ``）是否存在。有 `mkdocs.yml` 且能執行 `mkdocs build --strict` 時一併執行並彙整警告。
4. **禁止內容**：在 `docs/` 中搜尋 `TODO`、`FIXME`、`待辦`、`- [ ]`（`docs/plans/` 與各 README 模板區塊除外），列出位置；專案根目錄不應有 `ROADMAP.md`、`PROGRESS.md`、`TODO.md`。
5. **CLAUDE.md 篇幅**：扣除空行與 `docs-system` 標記行後，行數是否超過 150（`grep -v -e '^$' -e 'docs-system:' CLAUDE.md | wc -l`）；超過就建議拆去 `.claude/rules/`。
6. **固定區段**：`CLAUDE.md` 是否有「完成定義」「不可復原的操作」「驗收方式」三個區段，且格式符合要求（完成定義一行一個指令）。
7. **STATUS.md**：`更新` 日期是否早於最近一次 commit 日期超過 7 天。
8. **計畫狀態**：`docs/plans/` 下 `status` 為 `done` 的計畫，其內容是否已遷移到 features 或 ADR（檢查是否有對應連結）。
9. **Issue 一致性**：`docs/plans/` 中 `status` 為 `in-progress` 的計畫，其父 issue（frontmatter `issue`）是否仍為 open；`done` 的計畫父 issue 是否已關閉（`gh issue view <編號> --json state`）。
10. **專案補充檢查**：執行下方「專案補充」列出的檢查。

報告格式（繁體中文）：

- 先給一行總結：幾項正常、幾項需處理。
- 再列「需處理」清單，每項包含：檔案路徑、問題、建議做法。
- 最後列「正常」項目的數量即可，不要逐項展開。

結束時詢問使用者要不要依報告逐項修正。
<!-- docs-system:end doc-audit -->

## 專案補充

- 連結檢查：若 `.venv/bin/mkdocs` 存在，執行 `pnpm docs:build` 並彙整警告。
