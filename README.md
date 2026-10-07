# epifolio

食譜記錄 + 可翻頁的餐廳菜單書。個人本機使用。

## 這是什麼

- 記錄食譜：用量、步驟、參考連結、圖片。
- 把食譜編排成自己的餐廳菜單，用翻頁的方式瀏覽與編輯。
- 之後：菜單輸出 PDF、多種菜單主題。

## 技術棧

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn (Base UI) + next-themes
- motion（翻頁動畫）
- react-hook-form + zod
- Prisma 7 + SQLite

## 快速開始

```bash
cp .env.example .env
pnpm install                  # 會自動執行 prisma generate
pnpm exec prisma migrate dev
pnpm dev                      # 開發伺服器
```

## 指令

| 指令                | 說明                                  |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | 開發伺服器                            |
| `pnpm build`        | 正式環境建置                          |
| `pnpm lint`         | ESLint                                |
| `pnpm typecheck`    | 產生路由型別 + tsc                    |
| `pnpm format`       | Prettier 格式化                       |
| `pnpm format:check` | Prettier 檢查                         |
| `pnpm docs:serve`   | 文件站本機預覽                        |
| `pnpm docs:build`   | 文件站建置檢查（strict）              |

## 環境變數

| 變數           | 說明                                     |
| -------------- | ---------------------------------------- |
| `DATABASE_URL` | SQLite 檔案路徑，預設 `file:./prisma/dev.db` |

## 文件

- 專案文件放在 `docs/`，用 MkDocs Material 本機預覽：
  ```bash
  python3 -m venv .venv
  .venv/bin/pip install -r requirements-docs.txt
  pnpm docs:serve
  ```
- 給 AI 協作者的規則見 `CLAUDE.md`；目前進度見 `docs/STATUS.md`。
- 待辦與路線圖在 GitHub Issues。
