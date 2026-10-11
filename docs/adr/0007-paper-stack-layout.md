# ADR-0007：首頁改用紙張堆疊，取代左右跨頁

日期：2026-10-11
狀態：Accepted

## 背景

PLAN-001 的首頁是左右攤開的菜單書（`MenuSpread`）。使用者想改用 [Obys Design Books](https://library.obys.agency/) 那種紙張分層的風格：上層是菜單，下層是打孔的食譜紙，點品項時兩張紙換位。同時要能在不喜歡時整個換掉。

## 決策

- 首頁改成兩張疊放的紙（`PaperStack` / `PaperSheet`），菜單改為單欄，移除 `MenuSpread` 與左右分頁邏輯。
- 紙張材質用 CSS 背景圖加 `mix-blend-mode: overlay`；打孔用 CSS `mask-image` 挖出真正透明的洞。
- 換紙動畫用既有的 `motion`（`animate` 搭配 `useReducedMotion`），參數集中在 `src/features/paper-stack/swap-motion.ts`。
- `PaperStack` 不依賴菜單或食譜，內容由外部傳入，之後換風格時可以整組替換。

## 考慮過的替代方案

- 維持左右跨頁：不符合使用者想嘗試的新風格。
- GSAP（Obys 使用）：功能與 `motion` 大量重疊，多一套動畫庫沒有好處。
- three.js / WebGL（Obys 使用）：能做紙張彎曲、扭曲轉場等 CSS 做不到的效果，但套件大，畫在 canvas 上的文字無法選取與用 Tailwind 排版。等需要彎曲效果時再另立計畫評估。
- 用疊在上面的圓點圖案假裝打孔：無法透出下層內容。

## 後果

- 紙張的幾何與外觀參數都是 `globals.css` 的 design token，元件內不寫死尺寸。
- 用了 mask 的紙不能用 `box-shadow`，陰影改由外層的 `drop-shadow` 提供。
- 換紙時紙張會位移到畫面外，頁面容器必須裁切溢出（`overflow: clip`），否則會撐大捲動範圍。
- 願景中的「翻頁」（[ADR-0004](0004-custom-page-flip.md)）尚未實作；紙張堆疊是目前首頁的呈現方式，與翻頁如何並存之後再決定。

## 相關

功能頁：[紙張堆疊](../features/paper-stack.md)；計畫：[PLAN-002](../plans/PLAN-002-paper-stack.md)；Issue：#13
