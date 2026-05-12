export type SubjectStatus = 'active' | 'placeholder' | 'coming-soon'

export type Subject = {
  slug: string
  name: string
  label: string
  status: SubjectStatus
  accent: 'blue' | 'orange' | 'yellow'
  description: string
  legacy?: string
}

export const officialPastExamUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/1421021.htm'
export const officialExamGuideUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/index.htm'
export const officialExemptionRequirementsUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/06033010/007.htm'
export const officialHighSchoolCreditExemptionUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/06033010/20260227-mxt_syogai02-1koutou01.pdf'
export const officialCreditCertificateUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/05033001.htm'
export const officialApplicationFlowUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/mext_01821.html'
export const officialSkillExemptionUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/06033010/20260227-mxt_syogai02-3ginou01.pdf'

export const subjects: Subject[] = [
  { slug: 'japanese', name: '国語', label: 'JAPANESE', status: 'placeholder', accent: 'blue', description: '現代文・古文・漢文を含む公式PDF由来の傾向データ集計画面。' },
  { slug: 'math', name: '数学', label: 'MATH', status: 'active', accent: 'orange', description: 'ユーザーが取得した数学の公式PDFを端末内で解析し、大問ごとの出題単元、頻出トピック、年度推移を表示します。' },
  { slug: 'english', name: '英語', label: 'ENGLISH', status: 'active', accent: 'yellow', description: 'ユーザーが取得した英語の公式PDFを端末内で解析し、よく出る単元、出題形式、年度推移を表示します。' },
  { slug: 'history', name: '歴史', label: 'HISTORY', status: 'active', accent: 'blue', description: 'ユーザーが取得した歴史・世界史Aの公式PDFを端末内で解析し、テーマ別・時代別・地域別・出題形式別の頻出傾向を表示します。', legacy: '旧課程：世界史A' },
  { slug: 'geography', name: '地理', label: 'GEOGRAPHY', status: 'active', accent: 'orange', description: 'ユーザーが取得した地理・地理A・地理Bの公式PDFを端末内で解析し、テーマ別・地域別・出題形式別の頻出傾向を表示します。', legacy: '旧課程：地理A・地理B' },
  { slug: 'civics', name: '公民', label: 'CIVICS', status: 'placeholder', accent: 'yellow', description: '政治、経済、倫理、現代社会領域を制度区分付きで整理します。', legacy: '旧課程：現代社会・倫理・政治経済' },
  { slug: 'science-life', name: '科学と人間生活', label: 'SCIENCE & LIFE', status: 'active', accent: 'blue', description: 'ユーザーが取得した科学と人間生活の公式PDFを端末内で解析し、物理系・化学系・生物系・地学系の分野別頻出傾向を表示します。' },
  { slug: 'physics', name: '物理基礎', label: 'PHYSICS', status: 'active', accent: 'orange', description: 'ユーザーが取得した物理基礎の公式PDFを端末内で解析し、頻出分野、年度別推移、大問構成、出題形式を表示します。' },
  { slug: 'chemistry', name: '化学基礎', label: 'CHEMISTRY', status: 'placeholder', accent: 'yellow', description: '物質量、酸化還元、酸・塩基などの出現傾向を扱う予定です。' },
  { slug: 'biology', name: '生物基礎', label: 'BIOLOGY', status: 'placeholder', accent: 'blue', description: '細胞、遺伝、生態系などの出現傾向を扱う予定です。' },
  { slug: 'earth-science', name: '地学基礎', label: 'EARTH SCIENCE', status: 'placeholder', accent: 'orange', description: '地質、気象、天文などの出現傾向を扱う予定です。' },
  { slug: 'informatics', name: '情報', label: 'INFORMATICS', status: 'coming-soon', accent: 'yellow', description: '令和8年度第1回より追加予定。現在過去問未公開のため分析機能は準備中です。' }
]

export function getSubject(slug: string) {
  return subjects.find((subject) => subject.slug === slug)
}

export const nextExam = {
  label: '2026年8月',
  date: '2026-08-06',
  applicationDeadline: '2026-05-07'
}

export function daysUntil(dateString: string, now = new Date()) {
  const target = new Date(`${dateString}T00:00:00+09:00`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}
