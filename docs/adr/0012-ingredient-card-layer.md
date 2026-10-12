# ADR-0012：食材卡片放在書架上層，以捲動事件跟著紙張移動

日期：2026-10-12
狀態：Accepted

## 背景

食材卡片要依點擊當下的螢幕位置出現，之後跟著紙張一起捲動；設計上卡片會超出食譜紙右緣。紙張在每本書自己的捲動區（`overflow-y: auto`）裡，捲動區的水平方向也會被裁切。

## 決策

卡片層（`IngredientCardLayer`）放在書架根元素、所有書的上層，以螢幕座標定位。卡片出現時記下當時的 `scrollTop`，之後監聽該書捲動區的 `scroll` 事件，把差值寫進卡片的 `y`（motion value）。滑鼠在卡片上滾動時，轉給捲動區。

## 考慮過的替代方案

- 卡片放進捲動區，以 `position: absolute` 跟著內容捲動：不用監聽事件，但超出捲動區的部分會被裁掉，卡片不能超出食譜紙右緣。
- `position: fixed` 不跟著捲動：最簡單，但不符合「跟著紙張捲動」的需求。

## 後果

- 卡片與紙張的同步依賴 `scroll` 事件，正常捲動時看不出延遲。
- 卡片層蓋在整個書架上，本身不接收點擊（`pointer-events: none`），只有卡片接收。

## 相關

PLAN-004、#40、[食材卡片](../features/ingredient-card.md)、`src/features/ingredient/components/ingredient-card-layer.tsx`
