# 干涉與繞射：翻頁式互動教材

高一必修物理「干涉與繞射」單元的線上互動教材，共三節課（每節 50 分鐘）。內容整合自 10 份教材開發示範文件：核心教材文本、單元教案、學習單、延伸資源、核心題目、雙向細目表、多模態素材清單、多模態需求腳本、數位整合規劃，以及常見學習困難與引導策略。

**線上閱讀：** https://huang-yi-wu.github.io/interference-diffraction/

## 內容

| 區段 | 內容 |
|---|---|
| 開始之前 | 封面、目錄、單元導覽與使用說明、課前暖身 |
| 第1節 波的疊加與水波干涉 | 兩脈衝相遇動畫、疊加原理、繩波疊加模擬、振動合成模擬、水波干涉模擬、腹線與節線、水波 CER、小測 |
| 第2節 光的雙狹縫干涉 | 預測畫板、雙狹縫實拍、惠更斯原理動畫、雙狹縫模擬、B／D 亮暗模型、光 CER、小測 |
| 第3節 光的繞射與生活應用 | 單狹縫實拍與模擬、干涉與繞射比較、薄膜干涉模擬、生活現象分類、波動性論證、隨堂測驗 |
| 課後 | 總學習單（下載 JSON／CSV）、總評量（14 題 30 分）、延伸學習 |
| 教師專區 | 教學流程、核心題目卡、雙向細目表、素材與需求腳本、學習困難與引導、文件對照 |

## 使用方式

- 翻頁：下方按鈕、鍵盤 ← →、手機左右滑動，或下拉選單跳頁；上方「目錄」可跳到任一頁。
- 右上角切換「學生／教師」。教師模式顯示每頁教師提示與教師專區。
- 作答自動存在瀏覽器（localStorage），不會上傳；可在「總學習單」下載作答紀錄或清除。
- 純靜態網站，不需安裝或伺服器。本機使用：下載後直接開啟 `index.html`。

## 檔案

- `index.html`：全部頁面
- `book.css`：版面與樣式
- `book.js`：翻頁、目錄、作答暫存、引導提問、提示階梯、測驗計分、匯出
- `sims.js`：動畫與互動模擬（依波動模型即時計算）
- `img/`：文件 07B、08 的圖；`img/photos/`：Wikimedia Commons 實拍照片

## 圖片來源與授權

封面、動畫、模擬與示意圖由本教材程式生成。實拍照片取自 Wikimedia Commons，縮為寬約 1200 像素，未做其他修改，依各自授權使用：

| 照片 | 作者 | 授權 |
|---|---|---|
| [紅光雙狹縫干涉](https://commons.wikimedia.org/wiki/File:Subwavelength_slits.JPG) | Bryan Tong Minh | Public Domain |
| [藍光單狹縫繞射](https://commons.wikimedia.org/wiki/File:Blue_laser_single_slit_diffraction_photo.jpg) | Xyqorophibian | CC BY-SA 4.0 |
| [光凳器材組](https://commons.wikimedia.org/wiki/File:Optical_Bench_educational_Kit_-_Cuesta_College.jpg) | Waifer X／Cuesta College | CC BY 2.0 |
| [光凳實際架設](https://commons.wikimedia.org/wiki/File:Banc_optique_-_exemple_de_montage_01.jpg) | Cantons-de-l'Est | CC BY-SA 4.0 |
| [可調式單狹縫器](https://commons.wikimedia.org/wiki/File:Xy_adjustable_optical_slit.jpg) | Jan Krieger | CC BY-SA 3.0 |
| [肥皂泡](https://commons.wikimedia.org/wiki/File:Thin_Film_Interference_Soap_Bubble.jpg) | Pksois23 | CC BY-SA 4.0 |
| [肥皂膜](https://commons.wikimedia.org/wiki/File:%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D1%80%D0%B5%D0%BD%D1%86%D0%B8%D1%8F_%D0%B2_%D1%82%D0%BE%D0%BD%D0%BA%D0%BE%D0%B9_%D0%BC%D1%8B%D0%BB%D1%8C%D0%BD%D0%BE%D0%B9_%D0%BF%D0%BB%D1%91%D0%BD%D0%BA%D0%B5.jpg) | Yaroslav Ulyushin | CC BY 4.0 |
| [油膜](https://commons.wikimedia.org/wiki/File:Rainbow_Pollution.jpg) | gambier20 | CC BY 2.0 |
| [光碟虹彩](https://commons.wikimedia.org/wiki/File:CD_rainbow.jpg) | Hapecko | CC BY-SA 4.0 |
| [牛頓環](https://commons.wikimedia.org/wiki/File:Newton_rings.jpg) | Ulfbastel | Public Domain |
| [一般與抗反射鏡片](https://commons.wikimedia.org/wiki/File:Reflective_and_anti-reflective_lens.jpg) | Maximilian Schönherr | CC0 |
| [藍閃蝶](https://commons.wikimedia.org/wiki/File:Blue_Morpho_butterfly_(Morpho_peleides)_wings_open.jpg) | Alias 0591（Rene Mensen） | CC BY 2.0 |
| [孔雀羽毛](https://commons.wikimedia.org/wiki/File:Peacock_feathers._(20779300743).jpg) | Bernard Spragg. NZ | CC0 |
| [望遠鏡繞射尖峰](https://commons.wikimedia.org/wiki/File:A_slice_of_Sagittarius.jpg)（僅外連） | ESA/Hubble & NASA | CC BY 4.0 |

CC BY-SA 照片的縮圖依同一授權提供。字型：Noto Sans TC、Noto Serif TC、IBM Plex Mono（Google Fonts，SIL Open Font License）。知識內容查核依據：OpenStax University Physics Vol. 1 §16.5、Vol. 3 §3.1、§3.4、§4.1。
