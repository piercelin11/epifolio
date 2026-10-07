# Git 流程與 Commit 規範

## 分支

- **在 `main` 上絕不直接改**。每個新任務開始前先 `git branch --show-current` 確認分支：
  - 一律從最新的 `main` 開新分支（命名見 `CLAUDE.md` 第 6 節），不要在未合併的分支上疊新分支。
  - 當前分支還有未合併的完成工作，或分支名與新任務主題明顯不符 → 先停下來問使用者：
    - (B) 先把當前分支合併回 `main`，再從 `main` 開新分支 ← **預設建議**
    - (C) 在當前分支繼續（僅限同一主題的延續）
    - (A) 從當前分支直接切新分支 ← 僅在使用者明確要求時使用，並說明兩份工作會綁在一起
  - 分支名相符且無未合併的完成工作，或使用者已說「就在這改」→ 直接做，不用每次問。

## Commit 與 push

- **Commit 由 Claude 自行處理**：完成一個邏輯變更、通過品質檢查（`CLAUDE.md` 第 9 節）後就 commit，不需要每次詢問。
- **每次 commit 後立刻 push 並檢查 CI**（CI 對所有分支的 push 觸發）：
  1. `git push -u origin <branch>`（第一次）/ `git push`（之後）
  2. `gh run watch $(gh run list --branch <branch> --limit 1 --json databaseId -q '.[0].databaseId') --exit-status`
  3. 通過 → 繼續。失敗 → `gh run view <run-id> --log-failed` 讀錯誤，依下面分級處理。

## CI 失敗分級

- **小問題 → 直接修正**：格式、lint、型別錯誤、漏產生的檔案、CI 設定本身的錯誤等，修法明確且不改變功能行為或設計。在同一分支**補一筆新的 commit**，重新 push 並再次確認 CI 通過，完成後在回覆中簡短告知使用者「CI 抓到什麼、怎麼修的」。
- **大問題 → 停下來回報使用者**：需要改變功能行為、資料結構（Prisma schema）、架構或相依套件版本；原因不明或無法在本機重現；同一問題修了兩次仍失敗。回報內容包含失敗步驟、錯誤摘要、推測原因與建議修法，等使用者決定再動手。

## 歷史保持線性

- **不改寫已推上遠端的歷史**：不 `commit --amend` 已 push 的 commit、不 `git push --force`。唯一例外是合併前 rebase 自己的分支後，用 `git push --force-with-lease` 更新該分支；`main` 永遠不 force push。
- 合併一律 `--ff-only`，不產生 merge commit。

## 合併（使用者的決定）

使用者沒說不要自己合併；使用者一說「合併 / merge / 提交並合併」就執行：

1. 確認該分支最新一次 CI 為通過（未通過先依上面分級處理）
2. `git checkout main && git pull --ff-only && git merge --ff-only <branch>`
   （`--ff-only` 失敗代表 `main` 已前進：回分支 `git rebase main`、`git push --force-with-lease`、等 CI 通過後再合併）
3. `git push origin main`，確認 `main` 的 CI 通過
4. `git branch -d <branch> && git push origin --delete <branch>`

不開 PR、不走 code review 流程。

## Commit message 規範

格式（全英文）：

```
type(scope): imperative summary in lowercase

Optional paragraph: why the change was made, its scope, and anything
deliberately left out.

- What changed, one logical change per bullet
- Keep identifiers and file paths as-is (RecipeForm, src/lib/db.ts)

Optional: how it was verified.

Closes #12
```

- **type**（僅限）：`feat` / `fix` / `refactor` / `perf` / `style` / `docs` / `chore` / `ci`
  - `style` 指格式調整（不影響邏輯），UI 視覺調整屬於 `feat` 或 `fix`
- **scope**：功能模組名（如 `menu`、`recipe`、`ui`、`db`、`theme`、`config`、`docs`）。跨兩個模組用逗號（`menu,recipe`）；跨更多模組則省略 scope。不要用動作當 scope（如 `fix(merge)`）。
- **header**：祈使語氣（`add` 不是 `added`）、小寫開頭、不加句號、不超過 72 字元。
- **body**：每行約 72 字元換行；條列只寫「改了什麼」，不重複 header。小改動可以只有 header。
- **issue footer**：有對應 issue 時，最後一行寫 `Refs #N`（進行中）或 `Closes #N`（完成）。
- 修改 Prisma schema 時，body 註明 migration 名稱。
- 一個 commit 只做一個邏輯變更。
- **不要加 `Co-Authored-By` 或任何 AI 署名 trailer。**

範例：

```
feat(recipe): add reference link list to recipe form

- RecipeForm uses useFieldArray for dynamic link rows
- recipeSchema validates each entry with z.url()
- Add ReferenceLink model (migration: add_reference_link)

Closes #7
```
