# ADR-0020：文具圖片放 public/stationery，與材質分開

日期：2026-10-13
狀態：Accepted

## 背景

`public/textures/` 原本放紙張與卡紙材質，食材卡片的長尾夾也放在這裡。PLAN-006 要再加入迴紋針。長尾夾、迴紋針是疊在紙上的物件，不是鋪滿表面的材質，放在一起語意不符。

## 決策

- `public/textures/`：只放鋪滿表面的材質（紙張、卡紙）。
- `public/stationery/`：疊在紙上的文具物件（長尾夾、迴紋針），透明背景的 webp。
- 圖片路徑一律寫在 `src/app/globals.css` 的 token，元件不寫死路徑。

## 考慮過的替代方案

- 全部留在 `textures/`：不用搬檔，但之後物件變多會越來越混。
- 依功能分資料夾（`ingredient-card/`、`editor/`）：同一個物件被多處使用時不好放。

## 後果

- 長尾夾從 `public/textures/` 搬到 `public/stationery/`，`globals.css` 的路徑跟著改。

## 相關

PLAN-006、#63、ADR-0012
