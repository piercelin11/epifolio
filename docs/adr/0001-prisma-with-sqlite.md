# ADR-0001：資料庫使用 Prisma 7 + SQLite

日期：2026-10-07
狀態：Accepted

## 背景

個人本機使用、無帳號系統、資料量小（食譜與菜單），需要關聯式資料（食譜與菜單多對多），且希望免架設資料庫服務。

## 決策

使用 Prisma 7 搭配 SQLite（`@prisma/adapter-better-sqlite3`），資料庫檔案位於 `prisma/dev.db`（gitignored）。資料存取一律透過 Server Actions。

## 考慮過的替代方案

- PostgreSQL：功能完整，但需要另外架設與維運服務，對單人本機使用過重。
- 本機 JSON 檔：免依賴，但多對多關係、查詢與資料一致性都要自己處理。

## 後果

- 部署到 serverless 平台（如 Vercel）時無法使用本機 SQLite，需改用 Turso（libSQL）等方案，屆時另立 ADR。
- Prisma 7 寫法：連線設定在 `prisma.config.ts`，`PrismaClient` 必須搭配 driver adapter；細節見 `.claude/rules/coding.md`。

## 相關

`prisma/schema.prisma`、`prisma.config.ts`、`src/lib/db.ts`
