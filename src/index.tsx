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
  { slug: 'civics', name: '公共', divisions: ['新課程：公共', '参考：旧課程・現代社会', '参考：旧課程・倫理', '参考：旧課程・政治経済'], accent: 'yellow' },
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
  civics: ['公共的な空間', '法と人権', '政治参加', '経済・労働', '持続可能な社会'],
  'science-life': ['生命の科学', '物質の科学', '光や熱の科学', '宇宙や地球の科学', '科学技術と人間生活'],
  physics: ['力と運動', '波', '電気', '熱', 'エネルギー'],
  chemistry: ['物質の構成', '化学結合', '物質量', '酸と塩基', '酸化還元'],
  biology: ['細胞', '遺伝子', '体内環境', '生態系', '進化'],
  'earth-science': ['地球の構造', '大気と海洋', '天体', '地層', '自然災害'],
  informatics: ['情報社会', 'データ活用', 'ネットワーク', 'プログラミング', '情報デザイン']
}

const forms = ['選択式', '資料読解', '計算', '記述補助', '図表読み取り']

type TagDef = [string, string, string, string, string]

const tagsBySubject: Record<string, TagDef[]> = {
  kokugo: [
    ['UNIT-HYORON', '評論読解', '論理的文章を読み取り内容を把握する問題', '論説文・評論文の内容一致や趣旨把握が問われる場合に付与', '筆者の主張選択、段落構成の把握'],
    ['UNIT-KOBUN', '古文', '古典作品の読解・文法・語句に関する問題', '古文の本文が提示され内容理解や文法知識を問う場合に付与', '古文単語の意味、係り結び、主語判定'],
    ['UNIT-KANBUN', '漢文', '漢文の読解・句法・書き下しに関する問題', '漢文（白文・訓読文）が提示され読解や句法を問う場合に付与', '返り点、再読文字、書き下し文'],
    ['UNIT-BUNGAKU', '文学的文章', '小説・随筆など文学的文章の読解問題', '文学作品を読み心情・表現技法を問う場合に付与', '心情把握、表現技法、場面展開'],
    ['UNIT-GOKU', '語句知識', '漢字・語彙・慣用句など語句の知識問題', '語句そのものの知識を直接問う場合に付与', '漢字の読み書き、四字熟語、慣用句'],
  ],
  math: [
    ['UNIT-QUAD', '二次関数', '二次関数のグラフ・最大最小・不等式の問題', '二次関数 y=ax²+bx+c の性質を扱う場合に付与', '頂点座標、最大値・最小値、グラフの共有点'],
    ['UNIT-TRIG', '図形と計量', '三角比を用いた図形の計量問題', '正弦・余弦・正弦定理・余弦定理を使う場合に付与', '三角比の値、正弦定理、面積計算'],
    ['UNIT-PROB', '確率', '場合の数・確率の問題', '順列・組合せ・確率を求める場合に付与', '順列、組合せ、条件付き確率'],
    ['UNIT-EXPR', '数と式', '式の展開・因数分解・実数の計算問題', '数と式の基本的な計算・性質を問う場合に付与', '展開、因数分解、絶対値、集合'],
    ['UNIT-DATA', 'データの分析', '統計データの整理と分析の問題', '平均・分散・相関など統計量を扱う場合に付与', '四分位数、箱ひげ図、相関係数'],
  ],
  english: [
    ['UNIT-READ', '長文読解', '長文を読んで内容を把握する問題', '長文の内容一致・要旨把握が問われる場合に付与', '内容一致、段落要旨、指示語'],
    ['UNIT-CONV', '会話表現', '会話文中の適切な表現を選ぶ問題', '日常会話・場面別表現が問われる場合に付与', '応答表現、場面に応じた表現選択'],
    ['UNIT-GRAM', '文法・語法', '英文法や語法の知識を問う問題', '文法規則や語法の正誤が問われる場合に付与', '時制、関係詞、不定詞・動名詞'],
    ['UNIT-CHART', '図表読み取り', '表・グラフを含む英文から情報を読み取る問題', '図表の数値・傾向を英文と照合する場合に付与', '統計表の読み取り、グラフ内容一致'],
    ['UNIT-VOCAB', '語彙', '英単語・熟語の意味や用法を問う問題', '語彙力を直接問う場合に付与', '同義語選択、文脈からの語義推測'],
  ],
  history: [
    ['UNIT-MODERN', '近現代史', '近現代（幕末以降・19世紀以降）の歴史問題', '近現代の政治・経済・社会に関する出来事を問う場合に付与', '明治維新、世界大戦、戦後改革'],
    ['UNIT-EXCHANGE', '世界史の交流', '文明間交流・貿易・文化伝播に関する問題', '異文化間の接触・交易を問う場合に付与', 'シルクロード、大航海時代、東西交流'],
    ['UNIT-POLITICS', '日本史の政治', '日本の政治制度・権力構造に関する問題', '律令制・幕藩体制など日本の政治史を問う場合に付与', '律令制度、幕藩体制、議会政治'],
    ['UNIT-CULTURE', '文化史', '文化・芸術・宗教・学問に関する問題', '文化的事象が出題の中心である場合に付与', '仏教文化、ルネサンス、国風文化'],
    ['UNIT-SOURCE', '資料読解', '歴史資料（史料・絵図・統計）を読み解く問題', '一次資料や図版を読み取り判断する場合に付与', '古文書読解、風刺画解釈、年表分析'],
  ],
  geography: [
    ['UNIT-TOPO', '地形図読解', '地形図の読図・地図記号に関する問題', '地形図・等高線・地図記号を読み取る場合に付与', '等高線判読、縮尺計算、地図記号'],
    ['UNIT-CLIMATE', '気候', '気候区分・気象に関する問題', '気候帯・気温・降水量の特徴を問う場合に付与', 'ケッペンの気候区分、雨温図判読'],
    ['UNIT-INDUSTRY', '産業', '農業・工業・商業・サービス業に関する問題', '産業立地・生産・貿易を問う場合に付与', '農業地域区分、工業地帯、貿易統計'],
    ['UNIT-POP', '人口・都市', '人口動態・都市構造に関する問題', '人口ピラミッド・都市化を扱う場合に付与', '人口ピラミッド、都市圏、過疎過密'],
    ['UNIT-SURVEY', '地域調査', '特定地域のフィールドワーク的問題', '地域の特徴を調査・分析する問題の場合に付与', '地域の土地利用変化、統計地図分析'],
  ],
  civics: [
    ['UNIT-PUBLIC', '公共的な空間', '公共的な空間とキャリア形成に関する問題', '公共PDFの冒頭大問やライフプラン・地域参画を扱う場合に付与', '職業選択、ライフプラン、地域参画'],
    ['UNIT-LAW', '法と人権', '法の意義・人権・司法に関する問題', 'ルール、憲法、人権、裁判、契約を問う場合に付与', '法の支配、基本的人権、消費者契約'],
    ['UNIT-POLITICS', '政治参加', '民主政治・主権者・選挙に関する問題', '選挙制度、地方自治、政治参加を扱う場合に付与', '投票、国会、住民投票、一票の格差'],
    ['UNIT-ECONOMY', '経済・労働', '経済、労働、社会保障に関する問題', '市場、労働環境、少子高齢化、社会保障を扱う場合に付与', '労働環境、AI、社会保障、財政'],
    ['UNIT-SDG', '持続可能な社会', '国際社会と持続可能な社会に関する問題', 'SDGs、国際協力、地球温暖化を扱う場合に付与', 'SDGs、国際連合、温暖化対策'],
  ],
  'science-life': [
    ['UNIT-LIFE', '生命の科学', '生物の体の仕組みや遺伝に関する問題', '生物の構造・機能・遺伝を扱う場合に付与', 'DNA、遺伝子、ヒトの体の仕組み'],
    ['UNIT-MATTER', '物質の科学', '物質の性質・化学変化に関する問題', '物質の分類や化学反応を扱う場合に付与', '金属の性質、プラスチック、化学変化'],
    ['UNIT-ENERGY', '光や熱の科学', '光・熱・力学に関する問題', '光・音・熱・力学的現象を扱う場合に付与', '光の性質、熱の伝わり方、エネルギー変換'],
    ['UNIT-EARTH', '宇宙や地球の科学', '天文・地球科学に関する問題', '天体・地質・気象など地球科学を扱う場合に付与', '太陽系、地震、火山、気象現象'],
    ['UNIT-TECH', '科学技術と人間生活', '科学技術の応用と生活への影響の問題', '科学技術の発展・利用・課題を問う場合に付与', '発電の仕組み、通信技術、環境問題'],
  ],
  physics: [
    ['UNIT-MOTION', '力と運動', '力の合成・分解・運動の法則に関する問題', '力学の基本法則（ニュートンの運動法則等）を扱う場合に付与', '等加速度運動、力のつり合い、作用反作用'],
    ['UNIT-WAVE', '波', '波の性質・音・光に関する問題', '波動現象（反射・屈折・干渉等）を扱う場合に付与', '波の重ね合わせ、音の性質、光の反射'],
    ['UNIT-ELEC', '電気', '電気回路・電磁気に関する問題', '電流・電圧・抵抗・電磁誘導を扱う場合に付与', 'オームの法則、直列並列回路、電力'],
    ['UNIT-HEAT', '熱', '熱の性質・熱力学に関する問題', '温度・熱量・比熱・状態変化を扱う場合に付与', '熱量保存、比熱、状態変化と潜熱'],
    ['UNIT-NRGY', 'エネルギー', 'エネルギーの変換・保存に関する問題', '力学的エネルギー保存則を扱う場合に付与', '運動エネルギー、位置エネルギー、仕事'],
  ],
  chemistry: [
    ['UNIT-STRUCT', '物質の構成', '原子の構造・元素の周期表に関する問題', '原子構造・電子配置・周期表を扱う場合に付与', '原子番号、電子配置、同位体'],
    ['UNIT-BOND', '化学結合', '化学結合の種類と性質に関する問題', 'イオン結合・共有結合・金属結合を扱う場合に付与', '電気陰性度、分子の極性、結晶の分類'],
    ['UNIT-MOL', '物質量', 'モル・化学反応の量的関係に関する問題', '物質量（mol）・化学反応式の量的計算を扱う場合に付与', 'モル質量、気体の体積、化学反応式の係数'],
    ['UNIT-ACID', '酸と塩基', '酸・塩基・中和反応に関する問題', '酸塩基の定義・pH・中和を扱う場合に付与', 'pH計算、中和滴定、塩の性質'],
    ['UNIT-REDOX', '酸化還元', '酸化還元反応に関する問題', '酸化数・酸化剤・還元剤を扱う場合に付与', '酸化数の変化、イオン化傾向、電池'],
  ],
  biology: [
    ['UNIT-CELL', '細胞', '細胞の構造・機能に関する問題', '細胞小器官・細胞膜・細胞分裂を扱う場合に付与', '細胞小器官、原核・真核細胞、顕微鏡観察'],
    ['UNIT-GENE', '遺伝子', 'DNA・遺伝情報の発現に関する問題', 'DNA構造・複製・転写・翻訳を扱う場合に付与', 'DNA構造、遺伝暗号、タンパク質合成'],
    ['UNIT-HOMEO', '体内環境', '恒常性・免疫・自律神経に関する問題', '体内環境の維持（恒常性）を扱う場合に付与', '血液循環、免疫のしくみ、ホルモン'],
    ['UNIT-ECO', '生態系', '生態系・生物多様性に関する問題', '食物連鎖・物質循環・生態系バランスを扱う場合に付与', '食物連鎖、炭素循環、生物多様性'],
    ['UNIT-EVOL', '進化', '生物の進化・系統に関する問題', '進化のしくみ・系統分類を扱う場合に付与', '自然選択、分子系統、共通祖先'],
  ],
  'earth-science': [
    ['UNIT-GEOSTR', '地球の構造', '地球内部構造・プレートテクトニクスの問題', '地殻・マントル・プレート運動を扱う場合に付与', '地球内部の層構造、プレート境界、地震波'],
    ['UNIT-ATMO', '大気と海洋', '気象・大気循環・海流に関する問題', '大気の運動・天気変化・海洋循環を扱う場合に付与', '高気圧・低気圧、前線、海流'],
    ['UNIT-ASTRO', '天体', '天文学・宇宙に関する問題', '恒星・惑星・銀河など天体を扱う場合に付与', '太陽の構造、惑星の特徴、HR図'],
    ['UNIT-STRATA', '地層', '地層・岩石・化石に関する問題', '地層の形成・堆積岩・化石を扱う場合に付与', '地層の対比、堆積構造、示準化石'],
    ['UNIT-DISASTER', '自然災害', '地震・火山・気象災害に関する問題', '自然災害の発生メカニズムや防災を扱う場合に付与', '地震のメカニズム、火山噴火、ハザードマップ'],
  ],
  informatics: [
    ['UNIT-SOCIETY', '情報社会', '情報社会の課題・法律・倫理に関する問題', '情報モラル・知的財産権・個人情報保護を扱う場合に付与', '著作権、個人情報保護法、情報リテラシー'],
    ['UNIT-DATAUSE', 'データ活用', 'データの収集・整理・分析に関する問題', '統計処理・データ分析手法を扱う場合に付与', 'データの可視化、統計量、相関分析'],
    ['UNIT-NET', 'ネットワーク', '通信・ネットワーク技術に関する問題', 'インターネット・プロトコル・セキュリティを扱う場合に付与', 'IPアドレス、暗号化、Webの仕組み'],
    ['UNIT-PROG', 'プログラミング', 'アルゴリズム・プログラムに関する問題', 'プログラムの設計・記述・トレースを扱う場合に付与', '変数と代入、繰り返し、条件分岐'],
    ['UNIT-DESIGN', '情報デザイン', '情報の表現・デザインに関する問題', 'UI/UX・情報の構造化・ユニバーサルデザインを扱う場合に付与', 'ピクトグラム、色のバリアフリー、情報設計'],
  ]
}

const commonTags: TagDef[] = [
  ['FORM-CHOICE', '選択式', '選択肢から解答を選ぶ形式', '選択肢が明示されている場合に付与', '四択、語句選択'],
  ['FORM-SOURCE', '資料読解', '資料を読み取って解答する形式', '資料が解答根拠になる場合に付与', '文章資料、統計資料'],
  ['FORM-CALC', '計算', '数式や数量処理を要する形式', '計算過程が得点判断に関わる場合に付与', '数値計算、単位変換'],
  ['FORM-WRITE', '記述補助', '短答や穴埋めなど記述を伴う形式', '選択式でなく記述が求められる場合に付与', '穴埋め、短答式'],
  ['FORM-CHART', '図表読み取り', '表・グラフ・地図を使う形式', '図表が解答根拠になる場合に付与', '地形図、統計表、グラフ'],
  ['HOLD-REVIEW', '判定保留', '分類を確定できない状態', '年度・資料不足で確定できない場合に付与', '複数単元にまたがる設問']
]

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
    <p><strong>データ範囲</strong> ユーザーが正当に取得し、端末内で選択した文部科学省公式PDF。問題文・設問文の配布や再掲載は行いません。</p>
    <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。端末内で抽出した出題傾向データを集計する補助ツールです。</p>
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
      <p>${subject.status === 'preparing' ? '分析機能は準備中です。' : '公式PDFを端末内で読み込み、よく出る単元と出題形式を確認します。'}</p>
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
        <p class="lead">ユーザーが正当に取得した高等学校卒業程度認定試験の公式PDFを端末内で解析し、出題傾向データを科目別に可視化するツール。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。</p>
        <div class="hero-actions" aria-label="主要操作">
          <a class="button button-primary" href="#subject-tools">科目を選ぶ</a>
          <a class="button button-secondary" href="${officialPastExamUrl}" target="_blank" rel="noopener">文科省公式PDFページへ</a>
        </div>
      </section>

      <section class="content-section split-section" aria-labelledby="about-title">
        <div>
          <p class="eyebrow">OVERVIEW</p>
          <h2 id="about-title" style="font-size: 40px;"><span>高認パスとは</span></h2>
        </div>
        <p>端末内で抽出した出題傾向データを集計し、よく出る単元、出現回数、出現率を確認するためのツールです。</p>
      </section>

      <section class="content-section guide-card" aria-labelledby="past-exam-title">
        <p class="eyebrow">SOURCE</p>
        <h2 id="past-exam-title">公式PDFの確認方法</h2>
        <ol class="number-list">
          <li>文部科学省の過去問題ページを開く。</li>
          <li>受験する科目と年度の公式PDFをユーザー自身で取得する。</li>
          <li>各科目ページでPDFを端末内解析用に選択する。</li>
        </ol>
        <a class="button button-secondary" href="${officialPastExamUrl}" target="_blank" rel="noopener">文科省公式PDFページはこちら</a>
      </section>

      <section class="content-section" aria-labelledby="todo-title">
        <div class="section-heading">
          <p class="eyebrow">APPLICATION TODO</p>
          <h2 id="todo-title">出願Todoリスト</h2>
        </div>
        <div class="todo-list" role="list" aria-describedby="todo-title">
          ${renderTodoStep('1', '試験を知る', ['高卒認定試験の概要確認', '受験資格の確認', '科目と合格要件の確認', '試験日程の確認', '既取得単位による科目免除の確認'])}
          ${renderTodoStep('2', '科目を選ぶ', ['受験科目を決める', '免除申請できる科目を確認する', '公式PDFを文科省サイトから取得する', '頻出分析ツールで出題傾向を確認する'])}
          ${renderTodoStep('3', '出願する', ['願書を入手する', '出願期間を確認する', '必要書類を揃える（住民票・証明写真・検定料など）', '検定料を確認・納付する（収入印紙）', '願書を郵送する（簡易書留）', '受験票の到着を確認する'])}
          ${renderTodoStep('4', '試験当日', ['試験会場と時間を確認する', '持ち物を確認する（受験票・鉛筆・消しゴム・時計など）'])}
          ${renderTodoStep('5', '合格後', ['合格証書の受け取りを確認する', '一部科目合格の場合、次回の受験科目を確認する'])}
        </div>
      </section>

      <section id="subject-tools" class="content-section" aria-labelledby="tools-title">
        <div class="section-heading">
          <p class="eyebrow">TOOLS</p>
          <h2 id="tools-title">ツール一覧</h2>
          <p>科目別カードから詳細ページへ進みます。主要操作は公式PDFの選択、表示条件を変える、タグ定義の確認です。</p>
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
        <p class="lead">ユーザーが文科省公式ページから取得したPDFを選択すると、端末内で傾向データを集計します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。</p>
        ${subject.divisions ? `<p class="division-note">制度区分：${subject.divisions.join(' / ')}</p>` : ''}
      </section>

      <section class="content-section upload-section" aria-labelledby="upload-title">
        <div class="section-heading">
          <p class="eyebrow">SECTION A</p>
          <h2 id="upload-title">公式PDFを選択</h2>
          <p id="upload-help">ユーザーが文科省公式ページから取得したPDFを端末内解析用に選択します。複数ファイルを年度別に選択できます。</p>
        </div>
        <div class="upload-zone" id="upload-zone" role="button" tabindex="0" aria-describedby="upload-help upload-status">
          <input id="pdf-input" type="file" accept="application/pdf,.pdf" multiple aria-label="公式PDFを選択">
          <span class="upload-symbol" aria-hidden="true">PDF</span>
          <strong>ここへドラッグ&ドロップ</strong>
          <span>またはクリックしてPDFを選択</span>
        </div>
        <div id="upload-status" class="status-box" aria-live="polite">未解析。PDFを選択すると、解析したファイル名と試験回をここに表示します。</div>
        <a class="button button-secondary" href="${officialPastExamUrl}" target="_blank" rel="noopener">文科省公式PDFページはこちら</a>
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
        <p>タグ付けは単元、形式、制度区分の組み合わせで整理します。判定保留タグは、PDF抽出結果だけでは分類しきれない場合に使います。</p>
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
  const tabSubjects: { slug: string; label: string }[] = [
    { slug: 'kokugo', label: '国語' },
    { slug: 'math', label: '数学' },
    { slug: 'english', label: '英語' },
    { slug: 'history', label: '歴史' },
    { slug: 'geography', label: '地理' },
    { slug: 'civics', label: '公共' },
    { slug: 'science-life', label: '科学と人間生活' },
    { slug: 'physics', label: '物理基礎' },
    { slug: 'chemistry', label: '化学基礎' },
    { slug: 'biology', label: '生物基礎' },
    { slug: 'earth-science', label: '地学基礎' },
    { slug: 'informatics', label: '情報' }
  ]

  function renderTagTable(rows: TagDef[], caption: string) {
    return `<table class="data-table" role="table">
      <caption>${caption}</caption>
      <thead><tr><th scope="col">コード</th><th scope="col">タグ名</th><th scope="col">定義</th><th scope="col">付与ルール</th><th scope="col">具体例</th></tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`
  }

  const tabPanels = tabSubjects.map((tab, index) => {
    const subjectTags = tagsBySubject[tab.slug] ?? []
    return `<div id="tag-panel-${tab.slug}" class="tag-tab-panel" role="tabpanel" aria-labelledby="tag-tab-${tab.slug}"${index !== 0 ? ' hidden' : ''}>
      <h3>${tab.label}の単元タグ</h3>
      ${renderTagTable(subjectTags, `${tab.label}の単元タグ定義。コード、タグ名、定義、付与ルール、具体例。`)}
    </div>`
  }).join('')

  return baseLayout({
    title: 'タグ定義',
    path: '/tags',
    current: 'タグ定義',
    children: `
      <section class="hero compact" aria-labelledby="tags-title">
        <p class="eyebrow">TAG DICTIONARY</p>
        <h1 id="tags-title">タグ定義</h1>
        <p class="lead">単元タグ、形式タグ、制度区分タグの扱いを一覧化します。科目タブを切り替えると、各科目の固有タグ定義を確認できます。</p>
      </section>
      <section class="content-section" aria-labelledby="subject-tabs-title">
        <h2 id="subject-tabs-title">科目別 単元タグ</h2>
        <div class="tab-list" role="tablist" aria-label="科目タブ">
          ${tabSubjects.map((tab, index) => `<button type="button" role="tab" id="tag-tab-${tab.slug}" aria-selected="${index === 0}" aria-controls="tag-panel-${tab.slug}" tabindex="${index === 0 ? '0' : '-1'}">${tab.label}</button>`).join('')}
        </div>
        ${tabPanels}
      </section>
      <section class="content-section" aria-labelledby="common-tag-title">
        <h2 id="common-tag-title">共通タグ（形式タグ・制度タグ）</h2>
        <p>以下のタグは全科目共通で使用します。</p>
        ${renderTagTable(commonTags, '全科目共通の形式タグ・制度タグ定義。コード、タグ名、定義、付与ルール、具体例。')}
        <div class="note-box">
          <h3>補助情報</h3>
          <p>形式タグ一覧：選択式、資料読解、計算、記述補助、図表読み取り。判定保留タグは分類を確定せず再確認するためのタグです。</p>
          <p>制度区分タグ：新課程・旧課程の区分は科目詳細ページのフィルタで選択できます。歴史・地理・公共には旧課程の参考区分（例：現代社会、倫理、政治経済）が含まれます。</p>
        </div>
      </section>`
  })
}

function updatesPage() {
  const rows = [
    ['2026-05-02', 'タグ定義', '全科目の固有単元タグを追加', 'タグ定義ページ：科目タブ切り替えで各科目の単元タグを表示'],
    ['2026-05-02', 'タグ定義', '共通タグ（形式・制度）セクションを分離', 'タグ定義ページ：共通タグ表を独立セクションとして表示'],
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
