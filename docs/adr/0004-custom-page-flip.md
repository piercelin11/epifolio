# ADR-0004：翻頁以 motion 與 CSS 3D 自製

日期：2026-10-07
狀態：Accepted

## 背景

翻頁菜單是本專案的必要特色，shadcn 沒有對應元件，且擬真翻頁可能拖累編輯、搜尋與手機操作。

## 決策

使用 `motion`（Framer Motion）搭配 CSS 3D transform 自製翻頁效果（卡片沿書脊翻轉），翻頁只作為菜單的一種呈現（`FlipView`），另保留不翻頁的 `QuickView`。

## 考慮過的替代方案

- `react-pageflip`（StPageFlip）：擬真紙張捲曲效果最好，但套件久未維護、React 19 相容性未知。
- Embla Carousel：成本最低，但是左右滑動而非翻書，不符合「翻頁菜單書」的特色。

## 後果

- 翻頁的互動細節（手勢、頁面尺寸、效能）需要自行實作與調校，於後續的翻頁計畫規劃。
- 頁面尺寸與動畫參數走 design tokens 或單一設定檔，不寫死在元件內。

## 相關

翻頁互動待後續計畫規劃（見 [計畫索引](../plans/README.md)）
