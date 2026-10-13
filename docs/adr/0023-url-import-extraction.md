# ADR-0023：網址匯入由伺服器抓網頁，先讀 JSON-LD，再抽正文

日期：2026-10-13
狀態：Accepted

## 背景

匯入卡要支援貼網址。原始 HTML 常有 5 萬到 20 萬 token，多數是廣告與程式碼，直接交給 LLM 既浪費，也可能超過 Haiku 5.5 的 10 萬 token 而以 5 倍單價計費（ADR-0022）。多數食譜網站會在頁面中放 schema.org `Recipe` 的 JSON-LD 供搜尋引擎使用。

## 決策

- Route Handler 自己抓網頁：只接受 `http(s)`，拒絕 localhost 與內網位址，設逾時與大小上限（見 `src/features/recipe-import/` 的設定檔）。
- 先找 JSON-LD 中的 `Recipe`，有就把它當成文字交給 LLM。
- 沒有時用 `@mozilla/readability`（以 `linkedom` 解析 HTML）抽出正文文字。
- 抽出的內容走與「貼文字」相同的匯入流程；該網址加入食譜的 References。

## 考慮過的替代方案

- 整頁 HTML 交給 LLM：不用額外套件，但 token 多 10 倍以上，品質也受雜訊影響。
- 讓 LLM 用 Anthropic 的 web fetch 工具：不用自己抓網頁，但無法確認 Haiku 5.5 支援，且抓取內容同樣整頁計入 token。
- `jsdom` 取代 `linkedom`：相容性最好，但體積大、啟動慢；Readability 只需要基本 DOM。

## 後果

- 新增執行期依賴 `@mozilla/readability` 與 `linkedom`。
- 要 JavaScript 才有內容、要登入、或擋爬蟲的頁面抓不到（Instagram、YouTube 等）；顯示 toast，請使用者改貼文字或截圖。
- 伺服器會對使用者給的網址發出請求，所以要有網址檢查；本機個人使用，風險低。

## 相關

PLAN-007、#52、ADR-0022
