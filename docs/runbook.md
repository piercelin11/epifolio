---
status: draft
updated: 2026-10-20
---

# 維運手冊

本機開發時會用到的維運步驟。

## 資料庫備份

`prisma/dev.db` 是 gitignored，食譜、食材、翻譯與價格只存在這個檔案。

```bash
pnpm db:backup
```

- 複製到 `backups/`（gitignored），檔名含日期時間，例如 `backups/dev-2026-10-20-125753.db`。
- 用 SQLite 的 `VACUUM INTO` 寫出一致的快照，dev server 開著也能執行。程式見 `scripts/db-backup.ts`。
- 何時執行：改 Prisma schema、跑 `migrate`、跑 seed、大量修改資料之前（`CLAUDE.md` 的 R10）。
- 舊備份不會自動刪除，需要時手動清理 `backups/`。

## 從備份還原

1. 停掉 dev server（開著時 SQLite 檔案可能被寫入）。
2. 先對目前的 DB 再備份一次，以免還原錯檔案。
3. 用備份檔取代 `prisma/dev.db`：`cp backups/<檔名>.db prisma/dev.db`
4. 如果備份之後新增過 migration，執行 `pnpm exec prisma migrate deploy`。
5. 重新啟動 dev server。

## Seed

`pnpm exec prisma db seed` 只補缺少的資料，不刪除也不覆蓋（程式見 `prisma/seed.ts`）：

| 資料 | 行為 |
| ---- | ---- |
| 使用者 | 預設使用者不存在時才建立 |
| 食材 | 依 id 補上 `seed-data.json` 有、DB 沒有的食材；已存在的不動 |
| 範例食譜與菜單 | 只在預設使用者還沒有任何菜單時寫入；刪掉的範例食譜之後不會再出現 |

`seed-data.json` 只有 11 種食材，其他食材（例如匯入時新增的）只存在 DB，遺失時只能從備份還原。
