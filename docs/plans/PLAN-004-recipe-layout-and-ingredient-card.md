---
status: done
branch: plan-004-recipe-layout-and-ingredient-card
issue: 33
created: 2026-10-12
---

# PLAN-004：食譜紙排版、份數換算與食材卡片

## 目標

1. 食譜紙從純文字改成正式排版（附圖）：標題、`INGREDIENTS`（右側份數 `− 2 +`）、兩欄用量群組、`INSTRUCTIONS` 與步驟群組。
2. 份數可用 `+` / `−` 調整，用量即時換算；用量前的框框可勾選，勾選後劃掉，代表已備好。
3. 菜單章節小標、食譜用量群組小標、步驟群組小標都改為選填，沒有小標時版面仍正常。
4. 新增食材（`Ingredient`）與食材卡片（`IngredientCard`）：點菜單品項描述或食譜用量中的食材，卡片從畫面下方往上冒出；關閉時往下消失。

這次只做 UI，資料仍是 mock。

## 非目標

- 食譜、菜單、食材的編輯表單與資料庫（小標選填只先做到型別與呈現）
- 多筆購買紀錄、平均價、購買地點、料理成本與營養計算（資料需求記在 issue，見設計摘要 5）
- 單位換算（tsp ↔ g 等）；份數換算只乘倍數，不換單位
- 勾選狀態與份數的持久化（重新整理就重設）
- 食譜筆記（`notes`）：暫時不顯示，資料保留
- 窄螢幕版面（#10）

## 驗收條件

**食譜紙排版**

- 版面依附圖：標題（標題字型、粗體、大寫）→ 上下有分隔線的 `INGREDIENTS` 列，右側為 `−`、份數、`+`、`servings` → 用量群組兩欄排列 → 上下有分隔線的 `INSTRUCTIONS` 列 → 步驟群組。
- 用量：框框、粗體的「數量 + 單位」、名稱與備註（`Sea salt (to taste)`）；沒有數量的用量只顯示名稱與備註。
- 步驟：編號跨群組連續（第二群組從 3 開始）、粗體步驟標題加句點、內文。
- 不顯示份量 / 時間那一行與筆記。
- 字級只用既有的 type scale token（見設計摘要 4）；顏色只用語意 token。

**份數換算**

- 點 `+` / `−` 份數加減 1，最少 1、最多 `servingsLimit`（設定檔）；到上下限時按鈕停用。
- 所有有數量的用量依「目前份數 ÷ 食譜原份數」換算，範圍值（`80-100 g`）兩端都換算。
- 換算結果依設定檔格式化：常見分數（1/8、1/4、1/3、1/2、2/3、3/4）顯示為分數，其餘最多 1 位小數；`g`、`ml` 等可秤量單位四捨五入到整數。
- 換算是純函式，參數集中在 `src/features/recipe/scaling.ts`，有單元測試或可在文件 / Artifact 引用。
- 食譜沒有原份數時不顯示份數控制。

**勾選**

- 點框框或該行文字切換勾選；勾選後框框打勾、整行劃掉並變淡。
- 換到別道食譜再回來，勾選與份數維持（存在書架層的記憶體狀態）；重新整理後重設。
- 鍵盤可操作（原生 checkbox 或等效 role）。

**小標選填**

- `Section.label`、用量群組 `label`、步驟群組 `label` 型別改為選填。
- 沒有小標時：不顯示小標、不留空白；mock 資料各至少放一個沒有小標的例子驗證。

**食材與食材卡片**

- 食材資料：名稱、圖片、價格（金額 + 計價單位）、營養（熱量、蛋白質、碳水、脂肪，每 100 g）。圖片、價格、營養都可缺。
- 卡片版面依附圖：圖片、名稱（大寫）與價格（`$25 / gram`）、四列營養表（大寫、細分隔線）；缺的欄位不顯示，沒有圖片時不留圖片區。
- 卡片底色固定 `#DDD2BF`（不隨菜單主題變動），疊上新材質 `public/textures/card-stock.webp`（由 `~/Desktop/02.jpg` 縮小轉檔）。
- 可點擊的位置：食譜紙上有對應食材的用量名稱；菜單品項描述中有對應食材的詞。沒有對應食材的不可點，外觀與現在相同。
- 點菜單描述中的食材只開卡片，不換紙；點品項名稱仍照舊換到食譜紙。
- 停放位置依點擊當下的視窗決定（視窗垂直置中、離視窗右緣固定距離，以 token 調整），不依紙張位置；卡片放在該書的捲動區內，之後跟著紙張一起捲動。
- 出現動畫：卡片從視窗下緣外往上移到停放位置，一直在紙張上層。
- 關閉：按 Esc、點卡片以外的地方、或再點同一個食材；卡片往下移出視窗下緣。
- 卡片開著時點另一個食材：先往下消失，再冒出新的。
- 換紙、切換菜單書、進總覽時卡片關閉。
- 動畫中的點擊忽略；系統減少動態效果時改為直接出現 / 消失。
- 動畫參數集中在 `src/features/ingredient/card-motion.ts`；卡片尺寸、停放位置放 `globals.css` token。
- 食材照片放 `public/ingredients/<ingredientId>.webp`（進 git），統一裁成 4:3、960×720。

**共通**

- `pnpm typecheck`、`pnpm lint`、`pnpm format:check` 通過；瀏覽器實測依 R4 確認點擊目標。

## 邊界情況

- 份數換算出極小值（1/8 tsp 減半）：顯示最接近的分數或小數，不特別處理。
- 範圍值換算後兩端格式化結果相同（`1-1` ）：只顯示一個值。
- 同一食材在一道食譜出現多次：每行都可開卡片。
- 視窗很矮、卡片比視窗高：卡片頂端對齊視窗頂端加內距，不往上超出。
- 開卡片後捲動：卡片跟著紙張移動，可能捲出畫面；不自動關閉。
- 用量群組只有一個：單欄還是兩欄？→ 依 CSS 多欄自動排，一個群組時佔左欄。

## 設計摘要

### 1. 資料型別

- 食材 `Ingredient`（新）：`id`、`name`、`image?`、`price?: { amount, unit }`、`nutrition?: { calories, protein, carbs, fat }`（每 100 g）。放在新模組 `src/features/ingredient/`。
- 用量：目前識別字是 `Ingredient`（`{ name, amount: string }`），改名為 `RecipeIngredient`，欄位改為 `quantity?: number | [number, number]`、`unit?`、`name`、`note?`、`ingredientId?`。字串 `amount` 由 mock 轉換函式解析（或直接改 mock JSON）。
- 步驟：`Recipe.steps` 改為 `stepGroups: { label?, steps }[]`。
- 菜單品項描述：`MenuItem.description` 改為片段陣列 `{ text, ingredientId? }[]`，呈現時以 ` · ` 連接；有 `ingredientId` 的片段可點。
- 食譜與菜單都只用 `ingredientId` 引用食材，不複製食材資料。

### 2. 元件

- `RecipeSheet` 改寫：`RecipeSectionHeader`（分隔線列）、`ServingsControl`、`IngredientList`（`IngredientGroup` 兩欄）、`StepList`。
- 份數與勾選狀態以 `recipeId` 為 key，存在 `MenuShelf` 層（與目前保存上層紙的方式相同）。
- 菜單品項列：外層不再是單一 `<button>`（按鈕內不能再放按鈕）；改成菜名與價格為換紙按鈕，描述內的食材是各自的按鈕。
- `IngredientCard`（呈現）+ `IngredientCardLayer`（動畫與開關）。卡片層放在每本書的捲動區內、在紙張上層；開啟時以 `scrollTop` 加上依視窗算出的位移決定 `top`。

### 3. 卡片動畫

出現：從視窗下緣外往上移到停放位置；消失：往下移出視窗下緣。用 `motion` 的 `AnimatePresence`，時長與緩動曲線放 `card-motion.ts`（可加一點旋轉，與換紙動畫的語彙一致，數值同樣放設定檔）。停放位置依開啟當下的視窗計算（見驗收條件），以 token 調整。

### 4. 字級 token 的管理（回答實作問題 1）

不建議每多一種文字就加 token。現在的 6 級（caption、body、title、heading、headline、display）是「層級」而不是「元件」，這次的新畫面全部對得上既有層級：

| 畫面元素 | 用的 token |
| --- | --- |
| 食譜標題 | `headline` |
| `INGREDIENTS` / `INSTRUCTIONS` | `title`（標題字型、粗體） |
| 群組小標 `MAIN` | `body`（粗體、大寫） |
| 用量、步驟內文、`servings` | `caption` 或 `body`（實作時對照附圖選一個） |
| 卡片名稱、價格 | `title` / `body` |
| 卡片 `/ gram`、營養表 | `caption` |

原則：

- 差異先用字重、大小寫、字型、顏色、字距做出來，不用字級。
- 新尺寸與既有某級差不到約 15% 就用既有那級。
- 只有出現新的「層級」（全站多處會用到）才加 token；只有單一元件用的特殊尺寸（例如 `masthead`）是例外，並在 token 旁註明用在哪裡。
- 若之後發現某級在不同地方需要不同大小，代表那級分太粗，再拆，而不是逐一加。

### 5. 食材價格、營養與圖片（回答實作問題 2）

- **資料分兩層**：食材目錄是常駐參考資料（名稱、照片、營養、預設價格、單位換算），之後可供多位使用者共用；購買紀錄、價格、地點是使用者資料，可編輯。
- **圖片**：目錄的照片跟著 app 走，放 `public/ingredients/`（進 git），之後由 Prisma seed 寫入路徑；使用者上傳的圖片依 [ADR-0002](../adr/0002-local-image-storage.md) 放 `public/uploads/`。內建照片若要公開，需確認授權。目錄圖片的存放方式在規劃資料庫時另寫 ADR。
- **價格與營養的資料需求**：依單一來源原則，待辦與需求放 GitHub Issue，不另寫 md。已開 issue #42「食材價格紀錄、料理成本與營養計算」，內容記下：目錄與使用者資料的分層、多筆購買紀錄（金額、數量、單位、地點、日期）、卡片顯示平均單價、依用量算料理成本與營養、**單位換算**（用量是 tsp / clove，價格是每 g：每個食材需要「1 單位 = 幾 g」的換算，這是成本與營養計算的核心難點）。之後規劃資料庫時從這張 issue 建計畫，資料模型決定再寫 ADR。
- 這次卡片的 `price` 只是單一值，型別先留好位置；之後由購買紀錄算出平均值取代。

## 任務拆解

1. 型別與 mock 資料：`RecipeIngredient`、`stepGroups`、選填小標、`Ingredient`、描述片段；mock JSON 改寫並加入食材資料與無小標範例（#34）
2. 份數換算純函式與設定檔 `scaling.ts`（含範圍值、分數格式化）（#35）
3. 食譜紙排版：標題、分隔線列、兩欄用量、步驟群組；移除筆記與份量時間行（#36）
4. 份數控制與勾選，狀態保存在書架層（#37）
5. 菜單章節小標選填、品項列改為多個按鈕（#38）
6. 食材卡片元件與材質（`card-stock.webp`、底色 token）（#39）
7. 卡片動畫與開關（Esc、點外面、換紙 / 換書時關閉、減少動態效果）（#40）
8. 文件：功能頁、glossary、ADR（#41）

## 完成後遷移清單

- [x] 功能頁：`docs/features/paper-stack.md`（食譜紙段落）、新增 `docs/features/ingredient-card.md`、`features/index.md`
- [x] ADR：食材與用量分開、用量以 `ingredientId` 引用食材（含改名 `RecipeIngredient`）
- [x] glossary：食材 `Ingredient`、用量改 `RecipeIngredient`、食材卡片 `IngredientCard`、步驟群組
- [x] `docs/architecture.md`：ER 圖加入 `INGREDIENT`，目錄表加 `ingredient` 模組
