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

export const subjects: Subject[] = [
  { slug: 'japanese', name: '国語', label: 'JAPANESE', status: 'placeholder', accent: 'blue', description: '現代文・古文・漢文を含む公開済みデータの集計画面。' },
  { slug: 'math', name: '数学', label: 'MATH', status: 'placeholder', accent: 'orange', description: '大問形式、関数、図形、確率などの出現傾向を扱う予定です。' },
  { slug: 'english', name: '英語', label: 'ENGLISH', status: 'active', accent: 'yellow', description: '文科省公開の英語過去問PDFをブラウザ上で解析し、よく出る単元、出題形式、年度推移を表示します。' },
  { slug: 'history', name: '歴史', label: 'HISTORY', status: 'placeholder', accent: 'blue', description: '新課程を基準に、旧課程科目を制度区分として内包します。', legacy: '旧課程：日本史A・B・世界史A・B' },
  { slug: 'geography', name: '地理', label: 'GEOGRAPHY', status: 'placeholder', accent: 'orange', description: '新課程を基準に、地図・統計・地域別テーマの出現傾向を扱います。', legacy: '旧課程：地理A・B' },
  { slug: 'civics', name: '公民', label: 'CIVICS', status: 'placeholder', accent: 'yellow', description: '政治、経済、倫理、現代社会領域を制度区分付きで整理します。', legacy: '旧課程：現代社会・倫理・政治経済' },
  { slug: 'science-life', name: '科学と人間生活', label: 'SCIENCE & LIFE', status: 'placeholder', accent: 'blue', description: '分野横断の出題テーマと形式の集計画面。' },
  { slug: 'physics', name: '物理基礎', label: 'PHYSICS', status: 'placeholder', accent: 'orange', description: '力学・波・電気などの単元傾向を扱う予定です。' },
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
