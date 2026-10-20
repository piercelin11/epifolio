@AGENTS.md

# epifolio

食譜記錄 + 有獨特 UI 與動畫的餐廳菜單。個人本機使用。
技術棧：Next.js 16、React 19、TypeScript 5、Tailwind CSS v4、shadcn（Base UI）、Prisma 7 + SQLite（版本以 `package.json` 為準）。文件站：MkDocs Material。

## 1. 工作階段規則

- 溝通一律繁體中文（回覆、提問、狀態更新）。
- 開始：先讀 `docs/STATUS.md`，再 `gh issue list` 看待辦，依任務讀相關文件（見第 2 節）。
- 結束或中斷前：**覆蓋更新** `docs/STATUS.md`（現在在做什麼 / 下一步 / 卡點與待決定）。只寫現況，不累加歷史。
- 不確定就先問，一次問完，不要臆測需求。
- 重大取捨（資料模型、儲存方式、套件選型）：先提 ADR 草稿請使用者確認，再實作。
- 不擅自擴大範圍：發現額外問題就開 issue，不順手改。
- 小改動（不超過一個檔案、沒有取捨）直接做，不需要計畫或 issue。

## 2. 文件地圖

| 文件                         | 用途                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `docs/STATUS.md`             | 交接筆記：現在在哪、下一步、卡點                         |
| `docs/vision.md`             | 目標、使用者、非目標、優先順序                           |
| `docs/architecture.md`       | 系統總覽、資料流、目錄結構、設計原則                     |
| `docs/glossary.md`           | 領域詞彙與對應的程式碼識別字                             |
| `docs/features/`             | 每個功能「現在怎麼運作」（Reference）                    |
| `docs/adr/`                  | 決策紀錄：為什麼選 A 不選 B                              |
| `docs/plans/`                | 計畫（規格）：做之前寫，完成後封存                       |
| GitHub Issues                | 待辦、優先序、「明確不做」（唯一來源）                   |
| `.claude/rules/git.md`       | 分支、push 與 CI、合併、commit 規範（每次載入）          |
| `.claude/rules/coding.md`    | 技術棧細節與程式碼規範（操作 `src/`、`prisma/` 時載入）  |
| `.claude/rules/docs.md`      | 文件撰寫規範（操作 `docs/` 時載入）                      |

## 3. 常用指令

- 開發：`pnpm dev`（使用者自己開著，port 3000；**不要自己起 / 殺 dev server**，驗證用 `curl`；dev server 開著時不跑 `pnpm build`，見 R2）
- 建置：`pnpm build` / `pnpm start`
- 檢查：`pnpm typecheck`（`next typegen` + `tsc`）、`pnpm lint`、`pnpm format:check`（修正用 `pnpm format`）
- 資料庫：`pnpm exec prisma migrate dev --name <name>`、`pnpm exec prisma validate`、`pnpm exec prisma db seed`（只補缺少的範例資料，不刪除也不覆蓋）；備份：`pnpm db:backup`（複製到 `backups/`，還原見 `docs/runbook.md`）
- 文件站預覽：`pnpm docs:serve`；建置檢查：`pnpm docs:build`（需先建 `.venv`，見 `README.md`）
- 文件健檢：`/doc-audit`（只出報告，不自動修改）

## 4. 目錄結構

- `src/app/`：路由（`api/recipe-import/` 為食譜匯入的 Route Handler）；`src/components/ui/`：shadcn 元件；`src/components/`：共用元件
- `src/features/<feature>/`：功能模組（`data/` 讀資料庫、`actions/` 為 Server Actions；`recipe-import/server/` 呼叫 LLM 與抓網頁）；`src/lib/`：共用函式庫（`db.ts` 為 Prisma 單例、`current-user.ts`、`i18n/` 雙語內容、介面語言與字典）；`src/components/locale-switch.tsx`：頁首語言切換
- `src/generated/prisma/`：Prisma 產出（gitignored）；`prisma/`：schema、migrations、`seed.ts` 與 `seed-data.json`
- `public/`：靜態檔（`textures/` 紙張與卡紙材質；`stationery/` 長尾夾、迴紋針等文具；`ingredients/` 食材目錄照片；`uploads/` 上傳圖片，gitignored）
- `docs/`：專案文件（MkDocs）；`.claude/`：Claude 規則與指令；`.github/`：CI 與 issue 模板；`scripts/`：工具腳本（`db-backup.ts`）；`backups/`：資料庫備份（gitignored）

新增重要目錄時同步更新本節與 `docs/architecture.md`。

## 5. 程式碼規範

- 語言：識別字、檔名、註解、commit 訊息、`README.md` 用英文；`docs/` 文件與溝通用繁體中文；**UI 顯示文字一律放字典**（`src/lib/i18n/messages/`，中英都要寫，ADR-0029），元件不寫死文字；server 端要給使用者看的訊息傳 `ErrorMessage` key。
- 領域詞彙一律使用 `docs/glossary.md` 的對應英文識別字，不自創同義詞。
- 資料與呈現分離：資料模型與商業邏輯放在不依賴 UI 的模組，元件只負責呈現。
- 樣式與主題用 design tokens（CSS variables / Tailwind theme）管理，不在元件內寫死顏色與頁面尺寸。
- 需要互動展示的核心邏輯（如份數換算）：寫成純函式、參數集中單一設定檔，Artifact 或文件引用同一份。
- **TODO**：Claude 不新增 `TODO`/`FIXME` 註解，發現新工作就開 issue；使用者自己寫的 `TODO` 不得刪除。
- 技術棧細節與其餘規範見 `.claude/rules/coding.md`。

## 6. 工作流程

- 一切工作以 GitHub Issue 追蹤。開工前：`gh issue view <編號>`，依驗收條件做。
- 分支：計畫工作用 `plan-NNN-<slug>`；其他用 `feat/<slug>`、`fix/<slug>`、`refactor/<slug>`、`chore/<slug>`、`docs/<slug>`。
- **不開 PR**：每次 commit 後 push 並檢查 CI，使用者說「合併」才 fast-forward 合併進 `main`。細節見 `.claude/rules/git.md`。
- 關聯 issue：commit body 結尾寫 `Refs #<編號>`（進行中）或 `Closes #<編號>`（完成），推到 `main` 時 GitHub 自動關閉。
- 開 issue：使用 `.github/ISSUE_TEMPLATE/` 的格式（目標、驗收條件、不做的事、相關文件），用 `gh issue create`。
- 決定不做的事：關閉 issue（`gh issue close <編號> --reason "not planned"`）並標 `wontfix`，附理由。
- 已知限制：功能頁寫「已知限制」，同時開 issue 標 `known-limitation`。

## 7. 單一來源原則

| 資訊                   | 唯一存放處                                           |
| ---------------------- | ---------------------------------------------------- |
| 待辦、優先序、明確不做 | GitHub Issues（不得出現在任何 md 檔）                |
| 做了什麼、何時做的     | git commit（含 `Closes #N` 連結到 issue）            |
| 現在怎麼運作           | `docs/features/`                                     |
| 為什麼這樣決定         | `docs/adr/`（功能頁只放連結）                        |
| 權重、門檻、參數       | 程式碼中的單一設定檔（文件引用路徑，不手抄數字）     |
| 專有名詞定義           | `docs/glossary.md`                                   |
| 規則與踩雷             | 本檔第 10 節                                         |

## 8. 計畫（docs/plans/）：自動辨識，使用者不用指示

**辨識意圖**

- 使用者說「規劃／設計／想一下 X」→ 建立計畫。
- 使用者說「開始做／執行計畫／繼續」→ 執行計畫。
- 使用者用編號指稱還沒有計畫檔的計畫（例如「plan7」）→ `gh issue list --search "[PLAN-007] in:title"` 找標題有該預定編號的 issue，讀它的留言後建立計畫，計畫檔用這個編號。

**建立計畫**

1. `ls docs/plans/` 取得下一個編號，建立 `PLAN-NNN-<slug>.md`（模板見 `docs/plans/README.md`），並更新其索引。
2. 需求有模糊處，先問最少必要的問題。
3. 填寫：目標、非目標、驗收條件、邊界情況、設計摘要、任務拆解。frontmatter `status: draft`。
4. 摘要給使用者確認；**確認前不寫程式**。

**執行計畫** — 找對應計畫的順序：

1. 目前分支名含 `plan-NNN` → 就是那份。
2. 在 `main` 且只有一份 `status` 為 `approved` 或 `in-progress` → 就是那份。
3. 有多份 → 列出來請使用者選。

使用者確認後（`draft` → `approved`）：

- 建立父 issue（label `plan`，連到計畫檔），任務拆解建立為子 issue，把 issue 編號寫回計畫 frontmatter，從 `main` 建立分支 `plan-NNN-<slug>`，`status: in-progress`。子 issue 先查 `gh` 目前支援的做法；無法自動化時，改用父 issue 的任務清單（`- [ ] #編號`）並告知使用者。
- 逐一完成子 issue（commit 寫 `Closes #子issue`）；進度只記在 issue，不在計畫檔勾選。
- 全部完成：`status: done`，把持久知識遷移到 `docs/features/` 與 `docs/adr/`，關閉父 issue，更新 `docs/STATUS.md`。
- 同時有多條計畫分支時：先合併的直接 fast-forward，後合併的必須先 `git rebase main`（見 `.claude/rules/git.md`）。

## 9. 完成定義與文件維護觸發表

每次 commit 前：`pnpm typecheck`、`pnpm lint`、`pnpm format:check` 通過（改 schema 加 `prisma validate`；改 `docs/` 且有 `.venv` 加 `pnpm docs:build`）。push 後 CI 通過。功能完成前另需下表對應文件已更新。

| 發生什麼事                             | 必須更新                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| 功能完成                               | `docs/features/` 對應頁（含 `updated`、`source`）、`features/index.md`、glossary 新詞 |
| 做了「選 A 不選 B」的取捨              | 新增 ADR（更新 `adr/README.md` 索引），功能頁加連結                           |
| 架構、目錄、資料流變動                 | `docs/architecture.md`、本檔第 4 節                                           |
| 被使用者糾正或踩雷                     | 本檔第 10 節新增一條編號規則（能自動檢查者附上對應 lint）                     |
| 接入第一個外部 API 或新增資料源        | 建立或更新 `docs/data-sources.md`                                             |
| 出現第一個維運步驟（部署、排程、排查） | 建立或更新 `docs/runbook.md`                                                  |
| 新增或修改 scripts、安裝步驟、環境變數、技術棧 | `README.md`（英文）；環境變數另加 `.env.example`                     |
| 範圍改變                               | `docs/vision.md` 的「非目標」                                                 |
| 發現新工作                             | 開 issue（不寫 TODO、不建 md 待辦）                                           |
| 每次對話結束                           | 覆蓋 `docs/STATUS.md`                                                         |

## 10. 絕對不要做的事與編號規則

**絕對不要**

- 提交 `.env` 或任何金鑰；force push 到 `main`；跳過 hooks；在 commit 加 `Co-Authored-By` 等 AI 署名。
- 在 md 檔建立待辦清單或進度紀錄；在文件中手抄權重、門檻等參數。
- 沒有計畫與確認就動手做大功能；擅自擴大範圍。
- 把食譜與菜單品項混為同一個資料結構（見 `docs/architecture.md`）。

**編號規則**（每次被糾正或踩雷後新增，格式：`R<編號>. 規則（原因，日期）`）

- R1. 型別檢查用 `pnpm typecheck`，不直接跑 `tsc`（乾淨環境缺 `next typegen` 產生的 `LayoutProps` 等型別，CI 曾因此失敗，2026-10-07）
- R2. 改 `src/app/globals.css` 後，以及任何會改寫該檔的 git 操作（`checkout`、`merge`、`rebase`、`pull`）後，用 `curl` 確認 dev server 送出的 CSS 已包含變更；沒有就再對該檔做一次實際內容修改，仍無效請使用者重啟 dev server。dev server 開著時不跑 `pnpm build`（dev server 曾兩次漏讀 `globals.css` 變更、畫面停在舊樣式，其中一次與 build 無關，2026-10-11；合併時 `checkout main` 讓 dev server 編譯到舊版、`merge` 換回新版又漏讀，畫面變回舊樣式，2026-10-12）
- R3. commit 的 `style` type 只用於不影響畫面的程式碼格式調整；調整 UI 視覺（字級、顏色、間距等 token 或 class）一律用 `feat` 或 `fix`（曾把手動微調字級標成 `style`，2026-10-12）
- R4. 用無頭瀏覽器驗證點擊時，先用 `document.elementFromPoint` 確認點擊位置最上層的元素就是目標，或送出真正的滑鼠事件；不要只呼叫 `element.click()`，它不經過點擊判斷，抓不到被其他元素蓋住的情況（menu 按鈕被全高的書本容器蓋住，測試卻通過，2026-10-12）
- R5. dev server 漏讀 `globals.css` 的原因是 `@tailwindcss/turbopack` 只用 mtime 判斷是否重新編譯，已改用 `@tailwindcss/postcss`（ADR-0010）；之前推測的「`sed` 以新檔取代原檔」不成立。改用後若仍漏讀，停下來問使用者，不要只靠重複修改繞過（改用 Edit 工具後仍連續漏讀，讀原始碼查明原因，2026-10-12）
- R6. 改 Prisma schema 後，`migrate dev` 之外還要跑 `pnpm exec prisma generate`，並請使用者重啟 dev server：Prisma 7 的 `migrate dev` 不會自動 generate，而 `src/lib/db.ts` 在開發時把 client 存在 `globalThis`，熱更新不會換掉它（`MenuItem.price` 改選填後型別仍是必填；generate 之後 dev server 仍用舊 client，寫入 `price: null` 失敗，2026-10-13）
- R7. Server Component 不要把 JSX 元素存成模組層級常數再傳給 Client Component（每次 render 重新建立，或寫成元件）：React 開發模式在元素上記錄 key 驗證狀態，同一個物件跨請求重複使用，`refresh()` 後會出現誤報的「Each child in a list should have a unique key」（`page.tsx` 的 `title`，存檔時間歇出現，加網路延遲才能穩定重現，2026-10-13）
- R8. **測試的 API 花費上限：單次執行累計不超過 US$0.03。** 「單次執行」指使用者下一次指示到 Claude 回報完成之間，不是整個對話。測試會呼叫付費 API（目前是食譜匯入的 Claude API）時，每次呼叫後讀回應的 `usage.costUsd` 累加；下一次呼叫前，若「已花費 + 上一次的花費」可能超過上限，先停下來詢問使用者是否繼續，並報告已花費的金額。拿不到實際花費時（回應沒有 `usage`）視同可能超過，先問（使用者明確要求，2026-10-13）
- R9. 頁首的站名 epifolio 與 menu 按鈕屬於版頭設計，切到中文也維持英文；翻譯介面時不要動它們（PLAN-009 把 menu 譯成「菜單」被糾正，2026-10-16）
- R10. 改 Prisma schema、跑 `migrate` 或 seed、大量修改資料庫內容之前，先跑 `pnpm db:backup`（`dev.db` 是 gitignored，食譜與食材只存在這個檔案；使用者要求避免資料遺失，2026-10-20）
