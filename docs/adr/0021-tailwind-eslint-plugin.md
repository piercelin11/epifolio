# ADR-0021：以 eslint-plugin-better-tailwindcss 檢查 Tailwind class 的標準寫法

日期：2026-10-13
狀態：Accepted

## 背景

VS Code 的 Tailwind CSS IntelliSense 會用 `suggestCanonicalClasses` 提示可以改寫成標準寫法的 class，例如 `group-has-[:focus-visible]:opacity-100` 可以寫成 `group-has-focus-visible:opacity-100`。這個提示只出現在編輯器裡。`eslint.config.mjs` 只載入 `eslint-config-next`，`prettier-plugin-tailwindcss` 也只負責排序 class，所以 `pnpm lint` 和 CI 都不會檢查這類問題，非標準寫法會留在程式碼裡。

## 決策

- 加入 `eslint-plugin-better-tailwindcss`（devDependency），`settings.entryPoint` 指向 `src/app/globals.css`。
- 只啟用 `enforce-canonical-classes`，等級設為 `error`，CI 的 lint 步驟會因此失敗。
- 設定 `collapse: false`：關掉「把多個 class 合併成一個」的改寫。合併是依數值比對，會把專案的字級 token 換成剛好同值的 Tailwind 預設 class（`text-body leading-snug` → `text-base/snug`），違反 design tokens 的規範。
- 其他規則一律不啟用。class 排序已由 Prettier 負責，兩邊都排序會互相衝突。

這個規則用 Tailwind 本身的 `canonicalizeCandidates` 判斷，跟編輯器的提示同一套邏輯。

## 考慮過的替代方案

- `eslint-plugin-tailwindcss` 4.4.0：也有標準寫法的規則（`enforces-canonical-classname`），但 v4 支援還在 alpha 分支，套件內部版本標的是 `4.4.0-beta.0`。
- 啟用 `recommended` 設定：會多出排序、換行等規則，與 Prettier 重疊。其中 `no-unknown-classes` 會把 shadcn 的 `toaster` 等非 Tailwind class 當成錯誤，需要另外維護白名單。
- 不加套件，只靠編輯器提示：不需要額外依賴，但 CI 擋不住，而且 Claude 看不到編輯器的提示。

## 後果

- 現有 6 處違規已用 `eslint --fix` 修正，都是不改變輸出的寫法改寫（`has-[:focus-visible]` → `has-focus-visible`、`aspect-[160/700]` → `aspect-160/700`），畫面不變。其中 3 處在 shadcn 的 `src/components/ui/field.tsx`；之後用 shadcn CLI 重新加入或更新元件時，可能要再跑一次 `pnpm lint --fix`。
- 規則需要載入 Tailwind 編譯 `globals.css`，全專案 lint 會多花幾秒。
- `pnpm lint --fix` 可以自動修正這類問題。

## 相關

#73、ADR-0010
