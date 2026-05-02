# 高認パス / webapp

## Project Overview
- **Name**: 高認パス
- **Goal**: 高等学校卒業程度認定試験（高卒認定・高認）の公開済み過去問PDFを科目別に集計し、頻出傾向を知的でグラフィカルに可視化するWebツール。
- **Phase 1 Scope**: トップページ、科目別詳細ページ構成、英語頻出分析、数学頻出分析、タグ定義、更新履歴、表示設定、出願Todoリスト。
- **Design Tone**: レトロモダン・ポップ。クリーム背景、ブラックの大胆なタイポグラフィ、ビビッドブルー／サンセットオレンジ／ウォームイエローを限定的に使用。
- **Privacy Model**: PDF解析はPDF.jsとwink-NLPを使ったクライアントサイド処理。サーバーへのデータ送信は行わない。

## Currently Completed Features
- Next.js static export構成
- `/` 高認パストップページ
  - 高認パスとは
  - 文科省過去問の入手方法ガイド
  - 出願Todoリスト
  - 科目別ツール一覧カード
- 出願Todoリスト
  - STEP 1〜5のチェックリスト
  - チェック状態をLocalStorageに保存
  - 次回試験・次回出願期限の残日数を事実ベースで表示
- 共通UI
  - ヘッダー、主要ナビゲーション、パンくず、フッター
  - 表示設定パネル（ふりがな、文字サイズ、UDフォント、行間、文字間隔）
  - スキップリンク、フォーカスリング、44px以上の操作領域
- 科目別詳細ページ
  - `/subjects/[slug]/` に全対象科目を配置
  - 国語、歴史、地理、公民、科学と人間生活、物理基礎、化学基礎、生物基礎、地学基礎はPhase 1の構成画面
  - 情報は「令和8年度第1回より追加予定。現在過去問未公開のため分析機能は準備中です」と明示
  - 英語・数学は実装済み分析ページとして統合
- `/subjects/english/` および `/english/` 英語過去問頻出分析ページ
  - PDFアップロード（ドラッグ&ドロップ、複数PDF選択、スケルトン表示）
  - PDF.jsによるブラウザ内テキスト抽出
  - 年度検出とrule_set自動判定（EN_2014 / EN_2016 / EN_2024）
  - 問題構造検出、wink-NLPによる英語テキスト分析
  - Section B: よく出る単元ランキング（表／グラフ切替）
  - Section C: 近年頻出ランキング（重み付きスコア）
  - Section D: 出題形式分布（表＋グラフ）
  - Section E: 年度推移（表＋グラフ）
  - **Section F: 頻出語彙ランキング** [NEW v2.0]
    - wink-NLPで内容語を抽出し、CEFRレベル別に分類
    - 頻出語彙トップ20（順位・単語・品詞・CEFRレベル・出現回数・出現率）
    - CEFRレベル別語彙分布（表＋棒グラフ切替）
    - 機能語（冠詞・前置詞・接続詞など）は集計対象外
    - CEFRレベル・品詞でフィルタ可能
  - **Section G: 文法×語彙レベル掛け合わせ分析** [NEW v2.0]
    - 文法タグ×CEFRレベルのクロス集計（ヒートマップ形式）
    - ヒートマップ／表リスト切替可能
    - 傾向サマリー（事実ベースの記述のみ）
  - フィルタ（制度区分、試験回範囲、問題形式、文法項目、CEFRレベル、品詞）
- `/math/` 数学過去問頻出分析ページ
  - PDFアップロード（ドラッグ&ドロップ、複数PDF選択、スケルトン表示）
  - PDF.jsによるブラウザ内テキスト抽出
  - 年度検出（西暦・令和・平成対応）、試験回検出
  - 空白ページ・計算用紙・表紙・解答用紙の自動スキップ
  - 大問番号検出（「第1問」「問1」「[1]」「【1】」漢数字対応）
  - MATH_STD ルールセット（第1問〜第6問の6ブロック定義）
  - topic_l1（大分類）マッピング：数と式、二次関数、図形と計量、データの分析、場合の数と確率、整数の性質
  - topic_l2（小分類）キーワードマッチ
  - Section A〜F（単元ランキング、近年頻出、大問別分布、年度推移、フィルタ、注記）
- `/tags/` タグ定義ページ
- `/updates/` 更新履歴ページ

## Functional Entry URIs
- `/` — 高認パストップページ
- `/math/` — 数学頻出分析ツール
- `/subjects/english/` — 英語頻出分析ツール
- `/english/` — 英語頻出分析ツールへの旧導線互換ページ
- `/subjects/japanese/` — 国語詳細ページ構成
- `/subjects/history/` — 歴史詳細ページ構成（旧課程：日本史A・B・世界史A・B）
- `/subjects/geography/` — 地理詳細ページ構成（旧課程：地理A・B）
- `/subjects/civics/` — 公民詳細ページ構成（旧課程：現代社会・倫理・政治経済）
- `/subjects/science-life/` — 科学と人間生活詳細ページ構成
- `/subjects/physics/` — 物理基礎詳細ページ構成
- `/subjects/chemistry/` — 化学基礎詳細ページ構成
- `/subjects/biology/` — 生物基礎詳細ページ構成
- `/subjects/earth-science/` — 地学基礎詳細ページ構成
- `/subjects/informatics/` — 情報準備中ページ
- `/tags/` — タグ定義ページ
- `/updates/` — 更新履歴ページ

## Data Architecture
- **Data Models**
  - `Subject`: 科目カード、詳細ページ、実装状態、旧課程区分
  - `RuleSet` (English): 年度別制度区分、問題数、形式分布
  - `MathRuleSet`: MATH_STDルールセット、6ブロック定義、keyword_map
  - `AnalysisResult` (English): PDFごとの抽出テキスト、試験回、制度区分、問題ブロック、文法タグ、形式件数、**vocabItems, cefrDistribution, grammarVocabCross** [v2.0]
  - `MathAnalysisResult`: PDFごとの年度、試験回、大問ブロック、小問、topic_l1/l2、数式のみフラグ
  - `MathAggregateSummary`: 単元ランキング、近年頻出スコア、大問別分布、年度推移
  - `VocabItem`: 単語、品詞、CEFRレベル、出現回数 [v2.0]
  - `CefrDistributionRow`: CEFRレベル、語彙数、構成比 [v2.0]
  - `GrammarVocabCrossCell`: 文法タグ×CEFRレベルの件数 [v2.0]
- **Storage Services**: 外部DBなし。PDF解析結果はブラウザメモリ上のみ。表示設定と出願TodoのみLocalStorageに保存。
- **Static Data**
  - `data/subjects.ts`: 科目一覧、公式リンク、次回試験・出願期限
  - `data/englishTags.json`: 英語rule_set、文法タグ、CEFRレベル
  - `data/cefrVocab.json`: CEFR A1〜B2語彙リスト＋機能語リスト [v2.0]
  - `data/mathTags.json`: 数学MATH_STDルールセット、6ブロック定義、topic_l1/l2、keyword_map
- **Data Flow**
  - 英語: ユーザーがPDFを選択 → PDF.jsでテキスト抽出 → 年度・制度区分判定 → 問題構造検出 → wink-NLPで英文解析 → **vocabAnalyzerでCEFR語彙レベル判定・品詞分類・クロス集計** → Rechartsと表で可視化
  - 数学: ユーザーがPDFを選択 → PDF.jsでテキスト抽出 → ページ分類 → 大問番号検出 → topic_l1/l2マッピング → 集計・可視化

## Main Files
- `app/page.tsx` — 高認パストップページ
- `app/subjects/[slug]/page.tsx` — 科目詳細ページ
- `app/english/page.tsx` — 英語分析ページ本体
- `app/math/page.tsx` — 数学分析ページ本体
- `app/tags/page.tsx` — タグ定義ページ
- `app/updates/page.tsx` — 更新履歴ページ
- `components/ApplicationTodo.tsx` — 出願Todoリスト
- `components/PDFUploader.tsx` — 英語PDFアップロードUI
- `components/MathPDFUploader.tsx` — 数学PDFアップロードUI
- `components/FilterPanel.tsx` — 英語フィルタUI（CEFRレベル・品詞対応） [v2.0更新]
- `components/MathFilterPanel.tsx` — 数学フィルタUI
- `components/FrequencyChart.tsx` — Rechartsグラフ（共通）
- `components/RankingTable.tsx` — ランキング表（共通）
- `components/VocabRankingTable.tsx` — 頻出語彙トップ20表 [v2.0]
- `components/CEFRDistributionChart.tsx` — CEFRレベル別語彙分布（表＋グラフ） [v2.0]
- `components/GrammarVocabCrossTable.tsx` — 文法×語彙レベルクロス集計（ヒートマップ） [v2.0]
- `components/DisplaySettings.tsx` — 表示設定パネル
- `components/SkeletonLoader.tsx` — スケルトンローダー
- `lib/pdfParser.ts` — 英語PDF.jsテキスト抽出（vocabAnalyzer統合） [v2.0更新]
- `lib/vocabAnalyzer.ts` — CEFR語彙レベル判定・品詞分類・クロス集計 [v2.0]
- `lib/mathPdfParser.ts` — 数学PDF.jsテキスト抽出
- `lib/mathPatternMatcher.ts` — 数学大問/小問/選択肢パターン検出、ページ分類
- `lib/mathTagMapper.ts` — 数学topic_l1/l2マッピング、キーワードマッチ
- `lib/mathScoreCalculator.ts` — 数学集計・重み付きスコア・フィルタ
- `lib/textAnalyzer.ts` — wink-NLP文法・語彙解析
- `lib/tagMapper.ts` — 英語年度判定、rule_set、問題形式マッピング [v2.0型拡張]
- `lib/scoreCalculator.ts` — 英語集計と重み付きスコア計算（語彙集計・CEFR分布・クロス集計対応） [v2.0更新]
- `data/cefrVocab.json` — CEFR A1〜B2公開語彙リスト＋機能語リスト [v2.0]
- `data/englishTags.json` — 英語ルールセット定義
- `data/mathTags.json` — 数学ルールセット定義

## User Guide
1. `/` を開く。
2. 文科省公開の過去問PDF入手方法と出願Todoを確認する。
3. ツール一覧から科目詳細ページを開く。
4. 英語は `/subjects/english/` でPDFをアップロードする。
5. 数学は `/math/` でPDFをアップロードする（複数年度同時選択可）。
6. 解析完了後、検出された試験回・大問構造を確認する。
7. よく出る単元（Section B）、近年頻出（Section C）、出題形式分布（Section D）、年度推移（Section E）を見る。
8. **頻出語彙ランキング（Section F）でCEFRレベル別の語彙分析を確認する。** [v2.0]
9. **文法×語彙レベル分析（Section G）で文法項目とCEFRレベルのクロス集計を確認する。** [v2.0]
10. フィルタで制度区分・試験回範囲・問題形式・文法項目・CEFRレベル・品詞の表示条件を変える。
11. ヘッダーの「表示設定」から読みやすさを調整する。

## Features Not Yet Implemented
- 数学以外の科目別PDF解析ロジック（国語、歴史、地理、公民、理科系）
- 実PDFの多様なレイアウトに対する細かな補正ルール
- CEFR推定の外部辞書連携による精度向上
- オリジナル問題演習機能
- 自動テスト／E2Eテスト

## Recommended Next Steps
1. 実際の文科省英語PDFサンプルでCEFR語彙分類とクロス集計の精度を検証する。
2. cefrVocab.jsonの語彙リストをさらに充実させる（Oxford 3000等の公開リスト参照）。
3. 国語・歴史など、科目別タグ定義と解析ルールを追加する。
4. 科目別の頻出分析ロジックを順次実装する。
5. オリジナル問題演習のUIと採点ロジックを追加する。
6. E2Eテストでアップロード、フィルタ、表示設定、Todo保存を検証する。

## Deployment
- **Platform**: Cloudflare Pages static hosting
- **Build Output**: `out/`
- **Tech Stack**: Next.js 14 static export + TypeScript + Tailwind CSS + PDF.js + wink-NLP + Recharts
- **Status**: Local implementation completed, production not deployed
- **Last Updated**: 2026-05-02
