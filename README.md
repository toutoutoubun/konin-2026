# 高認パス / webapp

## Project Overview
- **Name**: 高認パス
- **Goal**: 高等学校卒業程度認定試験（高卒認定・高認）の公開済み過去問PDFを科目別に集計し、頻出傾向を知的でグラフィカルに可視化するWebツール。
- **Phase 1 Scope**: トップページ、科目別詳細ページ構成、英語頻出分析、タグ定義、更新履歴、表示設定、出願Todoリスト。
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
  - 国語、数学、歴史、地理、公民、科学と人間生活、物理基礎、化学基礎、生物基礎、地学基礎はPhase 1の構成画面
  - 情報は「令和8年度第1回より追加予定。現在過去問未公開のため分析機能は準備中です」と明示
  - 英語は実装済み分析ページとして統合
- `/subjects/english/` および `/english/` 英語過去問頻出分析ページ
  - PDFアップロード
  - ドラッグ&ドロップ対応
  - 複数PDF選択対応
  - アップロード中スケルトン表示
  - 解析完了後にファイル名・検出試験回・制度区分を表示
  - PDF.jsによるブラウザ内テキスト抽出
  - 年度検出とrule_set自動判定
    - `EN_2014`: 2014〜2015年度
    - `EN_2016`: 2016〜2023年度
    - `EN_2024`: 2024〜2025年度
  - 問題構造検出
  - wink-NLPによる英語テキスト分析
  - よく出る単元ランキング（表／グラフ切替）
  - 近年頻出ランキング（重み付きスコア）
  - 出題形式分布（表＋グラフ）
  - 年度推移（表＋グラフ）
  - フィルタ（制度区分、試験回範囲、問題形式、文法項目）
  - 注記とタグ定義へのリンク
- `/tags/` タグ定義ページ
  - 科目タブ
  - タグ定義表
  - 形式タグ一覧
  - 判定保留タグの説明
  - 英語rule_set一覧
- `/updates/` 更新履歴ページ
  - 履歴テーブル（日付・対象科目・変更内容・影響範囲）

## Functional Entry URIs
- `/` — 高認パストップページ
- `/subjects/japanese/` — 国語詳細ページ構成
- `/subjects/math/` — 数学詳細ページ構成
- `/subjects/english/` — 英語頻出分析ツール
- `/english/` — 英語頻出分析ツールへの旧導線互換ページ
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
  - `RuleSet`: 年度別制度区分、問題数、形式分布
  - `AnalysisResult`: PDFごとの抽出テキスト、試験回、制度区分、問題ブロック、文法タグ、形式件数
  - `AggregateSummary`: ランキング、近年頻出スコア、形式分布、年度推移
- **Storage Services**: 外部DBなし。PDF解析結果はブラウザメモリ上のみ。表示設定と出願TodoのみLocalStorageに保存。
- **Static Data**
  - `data/subjects.ts`: 科目一覧、公式リンク、次回試験・出願期限
  - `data/englishTags.json`: 英語rule_set、文法タグ、CEFRレベル
- **Data Flow**: ユーザーがPDFを選択 → PDF.jsでテキスト抽出 → 年度・制度区分判定 → 問題構造検出 → wink-NLPで英文解析 → Rechartsと表で可視化。

## Main Files
- `app/page.tsx` — 高認パストップページ
- `app/subjects/[slug]/page.tsx` — 科目詳細ページ
- `app/english/page.tsx` — 英語分析ページ本体
- `app/tags/page.tsx` — タグ定義ページ
- `app/updates/page.tsx` — 更新履歴ページ
- `components/ApplicationTodo.tsx` — 出願Todoリスト
- `components/PDFUploader.tsx` — PDFアップロードと解析開始UI
- `components/FilterPanel.tsx` — フィルタUI
- `components/FrequencyChart.tsx` — Rechartsグラフ
- `components/RankingTable.tsx` — ランキング表
- `components/DisplaySettings.tsx` — 表示設定パネル
- `lib/pdfParser.ts` — PDF.jsテキスト抽出
- `lib/textAnalyzer.ts` — wink-NLP文法・語彙解析
- `lib/tagMapper.ts` — 年度判定、rule_set、問題形式マッピング
- `lib/scoreCalculator.ts` — 集計と重み付きスコア計算

## User Guide
1. `/` を開く。
2. 文科省公開の過去問PDF入手方法と出願Todoを確認する。
3. ツール一覧から科目詳細ページを開く。
4. 英語は `/subjects/english/` でPDFをアップロードする。
5. 解析完了後、検出された試験回・制度区分を確認する。
6. よく出る単元、近年頻出、出題形式分布、年度推移を見る。
7. 制度区分・試験回範囲・問題形式・文法項目のフィルタで表示条件を変える。
8. ヘッダーの「表示設定」から読みやすさを調整する。

## Features Not Yet Implemented
- 英語以外の科目別PDF解析ロジック
- 実PDFの多様なレイアウトに対する細かな補正ルール
- CEFR推定の外部辞書連携による精度向上
- オリジナル問題演習機能
- 自動テスト／E2Eテスト

## Recommended Next Steps
1. 実際の文科省PDFサンプルで英語抽出精度を検証する。
2. 国語・数学など、科目別タグ定義と解析ルールを追加する。
3. 科目別の頻出分析ロジックを順次実装する。
4. オリジナル問題演習のUIと採点ロジックを追加する。
5. E2Eテストでアップロード、フィルタ、表示設定、Todo保存を検証する。

## Deployment
- **Platform**: Cloudflare Pages static hosting
- **Build Output**: `out/`
- **Tech Stack**: Next.js static export + TypeScript + Tailwind CSS + PDF.js + wink-NLP + Recharts
- **Status**: Local implementation completed, production not deployed
- **Last Updated**: 2026-05-01
