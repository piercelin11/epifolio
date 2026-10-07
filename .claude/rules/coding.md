---
paths:
  - "src/**/*"
  - "prisma/**/*"
  - "*.config.ts"
  - "*.config.mjs"
---

# 技術棧細節與程式碼規範

## 技術棧

- **框架**：Next.js 16（App Router、Turbopack，預設啟用 `cacheComponents`）+ React 19 + TypeScript 5
- **樣式**：Tailwind CSS v4（`@tailwindcss/turbopack`，無 `tailwind.config`；theme token 全在 `src/app/globals.css`）
- **UI 元件**：shadcn（`base-nova` style，底層為 Base UI `@base-ui/react`，非 Radix）+ `lucide-react` 圖示 + `sonner` toast
  - 新增元件用 `pnpm dlx shadcn@latest add <name>`，放在 `src/components/ui/`（盡量不改，要客製就包一層）
  - Base UI 的組合寫法是 `render` prop（例：`<DropdownMenuTrigger render={<Button />} />`），不是 Radix 的 `asChild`
  - `cn()` 由 shadcn 官方 `cn` 套件提供（取代 clsx + tailwind-merge），專案內從 `@/lib/utils` import
- **色彩模式**（`ColorMode`）：`next-themes`（`attribute="class"`，light / dark / system），切換元件 `src/components/theme-toggle.tsx`。與菜單主題（`MenuTheme`）是不同概念，見 `docs/glossary.md`。
- **翻頁動畫**：`motion` + CSS 3D transform 自製，不使用現成翻頁套件（ADR-0004）
- **表單**：`react-hook-form` + `zod`（`@hookform/resolvers/zod`），動態清單（用量、步驟、參考連結）用 `useFieldArray`；表單 UI 用 shadcn 的 `field` 元件
- **套件管理**：pnpm 8.15.4（`packageManager` 鎖定），Node >= 22

## 資料庫（ADR-0001）

- Prisma 7 + SQLite（`@prisma/adapter-better-sqlite3`）。連線字串在 `.env` 的 `DATABASE_URL`（`file:./prisma/dev.db`），由 `prisma.config.ts` 與 `src/lib/db.ts` 讀取。
- Prisma 7 寫法：連線設定在 `prisma.config.ts`（不是 `schema.prisma` 的 `datasource.url`）；`PrismaClient` 必須搭配 driver adapter 建立。
- `src/lib/db.ts` 檔頭有 `import "server-only"`，只能在 Server Component / Server Action import。
- Prisma model 單數命名（`Recipe` 不是 `Recipes`），欄位 camelCase，名稱對齊 `docs/glossary.md`。
- 修改 schema 後：`pnpm exec prisma migrate dev --name <name>`（會一併 generate）。
- **資料存取用 Server Actions**（不建 REST API），回傳可序列化的 plain object（`Date` 先轉字串）。
- `cacheComponents` 啟用時，讀 DB 的元件需要 `<Suspense>` 包裹或 `"use cache"`，**不要用 `export const dynamic`**（與 `cacheComponents` 不相容）。寫之前先讀 `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`。

## 圖片上傳（ADR-0002）

- 本機儲存：Server Action 將圖片存進 `public/uploads/`（gitignored），DB 只存相對路徑。
- 所有寫檔集中在單一 `saveImage()` 函式，日後改用雲端儲存只需換這一處。
- 前端上傳前先壓縮；顯示用 `next/image`。

## 程式碼規範

- **TypeScript 型別定義**：純物件形狀（`{ key: value }` 結構，含 React props、API 資料結構）→ `interface`；其餘（union、intersection、utility types、mapped types、type alias）→ `type`。
- **Tailwind class 條件合併**：一律用 `cn()`，禁止 template literal 或三元字串拼接 class。
- **顏色**：元件只用語意 token（`bg-background`、`text-muted-foreground`、`bg-primary`、`text-destructive`…），不直接寫 `slate-500` / `blue-600` 等色階，確保 light / dark 都正確。新增語意色時在 `globals.css` 的 `:root` 與 `.dark` 各加一組，並在 `@theme inline` 註冊。
- **註解**：專業、簡潔，不使用表情符號。
