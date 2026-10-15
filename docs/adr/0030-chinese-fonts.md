# ADR-0030：中文用 Noto Sans TC 與 Noto Serif TC，接在拉丁字型之後

日期：2026-10-15
狀態：Accepted

## 背景

介面要能顯示中文（#53）。現有字型 Playfair Display（標題）與 Inter（內文）沒有中文字，中文會退回各系統的字型，Mac 與 Windows 外觀不同。

## 決策

- 以 `next/font/google` 載入 Noto Serif TC（標題）與 Noto Sans TC（內文），放在 `src/lib/fonts.ts`（ADR-0006）。
- 在 `globals.css` 的字型用途中把中文字型接在拉丁字型後面：英文字仍由 Playfair Display / Inter 顯示，中文字落到 Noto。兩種語言用同一組字型設定，不依語言切換。
- 中文字型 `preload: false`：Google 依 unicode-range 把字型切成上百個小檔，瀏覽器只下載頁面用到的字。

## 考慮過的替代方案

- 系統字型堆疊（PingFang TC、Microsoft JhengHei）：不用下載，但各平台外觀不同，也沒有襯線體可配標題。
- 依語言切換整組字型（中文介面全用 Noto）：英文名稱在中文介面裡會換字型，外觀不一致。

## 後果

- 第一次出現某些中文字時要下載對應的小字型檔，可能短暫顯示後備字型（`display: swap`）。
- 建置時 next/font 會下載整套切片檔，`.next` 變大。
- Noto 的字重涵蓋 Inter 與 Playfair 用到的範圍；`font-light` 等在中文也有效。

## 相關

PLAN-009、#53、ADR-0006、`src/lib/fonts.ts`、`src/app/globals.css`
