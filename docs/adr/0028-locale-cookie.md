# ADR-0028：介面語言存在 cookie，html lang 由內嵌 script 設定

日期：2026-10-15
狀態：Accepted

## 背景

網站要能在英文與中文之間切換並記住選擇（#53）。epifolio 是個人本機使用的應用程式，不需要搜尋引擎收錄各語言頁面。首頁在 `<Suspense>` 內以 `connection()` 每次請求讀資料庫；root layout 沒有 Suspense 可包，在 layout 讀 cookie 會讓整個 app 無法預先 render（`cacheComponents`）。

## 決策

- 語言存在 cookie `locale`（值 `en` / `zh`，無效值當英文），由 Server Action `setLocale` 寫入；Next.js 在 Server Action 設 cookie 後重新 render 目前頁面，資料與介面以新語言送回，client 狀態保留。
- 只有 `src/app/page.tsx` 的 `<Suspense>` 內讀 cookie，再把語言傳給資料存取函式與 `LocaleProvider`。
- `<html lang>` 預設 `en`，由 `<head>` 的內嵌 script 讀 cookie 在第一次繪製前改寫；切換時 client 直接改 `document.documentElement.lang`。root layout 維持靜態。
- 不做依瀏覽器 `Accept-Language` 的自動選擇：沒有 cookie 就是英文。

## 考慮過的替代方案

- 網址路徑 `/[lang]/...`（Next.js 指南、Apple、MDN 的做法）：可分享、可被收錄，但要把路由搬到 `app/[lang]/`、加 proxy 轉址；個人工具用不到這些好處。
- `localStorage`：伺服器讀不到，第一次 render 的內容會是錯的語言再換掉。
- 在 root layout 讀 cookie 設 `lang`：整個 app 變成每次請求 render，也違反 `cacheComponents` 的 Suspense 要求。

## 後果

- 同一個網址在不同瀏覽器可能是不同語言。
- 新增讀資料的頁面時，要在該頁的 Suspense 內讀語言並傳下去（`getLocale()`）。
- 內嵌 script 與 Server Action 共用 cookie 名稱（`src/lib/i18n/locale-cookie.ts`）。

## 相關

PLAN-009、#53、ADR-0013、`src/lib/i18n/`、`src/app/layout.tsx`
