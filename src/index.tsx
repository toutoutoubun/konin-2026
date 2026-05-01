import { Hono } from 'hono'

type Subject = {
  slug: string
  name: string
  status?: 'ready' | 'preparing'
  note?: string
  divisions?: string[]
  accent: 'blue' | 'orange' | 'yellow'
}

const officialPastExamUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/1421021.htm'
const officialExamUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/'

const subjects: Subject[] = [
  { slug: 'kokugo', name: '国語', accent: 'blue' },
  { slug: 'math', name: '数学', accent: 'orange' },
  { slug: 'english', name: '英語', accent: 'yellow' },
  { slug: 'history', name: '歴史', divisions: ['新課程', '旧課程：日本史A', '旧課程：日本史B', '旧課程：世界史A', '旧課程：世界史B'], accent: 'blue' },
  { slug: 'geography', name: '地理', divisions: ['新課程', '旧課程：地理A', '旧課程：地理B'], accent: 'orange' },
  { slug: 'civics', name: '公民', divisions: ['新課程', '旧課程：現代社会', '旧課程：倫理', '旧課程：政治経済'], accent: 'yellow' },
  { slug: 'science-life', name: '科学と人間生活', accent: 'blue' },
  { slug: 'physics', name: '物理基礎', accent: 'orange' },
  { slug: 'chemistry', name: '化学基礎', accent: 'yellow' },
  { slug: 'biology', name: '生物基礎', accent: 'blue' },
  { slug: 'earth-science', name: '地学基礎', accent: 'orange' },
  { slug: 'informatics', name: '情報', status: 'preparing', note: '令和8年度第1回より追加予定。現在過去問未公開のため分析機能は準備中です。', accent: 'yellow' }
]

const unitsBySubject: Record<string, string[]> = {
  kokugo: ['評論読解', '古文', '漢文', '文学的文章', '語句知識'],
  math: ['二次関数', '図形と計量', '確率', '数と式', 'データの分析'],
  english: ['長文読解', '会話表現', '文法・語法', '図表読み取り', '語彙'],
  history: ['近現代史', '世界史の交流', '日本史の政治', '文化史', '資料読解'],
  geography: ['地形図読解', '気候', '産業', '人口・都市', '地域調査'],
  civics: ['日本国憲法', '市場経済', '国際政治', '社会保障', '倫理思想'],
  'science-life': ['生命の科学', '物質の科学', '光や熱の科学', '宇宙や地球の科学', '科学技術と人間生活'],
  physics: ['力と運動', '波', '電気', '熱', 'エネルギー'],
  chemistry: ['物質の構成', '化学結合', '物質量', '酸と塩基', '酸化還元'],
  biology: ['細胞', '遺伝子', '体内環境', '生態系', '進化'],
  'earth-science': ['地球の構造', '大気と海洋', '天体', '地層', '自然災害'],
  informatics: ['情報社会', 'データ活用', 'ネットワーク', 'プログラミング', '情報デザイン']
}

const forms = ['選択式', '資料読解', '計算', '記述補助', '図表読み取り']

function baseLayout(options: { title: string; path: string; current: string; children: string; description?: string }) {
  const crumb = options.path === '/' ? 'トップページ' : `<a href="/">トップページ</a><span aria-hidden="true">/</span><span>${options.current}</span>`
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${options.description ?? '高認パスは高等学校卒業程度認定試験の過去問傾向をブラウザ上で確認するUIプロトタイプです。'}">
  <title>${options.title} | 高認パス</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23FFD166'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-size='22' font-family='serif' fill='%231A1A1A'%3EKP%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=BIZ+UDMincho&family=DM+Serif+Display:ital@0;1&family=Shippori+Mincho:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/static/style.css">
</head>
<body data-page="${options.path}">
  <a class="skip-link" href="#main-content">本文へ移動</a>
  <header class="site-header" role="banner">
    <a class="brand" href="/" aria-label="高認パス トップページへ">
      <span class="brand-mark" aria-hidden="true">KP</span>
      <span class="brand-text">高認パス</span>
    </a>
    <nav class="main-nav" aria-label="主要ナビゲーション">
      <a href="/"${options.path === '/' ? ' aria-current="page"' : ''}>トップ</a>
      <a href="/tags"${options.path === '/tags' ? ' aria-current="page"' : ''}>タグ定義</a>
      <a href="/updates"${options.path === '/updates' ? ' aria-current="page"' : ''}>更新履歴</a>
    </nav>
    <button class="settings-toggle" type="button" aria-expanded="false" aria-controls="display-settings">表示設定</button>
  </header>

  <aside id="display-settings" class="settings-panel" aria-labelledby="settings-title" hidden>
    <div class="settings-panel__inner">
      <h2 id="settings-title">表示設定</h2>
      <p id="settings-help">読みやすさの設定はこの端末に保存されます。</p>
      <div class="setting-grid" role="group" aria-describedby="settings-help">
        <button type="button" class="setting-button" data-setting="ruby" aria-pressed="false">ふりがな</button>
        <button type="button" class="setting-button" data-setting="textSize" aria-pressed="false">文字サイズ 大</button>
        <button type="button" class="setting-button" data-setting="udFont" aria-pressed="false">UDフォント</button>
        <button type="button" class="setting-button" data-setting="wideLine" aria-pressed="false">行間 ひろびろ</button>
        <button type="button" class="setting-button" data-setting="wideLetter" aria-pressed="false">文字間隔 ひろびろ</button>
      </div>
    </div>
  </aside>

  <nav class="breadcrumb" aria-label="パンくずリスト">${crumb}</nav>

  <main id="main-content" tabindex="-1">
    ${options.children}
  </main>

  <footer class="site-footer" role="contentinfo">
    <p><strong>更新日</strong> 2026-05-01</p>
    <p><strong>データ範囲</strong> 画面表示用のサンプルデータ。PDF解析はブラウザ内で扱う設計です。</p>
    <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。公開済みデータを集計している補助ツールです。</p>
    <p><a href="${officialExamUrl}" target="_blank" rel="noopener">文部科学省 高等学校卒業程度認定試験ページ</a></p>
  </footer>
  <script src="/static/app.js" defer></script>
</body>
</html>`
}

function homePage() {
  const subjectCards = subjects.map((subject) => `
    <article class="subject-card accent-${subject.accent}${subject.status === 'preparing' ? ' is-preparing' : ''}">
      <p class="eyebrow">SUBJECT</p>
      <h3>${subject.name}</h3>
      <p>${subject.status === 'preparing' ? '分析機能は準備中です。' : 'PDFを読み込み、よく出る単元と出題形式を確認します。'}</p>
      ${subject.divisions ? `<p class="small-text">制度区分：${subject.divisions.join(' / ')}</p>` : ''}
      ${subject.note ? `<p class="small-text">${subject.note}</p>` : ''}
      <a class="card-link" href="/subjects/${subject.slug}" aria-label="${subject.name}の科目詳細ページへ">${subject.status === 'preparing' ? '状態を見る' : '分析画面へ'}</a>
    </article>`).join('')

  return baseLayout({
    title: 'トップページ',
    path: '/',
    current: 'トップページ',
    children: `
      <section class="hero" aria-labelledby="hero-title">
        <p class="eyebrow">PAST EXAM PATTERN TOOL</p>
        <h1 id="hero-title"><span class="latin">KONIN PASS</span><br><ruby>高認<rt>こうにん</rt></ruby>パス</h1>
        <p class="lead">高等学校卒業程度認定試験の公開過去問を、科目別に読み解くためのブラウザ内ツール。PDFはサーバーへ送信せず、この端末上で扱う設計です。</p>
        <div class="hero-actions" aria-label="主要操作">
          <a class="button button-primary" href="#subject-tools">科目を選ぶ</a>
          <a class="button button-secondary" href="${officialPastExamUrl}" target="_blank" rel="noopener">過去問を入手</a>
        </div>
      </section>

      <section class="content-section split-section" aria-labelledby="about-title">
        <div>
          <p class="eyebrow">OVERVIEW</p>
          <h2 id="about-title">高認パスとは</h2>
        </div>
        <p>公開済みデータを集計し、よく出る単元、出現回数、出現率を確認するためのUIです。励ましではなく、試験情報を静かに整理することを優先します。</p>
      </section>

      <section class="content-section guide-card" aria-labelledby="past-exam-title">
        <p class="eyebrow">SOURCE</p>
        <h2 id="past-exam-title">過去問の入手方法ガイド</h2>
        <ol class="number-list">
          <li>文部科学省の過去問題ページを開く。</li>
          <li>受験する科目と年度のPDFをダウンロードする。</li>
          <li>各科目ページでPDFをアップロードする。</li>
        </ol>
        <a class="button button-secondary" href="${officialPastExamUrl}" target="_blank" rel="noopener">文科省の過去問ページはこちら</a>
      </section>

      <section class="content-section" aria-labelledby="todo-title">
        <div class="section-heading">
          <p class="eyebrow">APPLICATION TODO</p>
          <h2 id="todo-title">出願Todoリスト</h2>
          <p id="exam-schedule" class="fact-strip" aria-live="polite">次回日程を確認しています。</p>
        </div>
        <div class="todo-list" role="list" aria-describedby="todo-title">
          ${renderTodoStep('1', '試験を知る', ['高卒認定試験の概要確認', '受験資格の確認', '科目と合格要件の確認', '試験日程の確認', '既取得単位による科目免除の確認'])}
          ${renderTodoStep('2', '科目を選ぶ', ['受験科目を決める', '免除申請できる科目を確認する', '過去問を文科省サイトからダウンロードする', '頻出分析ツールで出題傾向を確認する'])}
          ${renderTodoStep('3', '出願する', ['願書を入手する', '出願期間を確認する', '必要書類を揃える（住民票・証明写真・検定料など）', '検定料を確認・納付する（収入印紙）', '願書を郵送する（簡易書留）', '受験票の到着を確認する'])}
          ${renderTodoStep('4', '試験当日', ['試験会場と時間を確認する', '持ち物を確認する（受験票・鉛筆・消しゴム・時計など）'])}
          ${renderTodoStep('5', '合格後', ['合格証書の受け取りを確認する', '一部科目合格の場合、次回の受験科目を確認する'])}
        </div>
      </section>

      <section id="subject-tools" class="content-section" aria-labelledby="tools-title">
        <div class="section-heading">
          <p class="eyebrow">TOOLS</p>
          <h2 id="tools-title">ツール一覧</h2>
          <p>科目別カードから詳細ページへ進みます。主要操作はPDFアップロード、表示条件を変える、タグ定義の確認です。</p>
        </div>
        <div class="subject-grid">${subjectCards}</div>
      </section>
    `
  })
}

function renderTodoStep(step: string, title: string, items: string[]) {
  return `<article class="todo-step" role="listitem">
    <h3><span>STEP ${step}</span>${title}</h3>
    <ul class="check-list">
      ${items.map((item, index) => {
        const id = `todo-${step}-${index}`
        const link = item.includes('文科省') || item.includes('概要') ? ` <a href="${officialExamUrl}" target="_blank" rel="noopener">参照元</a>` : ''
        const subjectLink = item.includes('頻出分析') ? ' <a href="#subject-tools">科目一覧</a>' : ''
        return `<li><label for="${id}"><input id="${id}" type="checkbox" data-todo-id="${id}"> <span>${item}</span></label>${link}${subjectLink}</li>`
      }).join('')}
    </ul>
  </article>`
}

function subjectPage(subject: Subject) {
  if (subject.status === 'preparing') {
    return baseLayout({
      title: `${subject.name} 詳細`,
      path: `/subjects/${subject.slug}`,
      current: subject.name,
      children: `
        <section class="hero compact accent-${subject.accent}" aria-labelledby="subject-title">
          <p class="eyebrow">SUBJECT DETAIL</p>
          <h1 id="subject-title">${subject.name}</h1>
          <p class="lead">${subject.note}</p>
        </section>
        <section class="content-section empty-state" aria-labelledby="preparing-title" aria-live="polite">
          <h2 id="preparing-title">分析機能は準備中です</h2>
          <p>令和8年度第1回より追加予定。現在過去問未公開のため分析機能は準備中です。</p>
          <a class="button button-secondary" href="/">トップページへ戻る</a>
        </section>`
    })
  }

  return baseLayout({
    title: `${subject.name} 詳細`,
    path: `/subjects/${subject.slug}`,
    current: subject.name,
    children: `
      <section class="hero compact accent-${subject.accent}" aria-labelledby="subject-title" data-subject="${subject.slug}">
        <p class="eyebrow">SUBJECT DETAIL</p>
        <h1 id="subject-title">${subject.name}</h1>
        <p class="lead">文科省公開の過去問PDFをアップロードすると分析します。ファイルはブラウザ内で扱い、サーバーへ送信しません。</p>
        ${subject.divisions ? `<p class="division-note">制度区分：${subject.divisions.join(' / ')}</p>` : ''}
      </section>

      <section class="content-section upload-section" aria-labelledby="upload-title">
        <div class="section-heading">
          <p class="eyebrow">SECTION A</p>
          <h2 id="upload-title">PDFアップロード</h2>
          <p id="upload-help">文科省公開の過去問PDFをアップロードすると分析します。複数ファイルを年度別に選択できます。</p>
        </div>
        <div class="upload-zone" id="upload-zone" role="button" tabindex="0" aria-describedby="upload-help upload-status">
          <input id="pdf-input" type="file" accept="application/pdf,.pdf" multiple aria-label="過去問PDFを選択">
          <span class="upload-symbol" aria-hidden="true">PDF</span>
          <strong>ここへドラッグ&ドロップ</strong>
          <span>またはクリックしてPDFを選択</span>
        </div>
        <div id="upload-status" class="status-box" aria-live="polite">未解析。PDFを選択すると、解析したファイル名と試験回をここに表示します。</div>
        <a class="button button-secondary" href="${officialPastExamUrl}" target="_blank" rel="noopener">文科省の過去問ページはこちら</a>
      </section>

      <section class="content-section filter-section" aria-labelledby="filter-title">
        <div class="section-heading">
          <p class="eyebrow">SECTION F</p>
          <h2 id="filter-title">フィルタ</h2>
          <p id="filter-help">表示条件を変えると結果に即時反映されます。解除ボタンで初期状態に戻せます。</p>
        </div>
        <form id="filter-form" class="filter-grid" role="search" aria-describedby="filter-help">
          <label>制度区分
            <select name="division">
              <option value="all">全件</option>
              ${(subject.divisions ?? ['新課程']).map((division) => `<option value="${division}">${division}</option>`).join('')}
            </select>
          </label>
          <label>試験回範囲
            <select name="period">
              <option value="all">全件</option>
              <option value="recent">直近3回</option>
              <option value="older">それ以前</option>
            </select>
          </label>
          <label>単元大分類
            <select name="unit">
              <option value="all">全件</option>
              ${(unitsBySubject[subject.slug] ?? unitsBySubject.kokugo).map((unit) => `<option value="${unit}">${unit}</option>`).join('')}
            </select>
          </label>
          <label>出題形式
            <select name="form">
              <option value="all">全件</option>
              ${forms.map((form) => `<option value="${form}">${form}</option>`).join('')}
            </select>
          </label>
          <button class="button button-secondary" type="reset">解除</button>
        </form>
        <p id="filter-status" class="fact-strip" aria-live="polite">フィルタ未適用：全件表示。</p>
      </section>

      <section class="content-section results-section" aria-labelledby="ranking-title">
        <div class="section-heading inline-heading">
          <div>
            <p class="eyebrow">SECTION B</p>
            <h2 id="ranking-title">よく出る単元ランキング</h2>
          </div>
          <div class="toggle-group" role="group" aria-label="表示形式を切り替える">
            <button type="button" class="view-toggle is-active" data-view="table" aria-pressed="true">表</button>
            <button type="button" class="view-toggle" data-view="chart" aria-pressed="false">グラフ</button>
          </div>
        </div>
        <div class="result-table-wrap" data-view-panel="table" role="region" aria-label="よく出る単元ランキング表">
          ${rankingTable(subject.slug)}
        </div>
        <div class="chart-panel" data-view-panel="chart" role="img" aria-label="よく出る単元ランキングの棒グラフ" hidden>
          ${barChart(subject.slug)}
        </div>
      </section>

      <section class="content-section results-section" aria-labelledby="recent-title">
        <p class="eyebrow">SECTION C</p>
        <h2 id="recent-title">近年頻出ランキング</h2>
        ${recentTable(subject.slug)}
      </section>

      <section class="content-section results-section" aria-labelledby="format-title">
        <p class="eyebrow">SECTION D</p>
        <h2 id="format-title">出題形式分布</h2>
        ${formatTable()}
      </section>

      <section class="content-section results-section" aria-labelledby="trend-title">
        <p class="eyebrow">SECTION E</p>
        <h2 id="trend-title">年度推移</h2>
        <div class="trend-layout">
          <div class="line-chart" role="img" aria-label="試験回ごとの出現回数の推移グラフ">
            <svg viewBox="0 0 420 180" aria-hidden="true" focusable="false">
              <polyline points="20,130 100,100 180,115 260,70 340,45 400,60" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
              <g class="chart-dots"><circle cx="20" cy="130" r="6"/><circle cx="100" cy="100" r="6"/><circle cx="180" cy="115" r="6"/><circle cx="260" cy="70" r="6"/><circle cx="340" cy="45" r="6"/><circle cx="400" cy="60" r="6"/></g>
            </svg>
          </div>
          ${trendTable()}
        </div>
      </section>

      <section class="content-section note-section" aria-labelledby="note-title">
        <p class="eyebrow">SECTION G</p>
        <h2 id="note-title">注記とタグ定義</h2>
        <p>タグ付けは単元、形式、制度区分の組み合わせで整理します。判定保留タグは、資料や設問文だけでは分類しきれない場合に使います。</p>
        <a class="button button-secondary" href="/tags">タグ定義を見る</a>
      </section>`
  })
}

function rankingRows(slug: string) {
  const units = unitsBySubject[slug] ?? unitsBySubject.kokugo
  return units.map((unit, index) => ({ rank: index + 1, unit, count: 18 - index * 2, rate: 32 - index * 4 }))
}

function rankingTable(slug: string) {
  return `<table class="data-table" role="table">
    <caption>よく出る単元ランキング。フィルタ未適用時は全件表示。</caption>
    <thead><tr><th scope="col">順位</th><th scope="col">単元</th><th scope="col">出現回数</th><th scope="col">出現率</th></tr></thead>
    <tbody>${rankingRows(slug).map((row) => `<tr><td>${row.rank}</td><td>${row.unit}</td><td>${row.count}</td><td>${row.rate}%</td></tr>`).join('')}</tbody>
  </table>`
}

function barChart(slug: string) {
  return `<div class="bar-chart">${rankingRows(slug).map((row) => `<div class="bar-row"><span>${row.unit}</span><div class="bar-track"><span style="width:${row.rate * 2}%"></span></div><strong>${row.count}回</strong></div>`).join('')}</div>`
}

function recentTable(slug: string) {
  return `<table class="data-table" role="table">
    <caption>近年頻出ランキング。直近の出現と重み付きスコアを併記。</caption>
    <thead><tr><th scope="col">順位</th><th scope="col">単元</th><th scope="col">重み付きスコア</th><th scope="col">直近出現回</th></tr></thead>
    <tbody>${rankingRows(slug).slice(0, 4).map((row, index) => `<tr><td>${row.rank}</td><td>${row.unit}</td><td>${(9.8 - index * 0.8).toFixed(1)}</td><td>令和${7 - index}年度 第${index % 2 === 0 ? 2 : 1}回</td></tr>`).join('')}</tbody>
  </table>`
}

function formatTable() {
  const rows = [
    ['選択式', 42, '48%'],
    ['資料読解', 21, '24%'],
    ['図表読み取り', 14, '16%'],
    ['計算', 7, '8%'],
    ['記述補助', 4, '4%']
  ]
  return `<table class="data-table" role="table">
    <caption>出題形式分布。形式、件数、構成比を表示。</caption>
    <thead><tr><th scope="col">形式</th><th scope="col">件数</th><th scope="col">構成比</th></tr></thead>
    <tbody>${rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join('')}</tbody>
  </table>`
}

function trendTable() {
  const rows = [['令和5年度 第1回', 8], ['令和5年度 第2回', 11], ['令和6年度 第1回', 9], ['令和6年度 第2回', 15], ['令和7年度 第1回', 18], ['令和7年度 第2回', 16]]
  return `<table class="data-table compact-table" role="table">
    <caption>年度推移グラフと同一データの表。</caption>
    <thead><tr><th scope="col">試験回</th><th scope="col">出現回数</th></tr></thead>
    <tbody>${rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join('')}</tbody>
  </table>`
}

function tagsPage() {
  const tabs = ['国語', '数学', '英語', '歴史', '地理', '公民', '科学と人間生活', '理科', '情報']
  const rows = [
    ['UNIT-READ', '読解', '本文・資料から情報を読み取る問題', '設問の中心が読解である場合に付与', '評論読解、資料読解'],
    ['UNIT-CALC', '計算', '数式や数量処理を要する問題', '計算過程が得点判断に関わる場合に付与', '二次関数、物質量'],
    ['FORM-CHOICE', '選択式', '選択肢から解答を選ぶ形式', '選択肢が明示されている場合に付与', '四択、語句選択'],
    ['FORM-CHART', '図表読み取り', '表・グラフ・地図を使う形式', '図表が解答根拠になる場合に付与', '地形図、統計表'],
    ['HOLD-REVIEW', '判定保留', '分類を確定できない状態', '年度・資料不足で確定できない場合に付与', '複数単元にまたがる設問']
  ]
  return baseLayout({
    title: 'タグ定義',
    path: '/tags',
    current: 'タグ定義',
    children: `
      <section class="hero compact" aria-labelledby="tags-title">
        <p class="eyebrow">TAG DICTIONARY</p>
        <h1 id="tags-title">タグ定義</h1>
        <p class="lead">単元タグ、形式タグ、制度区分タグの扱いを一覧化します。</p>
      </section>
      <section class="content-section" aria-labelledby="subject-tabs-title">
        <h2 id="subject-tabs-title">科目タブ</h2>
        <div class="tab-list" role="tablist" aria-label="科目タブ">
          ${tabs.map((tab, index) => `<button type="button" role="tab" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}">${tab}</button>`).join('')}
        </div>
      </section>
      <section class="content-section" aria-labelledby="tag-table-title">
        <h2 id="tag-table-title">タグ定義表</h2>
        <table class="data-table" role="table">
          <caption>タグのコード、タグ名、定義、付与ルール、具体例。</caption>
          <thead><tr><th scope="col">コード</th><th scope="col">タグ名</th><th scope="col">定義</th><th scope="col">付与ルール</th><th scope="col">具体例</th></tr></thead>
          <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <div class="note-box">
          <h3>補助情報</h3>
          <p>形式タグ一覧：選択式、資料読解、計算、記述補助、図表読み取り。判定保留タグは分類を確定せず再確認するためのタグです。</p>
        </div>
      </section>`
  })
}

function updatesPage() {
  const rows = [
    ['2026-05-01', '全科目', 'Phase 1 UIを作成', '画面構成・表示設定・表とグラフ'],
    ['2026-05-01', '情報', '準備中ステータスを明示', '科目詳細ページ'],
    ['2026-05-01', 'タグ定義', '初期タグ定義を追加', 'タグ定義ページ']
  ]
  return baseLayout({
    title: '更新履歴',
    path: '/updates',
    current: '更新履歴',
    children: `
      <section class="hero compact" aria-labelledby="updates-title">
        <p class="eyebrow">CHANGE LOG</p>
        <h1 id="updates-title">更新履歴</h1>
        <p class="lead">変更内容と影響範囲を日付順に確認します。</p>
      </section>
      <section class="content-section" aria-labelledby="updates-table-title">
        <h2 id="updates-table-title">履歴テーブル</h2>
        <table class="data-table" role="table">
          <caption>日付、対象科目、変更内容、影響範囲。</caption>
          <thead><tr><th scope="col">日付</th><th scope="col">対象科目</th><th scope="col">変更内容</th><th scope="col">影響範囲</th></tr></thead>
          <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </section>`
  })
}

const app = new Hono()

app.get('/', (c) => c.html(homePage()))
app.get('/subjects/:slug', (c) => {
  const subject = subjects.find((item) => item.slug === c.req.param('slug'))
  if (!subject) {
    return c.html(baseLayout({ title: 'ページなし', path: '/404', current: 'ページなし', children: '<section class="content-section empty-state"><h1>該当データはない</h1><p>科目ページが見つかりません。トップページの科目一覧から選び直してください。</p><a class="button button-secondary" href="/">トップページへ戻る</a></section>' }), 404)
  }
  return c.html(subjectPage(subject))
})
app.get('/tags', (c) => c.html(tagsPage()))
app.get('/updates', (c) => c.html(updatesPage()))

export default app
