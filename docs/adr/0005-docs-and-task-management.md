# ADR-0005：文件與任務管理採用 Issues + git + STATUS + plans

日期：2026-10-07
狀態：Accepted

## 背景

本專案主要與 LLM（Claude Code）協作。每次對話都從空白開始，需要靠文件快速進入狀況。先前的專案（stock-agent）使用 `ROADMAP.md` 記待辦、`PROGRESS.md` 記進度，兩者都依賴 AI 記得手動更新，常與實際狀態脫節；CLAUDE.md 也因累積過多細節而膨脹到難以遵守。

## 決策

每種資訊只存在一個地方：

| 資訊                 | 存放處                                                 |
| -------------------- | ------------------------------------------------------ |
| 待辦、優先序、不做   | GitHub Issues（commit 寫 `Closes #N` 自動關閉）        |
| 做了什麼、何時做的   | git commit 歷史                                        |
| 現在在哪、下一步     | `docs/STATUS.md`（覆蓋式，不累加歷史）                 |
| 做之前的規格         | `docs/plans/`（完成後持久知識遷移到 features / ADR）   |
| 為什麼這樣決定       | `docs/adr/`                                            |
| 現在怎麼運作         | `docs/features/`                                       |

CLAUDE.md 控制在 150 行內，細部規則拆到 `.claude/rules/`；文件以 MkDocs Material 本機預覽，`/doc-audit` 定期檢查文件與程式碼是否一致。

## 考慮過的替代方案

- `ROADMAP.md` + `PROGRESS.md`：待辦勾選與進度紀錄要人工同步，容易過期；兩份檔案內容又與 commit 歷史重疊。
- 只靠 CLAUDE.md：規則、現況、待辦混在一起，篇幅失控後 AI 遵守度下降。

## 後果

- 開新對話時，Claude 先讀 `docs/STATUS.md` 再 `gh issue list`；需要 `gh` 已登入。
- md 檔不得出現待辦清單或進度紀錄；發現新工作一律開 issue。
- 每次對話結束都要覆蓋 `docs/STATUS.md`，否則交接資訊會過期（`/doc-audit` 會檢查）。

## 相關

`CLAUDE.md` 第 1、7、8、9 節、`.claude/rules/docs.md`、`.claude/commands/doc-audit.md`
