# ADR-0003：UI 元件使用 shadcn（Base UI）

日期：2026-10-07
狀態：Accepted

## 背景

專案大部分畫面是表單與 CRUD（食譜編輯、菜單編排），需要對話框、輸入框、下拉選單等元件，且要支援 light / dark 色彩模式。

## 決策

使用 shadcn（`base-nova` style，底層 Base UI），元件原始碼放在 `src/components/ui/`；顏色一律透過 `src/app/globals.css` 的語意 design tokens。

## 考慮過的替代方案

- 自行包裝 Radix 原始套件（先前 stock-agent 的做法）：控制權高，但每個元件都要手寫，對表單密集的專案成本過高。
- shadcn Radix 版：功能相當；選 Base UI 版與先前 quick-talk 專案一致。

## 後果

- 元件組合寫法使用 Base UI 的 `render` prop，不是 Radix 的 `asChild`。
- 紙張堆疊等 shadcn 沒有的元件需要自製（見 ADR-0007）。

## 相關

`components.json`、`src/components/ui/`、`src/app/globals.css`
