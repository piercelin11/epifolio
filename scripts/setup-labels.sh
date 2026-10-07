#!/usr/bin/env bash
# 建立專案 labels（可重複執行；--force 會更新已存在的）。需要 gh 已登入且位於 GitHub repo 內。
set -euo pipefail

create() { gh label create "$1" --color "$2" --description "$3" --force; }

# type
create "feature"          "1d76db" "新功能"
create "bug"              "d73a4a" "錯誤"
create "chore"            "cfd3d7" "雜務、維護"
create "docs"             "0075ca" "文件"
# area
create "area:recipe"      "5319e7" "食譜資料與頁面"
create "area:menu"        "5319e7" "菜單與翻頁檢視"
create "area:ui"          "5319e7" "共用 UI、主題"
create "area:export"      "5319e7" "輸出（PDF 等）"
# priority
create "p0"               "b60205" "最優先"
create "p1"               "d93f0b" "高"
create "p2"               "fbca04" "一般"
# special
create "plan"             "0e8a16" "對應 docs/plans 的父 issue"
create "later"            "ededed" "暫緩，之後再做"
create "blocked"          "e99695" "被卡住"
create "needs-decision"   "f9d0c4" "等使用者拍板"
create "wontfix"          "ffffff" "決定不做"
create "known-limitation" "c5def5" "已知限制（見對應功能頁）"
