# ADR-0002：圖片存放在本機 public/uploads

日期：2026-10-07
狀態：Accepted

## 背景

食譜與菜單需要上傳圖片。目前只在本機使用，不部署。

## 決策

Server Action 將圖片寫入 `public/uploads/`（gitignored），資料庫只存相對路徑。所有寫檔集中在單一 `saveImage()` 函式；前端上傳前先壓縮，顯示使用 `next/image`。

## 考慮過的替代方案

- 雲端物件儲存（S3、Cloudflare R2、Vercel Blob）：可部署，但需要帳號、金鑰與費用，本機使用不需要。
- 圖片以 BLOB 存進 SQLite：備份單純，但資料庫膨脹且無法直接由靜態路徑提供。

## 後果

- 圖片不進 git，備份需要另外處理 `public/uploads/`。
- 日後部署或跨裝置時，只需替換 `saveImage()` 的實作並遷移既有檔案。

## 相關

PLAN-001（圖片上傳細節）
