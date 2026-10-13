# ADR-0018：拖曳排序使用 @dnd-kit/core 與 @dnd-kit/sortable

日期：2026-10-13
狀態：Accepted

## 背景

PLAN-006 的編輯卡要能拖曳排序：菜單卡的品項可在章節內與章節間移動、章節整組移動；食譜卡的用量行與步驟同理。不使用拖曳把手，點擊仍要能進入 inline 編輯；要能在卡片內自動捲動，也要能用鍵盤操作。

## 決策

- 使用 `@dnd-kit/core` 6 與 `@dnd-kit/sortable` 10。
- 多容器排序：每個章節（或群組）是一個 sortable 容器；章節本身是另一層 sortable。兩層的 id 分開，拖曳時只接受同層級的目標，章節與品項不能互換。
- 不用把手：`PointerSensor` 以移動距離為啟動條件，點擊不會變成拖曳；正在輸入的那一行停用拖曳。保留 `KeyboardSensor`。
- 「內容 ↔ 小標」只由 Tab / Shift+Tab 改變，拖曳只改順序。

## 考慮過的替代方案

- `@dnd-kit/react`（新版重寫）：持續更新，但仍是 0.x，API 可能變動。
- `motion` 的 `Reorder`：專案已安裝，動畫一致；但只支援單一清單，跨清單移動要自己做。
- `@atlaskit/pragmatic-drag-and-drop`：以瀏覽器原生拖放為基礎，適合大型清單與跨視窗；拖曳中的排序動畫要自己做，與這裡的需求不符。

## 後果

- 新增兩個相依套件。`@dnd-kit/core` 最後一次發版是 2024-12；若之後不再維護，改用 `@dnd-kit/react` 時拖曳邏輯要改寫，資料與 Server Action 不受影響。
- 拖曳中的位移由 dnd-kit 的 transform 處理，與卡片本身的 `motion` 動畫分開。
- 在可捲動的卡片內，跟著游標走的是 `DragOverlay`（以 portal 放到 `body`，因為卡片的 `drop-shadow` 濾鏡會讓 fixed 定位改為相對卡片），原本那一列只留在排序位置當佔位。若讓原列跟著游標，跨章節後的位移會撐大捲動範圍，自動捲動停不下來。
- 列的高度不一、會跨章節移動，droppable 用 `MeasuringStrategy.Always` 持續重新量測。

## 相關

PLAN-006、#66、#68
