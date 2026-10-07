@AGENTS.md

# Epifolio

## 專案目的

可翻頁的自製菜單。菜單可新增、編輯；點進菜單項目可編輯食譜內容（材料、步驟、參考 URL、圖片等）。

## 溝通語言

與使用者的所有互動——回覆內容、提問、澄清、狀態更新——一律使用繁體中文。程式碼、identifier、commit message、檔案路徑等技術產物維持英文。

## 專案指令

- `pnpm dev`：開發伺服器（Turbopack）
- `pnpm build` / `pnpm start`：建置 / 正式環境啟動
- `pnpm lint`：ESLint
- `pnpm format` / `pnpm format:check`：Prettier 格式化 / 檢查
- `pnpm exec tsc --noEmit`：型別檢查
- `pnpm exec prisma generate`：產生 Prisma Client（`pnpm install` 的 `postinstall` 也會自動執行）
- `pnpm exec prisma migrate dev --name <name>`：修改 schema 後建立 migration

## 技術棧

- **框架**：Next.js 16（App Router、Turbopack，預設啟用 `cacheComponents`）+ React 19 + TypeScript 5
- **樣式**：Tailwind CSS v4（`@tailwindcss/turbopack`，無 `tailwind.config`；theme token 全在 `src/app/globals.css`）
- **UI 元件**：shadcn（`base-nova` style，底層為 Base UI `@base-ui/react`，非 Radix）+ `lucide-react` 圖示 + `sonner` toast
  - 新增元件用 `pnpm dlx shadcn@latest add <name>`，放在 `src/components/ui/`
  - Base UI 的組合寫法是 `render` prop（例：`<DropdownMenuTrigger render={<Button />} />`），不是 Radix 的 `asChild`
- **主題**：`next-themes`（`attribute="class"`，light / dark / system），切換元件 `src/components/theme-toggle.tsx`
- **翻頁動畫**：`motion`（Framer Motion）+ CSS 3D transform 自製，不使用現成翻頁套件
- **表單**：`react-hook-form` + `zod`（`@hookform/resolvers/zod`），動態清單（材料、步驟、URL）用 `useFieldArray`；表單 UI 用 shadcn 的 `field` 元件
- **資料庫**：Prisma 7 + SQLite（`@prisma/adapter-better-sqlite3`）
- **套件管理**：pnpm 8.15.4（`packageManager` 鎖定），Node >= 22

## 目錄結構

- `src/app/`：路由
- `src/components/ui/`：shadcn 元件（盡量不改，要客製就包一層）
- `src/components/`：專案共用元件
- `src/features/<feature>/`：功能模組（各自的 components / hooks / lib / actions）
- `src/lib/`：共用函式庫；`src/lib/db.ts` 是 Prisma 單例
- `src/generated/prisma/`：Prisma 產出（gitignored，不要手改）
- `prisma/schema.prisma`、`prisma/migrations/`：schema 與 migration

## 資料庫

- 連線字串在 `.env` 的 `DATABASE_URL`（`file:./prisma/dev.db`），由 `prisma.config.ts` 與 `src/lib/db.ts` 讀取。`.env.example` 是範本。
- Prisma 7 寫法：連線設定在 `prisma.config.ts`（不是 `schema.prisma` 的 `datasource.url`）；`PrismaClient` 必須搭配 driver adapter 建立。
- `src/lib/db.ts` 檔頭有 `import "server-only"`，只能在 Server Component / Server Action import。
- Prisma model 單數命名（`Recipe` 不是 `Recipes`），欄位 camelCase。
- 修改 schema 後：`prisma migrate dev --name <name>`（會一併 generate）。
- **資料存取用 Server Actions**（不建 REST API），回傳可序列化的 plain object（`Date` 先轉字串）。
- `cacheComponents` 啟用時，讀 DB 的元件需要 `<Suspense>` 包裹或 `"use cache"`，**不要用 `export const dynamic`**（與 `cacheComponents` 不相容）。寫之前先讀 `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`。

## 圖片上傳

- 採本機儲存：Server Action 將圖片存進 `public/uploads/`（gitignored），DB 只存相對路徑。
- 所有寫檔集中在單一 `saveImage()` 函式，日後改用雲端儲存（S3 / R2 / Vercel Blob）只需換這一處。
- 前端上傳前先壓縮；顯示用 `next/image`。

## 編碼規範

- **UI 文字語言**：所有顯示在畫面上的文字（按鈕、標籤、提示、錯誤訊息）一律英文。
- **註解**：專業、簡潔，不使用表情符號。
- **TypeScript 型別定義**：
  - 純物件形狀（`{ key: value }` 結構，含 React props、API 資料結構）→ `interface`
  - 其餘（union、intersection、utility types、mapped types、type alias）→ `type`
- **Tailwind class 條件合併**：一律用 `cn()`（`@/lib/utils`），禁止 template literal 或三元字串拼接 class。
- **顏色**：元件只用語意 token（`bg-background`、`text-muted-foreground`、`bg-primary`、`text-destructive`…），不直接寫 `slate-500` / `blue-600` 等色階，確保 light / dark 都正確。新增語意色時在 `globals.css` 的 `:root` 與 `.dark` 各加一組，並在 `@theme inline` 註冊。
- **禁止事項**：不要移除程式碼中的 `TODO`。

## 品質檢查流程

- **改完任何 `.ts` / `.tsx` 後，回報完成前一律執行**：
  1. `pnpm exec tsc --noEmit`
  2. `pnpm lint`
  3. `pnpm format:check`（有格式問題直接 `pnpm format` 修正）
- 修改 `prisma/schema.prisma` 後另外執行 `pnpm exec prisma validate`。
- 錯誤與警告都要在回報前處理乾淨，不要留給使用者。
- 以上與 `.github/workflows/ci.yml` 的檢查項目一致，本機通過即代表 CI 會通過。
- **不要自己起 / 殺 dev server**：使用者平常自己開著 `pnpm dev`（port 3000）。要驗證 runtime，直接 `curl http://localhost:3000/...`；打不通就請使用者開 dev server，或改用 `pnpm build` 靜態驗證。

## Git 流程

- **在 `main` 上絕不直接改**。每個新任務開始前先 `git branch --show-current` 確認分支：
  - 一律從 `main` 開新分支（`feat/...`、`fix/...`、`refactor/...`、`chore/...`），不要在未合併的 feature 分支上疊新分支。
  - 若當前分支還有未合併的完成工作，或分支名與新任務主題明顯不符 → 先停下來問使用者：
    - (B) 先把當前分支 merge 回 `main`，再從 `main` 開新分支 ← **預設建議**
    - (C) 在當前分支繼續（僅限同一主題的延續）
    - (A) 從當前分支直接切新分支 ← 僅在使用者明確要求時使用，並說明兩份工作會綁在一起
  - 分支名相符且無未合併的完成工作，或使用者已說「就在這改」→ 直接做，不用每次問。
- **Commit 由 Claude 自行處理**：完成一個邏輯變更、通過品質檢查後就 commit，不需要每次詢問。
- **Merge 是使用者的決定**：使用者沒說不要自己 merge；使用者一說「合併 / merge / 提交並合併」就直接執行：
  `git checkout main && git merge --ff-only <branch> && git branch -d <branch>`
  （`--ff-only` 失敗代表 `main` 已前進，先在分支上 `git rebase main` 再合併。）
- 不開 PR、不走 code review 流程。

## Commit Message 規範

格式（全英文）：

```
type(scope): imperative summary in lowercase

Optional paragraph: why the change was made, its scope, and anything
deliberately left out.

- What changed, one logical change per bullet
- Keep identifiers and file paths as-is (RecipeForm, src/lib/db.ts)

Optional: how it was verified.
```

- **type**（僅限）：`feat` / `fix` / `refactor` / `perf` / `style` / `docs` / `chore` / `ci`
  - `style` 指格式調整（不影響邏輯），UI 視覺調整屬於 `feat` 或 `fix`
- **scope**：功能模組名（如 `menu`、`recipe`、`ui`、`db`、`theme`、`config`）。跨兩個模組用逗號（`menu,recipe`）；跨更多模組則省略 scope。不要用動作當 scope（如 `fix(merge)`）。
- **header**：祈使語氣（`add` 不是 `added`）、小寫開頭、不加句號、不超過 72 字元。
- **body**：每行約 72 字元換行；條列只寫「改了什麼」，不重複 header。小改動可以只有 header。
- 修改 Prisma schema 時，body 註明 migration 名稱。
- 一個 commit 只做一個邏輯變更。
- **不要加 `Co-Authored-By` 或任何 AI 署名 trailer。**

範例：

```
feat(recipe): add reference url list to recipe form

- RecipeForm uses useFieldArray for dynamic url rows
- recipeSchema validates each entry with z.url()
- Add RecipeUrl model (migration: add_recipe_url)
```
