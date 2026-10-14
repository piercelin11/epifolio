# ADR-0022：LLM 匯入用 Anthropic SDK 與 Claude Haiku 5.5，只產生草稿

日期：2026-10-13
狀態：Accepted（食材對應的部分由 ADR-0026 取代）

## 背景

匯入卡要把貼上的文字、照片 / PDF、網頁整理成一份雙語食譜草稿，並對應食材目錄（#52）。任務是整理與翻譯，不需要大模型；要能讀圖片與 PDF，輸出要是固定格式，且不能讓模型直接改資料庫。照片和 PDF 常超過 Server Action 預設的 1MB 請求上限。

## 決策

- 使用官方 `@anthropic-ai/sdk`，模型 `claude-haiku-5-5`，模型 ID 與參數放 `src/features/recipe-import/` 的設定檔。
- 用 structured outputs 取得固定格式，回來後再以 zod 驗證、轉換成編輯卡的 `RecipeDraft`，最後用與編輯卡相同的 `recipeDraftSchema` 驗證。
- LLM 只產生草稿：結果進入食材卡、食譜卡，使用者按 Save 才經由既有的寫入路徑寫入資料庫。
- 匯入走 Route Handler，不走 Server Action：可以收大檔案，也能把使用者取消（`request.signal`）傳給 SDK 中止請求。
- `ANTHROPIC_API_KEY` 只在伺服器讀取，放 `.env`。

## 考慮過的替代方案

- Claude Haiku 4.5：價格是 Haiku 5.5 的 10 倍（$1 / $5 對 $0.10 / $0.50 每百萬 token），可讀入長度較短，也不支援 effort 調整。
- 直接呼叫 HTTP API：少一個套件，但要自己處理型別、重試與錯誤分類；專案規範用官方 SDK。
- Server Action：與其他寫入一致，但要調大請求上限，且無法中止進行中的請求。

## 後果

- 新增執行期依賴 `@anthropic-ai/sdk`，以及第一個外部 API（`docs/data-sources.md`）。
- 每次匯入要花錢（約 US$0.003 一份）；餘額不足或超過每月上限時 API 回錯誤，畫面當一般失敗處理。
- Haiku 5.5 的 prompt 超過 10 萬 token 時單價變 5 倍；輸入（尤其網頁）要先瘦身，見 ADR-0023。
- 結果品質取決於 prompt；之後要換模型只改設定檔。

## 相關

PLAN-007、#52、ADR-0013、ADR-0015、ADR-0023
