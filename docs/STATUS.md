# STATUS

更新：2026-10-12

> 交接筆記。每次對話結束前**覆蓋**更新，只寫現況，不累加歷史。

## 現在在做什麼

分支 `fix/laptop-layout-tweaks`（未合併）：筆電尺寸版面修正——總覽列與頁首區保持最小間距、兩側露出寬度隨視窗縮放、頁首標題與 menu 按鈕改用專屬字級 token、食譜紙上移。使用者接著要在此分支手動微調其他 UI。

## 下一步

- 使用者確認畫面後說「合併」再 fast-forward 進 `main`。
- 可調 token 都在 `src/app/globals.css`：`--shelf-overview-min-top`、`--shelf-peek`、`--text-masthead`、`--text-masthead-nav`、`--paper-offset-y`。
- 其他候選：窄螢幕版面（#10）、新增菜單的表單與資料庫（尚未開 issue）。

## 卡點與待決定

- 改用 Edit 工具改 `globals.css` 後，dev server 仍漏讀一次（連續四次 Edit 只漏最後一次，再改一次就讀到）。依 R5 需請使用者決定後續做法。
