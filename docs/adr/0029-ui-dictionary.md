# ADR-0029：介面文字放自寫的 TS 字典，錯誤以訊息 key 傳遞

日期：2026-10-15
狀態：Accepted

## 背景

介面文字（按鈕、placeholder、aria-label、toast、錯誤）要有中英兩種（#53）。只有兩種語言、一個使用者，文字量約兩百條。錯誤訊息有一部分來自 server（Server Action、zod schema、匯入 Route Handler），它們在深處拋出或寫在模組層級的 schema，不知道目前語言。

## 決策

- 字典是 `src/lib/i18n/messages/` 的 TS 物件：`en.ts` 定義結構與型別，`zh.ts` 以 `satisfies Messages` 檢查，少一條或多一條都是型別錯誤。有參數的訊息寫成函式（`fileTooLarge: ({ mb }) => ...`）。
- 元件以 `useMessages()` 取得目前語言的字典（`LocaleProvider` 提供）。
- server 產生、要給使用者看的訊息一律是訊息 key（`ErrorMessage`：`{ key, values? }`，key 是字典 `errors` 區的名稱），在畫面上翻譯。zod schema 的 message 寫 key；`ActionResult`、`ImportError`、匯入回應都帶 `ErrorMessage`。
- 不用 i18n 函式庫。

## 考慮過的替代方案

- next-intl / i18next：有複數規則、ICU 格式、命名空間、延遲載入；兩種語言、兩百條文字用不到，還要多一層設定與 provider。
- JSON 字典（Next.js 指南的做法）：要另外寫型別或產生型別，參數插值要自己解析字串。
- server 依 cookie 先翻好再回傳字串：深處的錯誤與模組層級的 zod schema 拿不到語言，要把語言一路傳下去。

## 後果

- 新增介面文字時，`en.ts` 與 `zh.ts` 都要加；型別檢查會擋下漏寫的那份。
- server 端給使用者看的訊息不能直接寫英文字串，要在字典 `errors` 加 key。
- 字典兩種語言都會進 client bundle（目前數 KB，可接受）。
- 第三方回來的原文（Anthropic API 的錯誤說明）以參數附在訊息中，不翻譯。

## 相關

PLAN-009、#53、ADR-0028、`src/lib/i18n/messages/`、`src/lib/action-result.ts`
