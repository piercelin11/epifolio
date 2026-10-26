# 計畫（docs/plans/）流程

<!-- docs-system:begin plans v1 -->

## 辨識意圖

- 使用者說「規劃／設計／想一下 X」→ 建立計畫。
- 使用者說「開始做／執行計畫／繼續」→ 執行計畫。

## 建立計畫

1. `ls docs/plans/` 取得下一個編號，建立 `PLAN-NNN-<slug>.md`（模板見 `docs/plans/README.md`），並更新其索引。
2. 需求有模糊處，先問最少必要的問題。
3. 填寫：目標、非目標、驗收條件、邊界情況、設計摘要、任務拆解。frontmatter `status: draft`。
4. 摘要給使用者確認；**確認前不寫程式**。

## 執行計畫

找對應計畫的順序：

1. 目前分支名含 `plan-NNN` → 就是那份。
2. 在 `main` 且只有一份 `status` 為 `approved` 或 `in-progress` → 就是那份。
3. 有多份 → 列出來請使用者選。

使用者確認後（`draft` → `approved`）：

- 建立父 issue（label `plan`，連到計畫檔），任務拆解建立為子 issue，把 issue 編號寫回計畫 frontmatter，從 `main` 建立分支 `plan-NNN-<slug>`，`status: in-progress`。子 issue 先查 `gh` 目前支援的做法；無法自動化時，改用父 issue 的任務清單（`- [ ] #編號`）並告知使用者。
- 逐一完成子 issue（commit 寫 `Closes #子issue`）；進度只記在 issue，不在計畫檔勾選。
- 全部完成：`status: done`，把持久知識遷移到 `docs/features/` 與 `docs/adr/`，關閉父 issue，更新 `docs/STATUS.md`。
- 同時有多條計畫分支時：先合併的直接 fast-forward，後合併的必須先 `git rebase main`（見 `.claude/rules/git.md`）。
<!-- docs-system:end plans -->

## 專案補充

- 使用者用編號指稱還沒有計畫檔的計畫（例如「plan7」）→ `gh issue list --search "[PLAN-007] in:title"` 找標題有該預定編號的 issue，讀它的留言後建立計畫，計畫檔用這個編號。
