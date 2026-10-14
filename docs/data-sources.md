---
status: draft
updated: 2026-10-14
---

# 資料來源

網站讀寫的外部服務與資料。目前只有一個：食譜匯入用的 Claude API。

| 來源 | 用途 | 呼叫位置 | 金鑰 | 費用 |
| ---- | ---- | -------- | ---- | ---- |
| Claude API（Anthropic） | [食譜匯入](features/recipe-import.md)：讀文字、照片、PDF、網頁正文，產生雙語草稿與食材對應 | `src/features/recipe-import/server/import-recipe.ts`（只在伺服器） | `.env` 的 `ANTHROPIC_API_KEY` | 依 token 計費；模型見 `src/features/recipe-import/config.ts` |
| 使用者貼的網址 | 網址匯入時抓取該網頁 | `src/features/recipe-import/server/read-web-page.ts` | 無 | 無 |

## Claude API

- 決策：[ADR-0022](adr/0022-llm-import-with-haiku.md)。SDK 為 `@anthropic-ai/sdk`。
- 每次匯入的回應帶有 `usage`（token 數與依 `src/features/recipe-import/config.ts` 單價換算的金額），dev server 的 log 也會印出。測試時的花費上限見 `CLAUDE.md` 的 R8。
- 用量與花費看 Claude Console；帳號已設每月上限、關閉自動儲值。餘額不足或超過上限時 API 回錯誤，匯入卡顯示 toast。
- 送出的內容：使用者提供的文字或檔案、網頁抽出的文字。食材目錄不送出，由程式比對（ADR-0026）。不送使用者的其他資料。
- 換模型只改 `src/features/recipe-import/config.ts`；要確認新模型支援圖片、PDF 與 structured outputs。

## 網頁

- 決策：[ADR-0023](adr/0023-url-import-extraction.md)。
- 只抓公開的 `http(s)` 位址，轉址也檢查；逾時與大小上限見 `src/features/recipe-import/config.ts`。
