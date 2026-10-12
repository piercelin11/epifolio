# ADR-0009：總覽的滾輪卡點使用 wheel-gestures

日期：2026-10-12
狀態：Accepted

## 背景

菜單總覽要讓滾輪上下滾動變成書本左右移動，每次停在一本（卡點），書數 ≥ 3 時無限循環。CSS `scroll-snap` 只適用原生捲動軸，做不到「垂直滾輪 → 水平移動」與循環。觸控板輕撥一次會送出一連串 wheel 事件，再加上慣性尾巴，自己寫門檻與冷卻時間容易一撥跳兩本。

## 決策

使用 `wheel-gestures`：它辨識一次手勢的開始、結束與慣性。總覽時在書架根元素上觀察手勢，一次手勢移動距離超過門檻就移動一本，該手勢剩下的事件（含慣性）全部忽略。移動動畫仍由 `motion` 負責。使用者實測觸控板與滑鼠後決定保留。

## 考慮過的替代方案

- Embla Carousel + 滾輪外掛：卡點與循環現成，但 Embla 自己控制 transform，與書架的傾斜、總覽縮放動畫會搶控制權。
- 自己寫門檻 + 冷卻時間：不加套件，但觸控板慣性常誤觸，需要反覆調參數。

## 後果

- 新增相依套件 `wheel-gestures`（無其他相依）。
- 門檻與移動時長集中在 `src/features/menu-shelf/shelf-motion.ts`。
- 總覽時書架攔截滾輪的預設行為；閱讀模式不受影響。

## 相關

PLAN-003、#30、[菜單書架](../features/menu-shelf.md)、`src/features/menu-shelf/hooks/use-menu-shelf.ts`
