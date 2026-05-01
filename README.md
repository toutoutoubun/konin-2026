# 高認パス / webapp

## Project Overview
- **Name**: 高認パス
- **Goal**: 高等学校卒業程度認定試験（高認）の公開過去問を科目別に整理し、頻出傾向を知的でグラフィカルに確認できるUIプロトタイプ。
- **Design Tone**: レトロモダン・ポップ。クリーム背景、ブラックのタイポグラフィ、ビビッドブルー／サンセットオレンジ／ウォームイエローを限定的に使用。
- **Privacy Model**: PDFアップロードはブラウザ内処理を想定。サーバー送信を行わない設計。

## Currently Completed Features
- トップページ
  - 高認パス概要
  - 文科省過去問ページへの導線
  - 出願Todoリスト（チェック状態をLocalStorage保存）
  - 次回試験日・出願期限の事実ベース表示
  - 全対象科目のカード一覧
- 科目詳細ページ
  - PDFアップロードエリア（ドラッグ&ドロップ、複数選択、スケルトン表示）
  - よく出る単元ランキング（表／グラフ切替）
  - 近年頻出ランキング
  - 出題形式分布
  - 年度推移グラフと同一データ表
  - 制度区分・試験回範囲・単元大分類・出題形式フィルタ
  - 情報科目の準備中表示
- 補助ページ
  - タグ定義ページ
  - 更新履歴ページ
- アクセシビリティ
  - スキップリンク
  - 44px以上の操作領域
  - 明確なフォーカスリング
  - 表とグラフの併設
  - aria-liveによる動的状態通知
  - 表示設定パネル（ふりがな、文字サイズ、UDフォント、行間、文字間隔）

## Functional Entry URIs
- `/` — トップページ
- `/subjects/kokugo` — 国語
- `/subjects/math` — 数学
- `/subjects/english` — 英語
- `/subjects/history` — 歴史（新課程／旧課程区分を内包）
- `/subjects/geography` — 地理（新課程／旧課程区分を内包）
- `/subjects/civics` — 公民（新課程／旧課程区分を内包）
- `/subjects/science-life` — 科学と人間生活
- `/subjects/physics` — 物理基礎
- `/subjects/chemistry` — 化学基礎
- `/subjects/biology` — 生物基礎
- `/subjects/earth-science` — 地学基礎
- `/subjects/informatics` — 情報（準備中）
- `/tags` — タグ定義
- `/updates` — 更新履歴

## Data Architecture
- **Data Models**: 科目リスト、単元ランキング、形式分布、年度推移、タグ定義、更新履歴。
- **Storage Services**: 外部DBなし。表示設定とTodoチェック状態のみLocalStorageに保存。
- **Data Flow**: HonoがHTMLを返し、静的CSS/JSがUI状態を制御。PDF解析はPhase 1ではUI挙動のプロトタイプ。

## User Guide
1. トップページで文科省の過去問ページを開き、PDFを入手する。
2. 科目カードから対象科目の詳細ページへ移動する。
3. PDFアップロード領域でファイルを選択またはドラッグ&ドロップする。
4. 表／グラフ、フィルタ、タグ定義を使って表示条件を確認する。
5. ヘッダーの「表示設定」から読みやすさを調整する。

## Features Not Yet Implemented
- PDF本文の実解析ロジック
- PDFから試験回・単元・形式タグを自動判定する辞書・ルールエンジン
- 実データに基づくランキング生成
- 科目ごとの詳細なタグ定義拡充
- 単体テスト／E2Eテスト

## Recommended Next Steps
1. PDF.jsなどのクライアントサイドPDF解析ライブラリを導入する。
2. 科目別タグ辞書と付与ルールをJSON化する。
3. 実PDFから抽出したテキストを使って単元・形式タグの判定を実装する。
4. 解析不能PDF・空データ・誤判定時のユーザー向けエラー導線を強化する。

## Deployment
- **Platform**: Cloudflare Pages / Workers runtime
- **Status**: Local implementation completed, production not deployed
- **Tech Stack**: Hono + TypeScript + Vite + CSS + Vanilla JavaScript
- **Last Updated**: 2026-05-01
