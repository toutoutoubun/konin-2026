export type ExemptionSubject = {
  name: string
  slug: string
  category: 'required' | 'select'
  categoryLabel: string
  exemptionConditions: string[]
  creditThreshold?: number
  qualificationExemptions?: { name: string; level: string }[]
}

export type AdmissionPeriod = '' | 'A' | 'B' | 'C' | 'D' | 'E' | 'KOSEN_A' | 'KOSEN_B' | 'KOSEN_C'

export type AdmissionPeriodOption = {
  value: AdmissionPeriod
  label: string
  description: string
}

export const admissionPeriodOptions: AdmissionPeriodOption[] = [
  { value: '', label: '選択してください', description: '単位で免除申請しない、または入学時期が未確認の場合' },
  { value: 'A', label: '高校A：令和4年4月以降に入学', description: '高等学校の現行課程の科目名で確認します。' },
  { value: 'B', label: '高校B：平成24年4月〜令和4年3月に入学', description: '高等学校の旧課程・移行期の科目名を含めて確認します。' },
  { value: 'C', label: '高校C：平成15年4月〜平成24年3月に入学', description: '高等学校の平成15年告示課程の科目名を中心に確認します。' },
  { value: 'D', label: '高校D：平成6年4月〜平成15年3月に入学', description: '高等学校の平成6年以降の旧旧課程の科目名を中心に確認します。' },
  { value: 'E', label: '高校E：昭和57年4月〜平成6年3月に入学', description: '高等学校の古い課程の科目名で確認します。証明書の発行可否にも注意します。' },
  { value: 'KOSEN_A', label: '高専：令和4年4月以降に入学', description: '高等専門学校で修得した各分野の科目単位で確認します。' },
  { value: 'KOSEN_B', label: '高専：平成25年4月〜令和4年3月に入学', description: '高等専門学校の平成25年以降の情報科目区分を含めて確認します。' },
  { value: 'KOSEN_C', label: '高専：平成15年4月〜平成25年3月に入学', description: '高等専門学校の平成15年以降の旧課程区分で確認します。' },
]

export type CreditCourse = {
  key: string
  name: string
  requiredCredits?: number
}

export type CreditRequirementGroup = {
  subjectSlug: string
  mode: 'all' | 'any' | 'sum'
  label: string
  courses: CreditCourse[]
  totalCredits?: number
  note?: string
}

const c = (key: string, name: string, requiredCredits?: number): CreditCourse => ({ key, name, requiredCredits })

export const creditRequirementsByPeriod: Record<Exclude<AdmissionPeriod, ''>, CreditRequirementGroup[]> = {
  A: [
    { subjectSlug: 'japanese', mode: 'all', label: '現行課程', courses: [c('A:japanese:modern', '現代の国語', 2), c('A:japanese:language-culture', '言語文化', 2)], note: '両方必要' },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('A:geography:geography-general', '地理総合', 2)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('A:history:history-general', '歴史総合', 2)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('A:civics:public', '公共', 2)] },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('A:math:math-i', '数学Ⅰ', 3), c('A:math:science-math-i', '理数数学Ⅰ', 3)] },
    { subjectSlug: 'science-life', mode: 'any', label: '科学と人間生活', courses: [c('A:science-life:science-life', '科学と人間生活', 2)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('A:physics:physics-basic', '物理基礎', 2), c('A:physics:science-physics', '理数物理', 2)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('A:chemistry:chemistry-basic', '化学基礎', 2), c('A:chemistry:science-chemistry', '理数化学', 2)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('A:biology:biology-basic', '生物基礎', 2), c('A:biology:science-biology', '理数生物', 2)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('A:earth-science:earth-basic', '地学基礎', 2), c('A:earth-science:science-earth', '理数地学', 2)] },
    { subjectSlug: 'english', mode: 'any', label: '英語', courses: [c('A:english:english-communication-i', '英語コミュニケーションⅠ', 3)] },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('A:informatics:information-i', '情報Ⅰ', 2)] },
  ],
  B: [
    { subjectSlug: 'japanese', mode: 'any', label: '国語', courses: [c('B:japanese:integrated-japanese', '国語総合', 4), c('B:japanese:expression-i', '国語表現Ⅰ', 2)], note: '入学時期により対象科目が変わるため公式表で確認' },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('B:geography:a', '地理A', 2), c('B:geography:b', '地理B', 4)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('B:history:world-a', '世界史A', 2), c('B:history:world-b', '世界史B', 4), c('B:history:japan-a', '日本史A', 2), c('B:history:japan-b', '日本史B', 4)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('B:civics:contemporary', '現代社会', 2), c('B:civics:ethics', '倫理', 2), c('B:civics:politics-economics', '政治・経済', 2)] },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('B:math:math-i', '数学Ⅰ', 3), c('B:math:industrial-math-basic', '工業数理基礎', 2), c('B:math:science-math-i', '理数数学Ⅰ', 3)] },
    { subjectSlug: 'science-life', mode: 'any', label: '科学と人間生活', courses: [c('B:science-life:science-life', '科学と人間生活', 2), c('B:science-life:science-basic', '理科基礎', 2), c('B:science-life:integrated-a', '理科総合A', 2), c('B:science-life:integrated-b', '理科総合B', 2)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('B:physics:physics-basic', '物理基礎', 2), c('B:physics:physics-i', '物理Ⅰ', 3), c('B:physics:science-physics', '理数物理', 2)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('B:chemistry:chemistry-basic', '化学基礎', 2), c('B:chemistry:chemistry-i', '化学Ⅰ', 3), c('B:chemistry:science-chemistry', '理数化学', 2)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('B:biology:biology-basic', '生物基礎', 2), c('B:biology:biology-i', '生物Ⅰ', 3), c('B:biology:science-biology', '理数生物', 2)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('B:earth-science:earth-basic', '地学基礎', 2), c('B:earth-science:earth-i', '地学Ⅰ', 3), c('B:earth-science:science-earth', '理数地学', 2)] },
    { subjectSlug: 'english', mode: 'any', label: '英語', courses: [c('B:english:communication-i', 'コミュニケーション英語Ⅰ', 3), c('B:english:oral-communication-i', 'オーラル・コミュニケーションⅠ', 2), c('B:english:english-i', '英語Ⅰ', 3)] },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('B:informatics:society-information', '社会と情報', 2), c('B:informatics:information-science', '情報の科学', 2), c('B:informatics:a', '情報A', 2), c('B:informatics:b', '情報B', 2), c('B:informatics:c', '情報C', 2)] },
  ],
  C: [
    { subjectSlug: 'japanese', mode: 'any', label: '国語', courses: [c('C:japanese:expression-i', '国語表現Ⅰ', 2), c('C:japanese:integrated-japanese', '国語総合', 4)] },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('C:geography:a', '地理A', 2), c('C:geography:b', '地理B', 4)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('C:history:world-a', '世界史A', 2), c('C:history:world-b', '世界史B', 4), c('C:history:japan-a', '日本史A', 2), c('C:history:japan-b', '日本史B', 4)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('C:civics:contemporary', '現代社会', 2), c('C:civics:ethics', '倫理', 2), c('C:civics:politics-economics', '政治・経済', 2)] },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('C:math:math-i', '数学Ⅰ', 3), c('C:math:industrial-math-basic', '工業数理基礎', 2), c('C:math:science-math-i', '理数数学Ⅰ', 3)] },
    { subjectSlug: 'science-life', mode: 'any', label: '科学と人間生活', courses: [c('C:science-life:science-life', '科学と人間生活', 2), c('C:science-life:science-basic', '理科基礎', 2), c('C:science-life:integrated-a', '理科総合A', 2), c('C:science-life:integrated-b', '理科総合B', 2)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('C:physics:physics-i', '物理Ⅰ', 3), c('C:physics:science-physics', '理数物理', 3)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('C:chemistry:chemistry-i', '化学Ⅰ', 3), c('C:chemistry:science-chemistry', '理数化学', 3)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('C:biology:biology-i', '生物Ⅰ', 3), c('C:biology:science-biology', '理数生物', 3)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('C:earth-science:earth-i', '地学Ⅰ', 3), c('C:earth-science:science-earth', '理数地学', 3)] },
    { subjectSlug: 'english', mode: 'sum', label: '英語', totalCredits: 8, courses: [c('C:english:english-i', '英語Ⅰ'), c('C:english:english-ii', '英語Ⅱ'), c('C:english:oral-a', 'オーラル・コミュニケーションA'), c('C:english:oral-b', 'オーラル・コミュニケーションB'), c('C:english:oral-c', 'オーラル・コミュニケーションC'), c('C:english:reading', 'リーディング'), c('C:english:writing', 'ライティング')], note: '左記の科目を組み合わせて8単位以上' },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('C:informatics:a', '情報A', 2), c('C:informatics:b', '情報B', 2), c('C:informatics:c', '情報C', 2), c('C:informatics:home-processing', '家庭情報処理', 2), c('C:informatics:agri-processing', '農業情報処理', 2), c('C:informatics:tech-basic', '情報技術基礎', 2), c('C:informatics:processing', '情報処理', 2), c('C:informatics:fishery-processing', '水産情報処理', 2), c('C:informatics:nursing-processing', '看護情報処理', 2)] },
  ],
  D: [
    { subjectSlug: 'japanese', mode: 'any', label: '国語', courses: [c('D:japanese:kokugo-i', '国語Ⅰ', 4), c('D:japanese:kokugo-ii', '国語Ⅱ', 4), c('D:japanese:integrated-japanese', '国語総合', 4)] },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('D:geography:a', '地理A', 2), c('D:geography:b', '地理B', 4)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('D:history:world-a', '世界史A', 2), c('D:history:world-b', '世界史B', 4), c('D:history:japan-a', '日本史A', 2), c('D:history:japan-b', '日本史B', 4)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('D:civics:contemporary', '現代社会', 4)] },
    { subjectSlug: 'civics', mode: 'all', label: '公共（倫理・政治経済）', courses: [c('D:civics:ethics', '倫理', 2), c('D:civics:politics-economics', '政治・経済', 2)], note: '両方必要' },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('D:math:math-i', '数学Ⅰ', 4), c('D:math:math-ii', '数学Ⅱ', 3), c('D:math:math-a', '数学A', 2), c('D:math:industrial-math', '工業数理', 2)] },
    { subjectSlug: 'science-life', mode: 'any', label: '科学と人間生活', courses: [c('D:science-life:general-science', '総合理科', 4)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('D:physics:ia', '物理ⅠA', 2), c('D:physics:ib', '物理ⅠB', 4)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('D:chemistry:ia', '化学ⅠA', 2), c('D:chemistry:ib', '化学ⅠB', 4)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('D:biology:ia', '生物ⅠA', 2), c('D:biology:ib', '生物ⅠB', 4)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('D:earth-science:ia', '地学ⅠA', 2), c('D:earth-science:ib', '地学ⅠB', 4)] },
    { subjectSlug: 'english', mode: 'sum', label: '英語', totalCredits: 8, courses: [c('D:english:english-i', '英語Ⅰ'), c('D:english:english-ii', '英語Ⅱ'), c('D:english:oral-a', 'オーラル・コミュニケーションA'), c('D:english:oral-b', 'オーラル・コミュニケーションB'), c('D:english:oral-c', 'オーラル・コミュニケーションC'), c('D:english:reading', 'リーディング'), c('D:english:writing', 'ライティング')], note: '左記の科目を組み合わせて8単位以上' },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('D:informatics:a', '情報A', 2), c('D:informatics:b', '情報B', 2), c('D:informatics:c', '情報C', 2)] },
  ],
  E: [
    { subjectSlug: 'japanese', mode: 'all', label: '国語', courses: [c('E:japanese:kokugo-i', '国語Ⅰ', 4), c('E:japanese:kokugo-ii', '国語Ⅱ', 4)], note: '両方必要' },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('E:geography:geography', '地理', 4)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('E:history:world', '世界史', 4), c('E:history:japan', '日本史', 4)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('E:civics:contemporary', '現代社会', 4)] },
    { subjectSlug: 'civics', mode: 'all', label: '公共（倫理・政治経済）', courses: [c('E:civics:ethics', '倫理', 2), c('E:civics:politics-economics', '政治・経済', 2)], note: '両方必要' },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('E:math:math-i', '数学Ⅰ', 4), c('E:math:math-ii', '数学Ⅱ', 3), c('E:math:algebra-geometry', '代数・幾何', 3), c('E:math:basic-analysis', '基礎解析', 3), c('E:math:calculus', '微分・積分', 3), c('E:math:probability-statistics', '確率・統計', 3), c('E:math:industrial-math', '工業数理', 2)] },
    { subjectSlug: 'science-life', mode: 'any', label: '科学と人間生活', courses: [c('E:science-life:science-i', '理科Ⅰ', 4)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('E:physics:physics', '物理', 4)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('E:chemistry:chemistry', '化学', 4)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('E:biology:biology', '生物', 4)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('E:earth-science:earth', '地学', 4)] },
    { subjectSlug: 'english', mode: 'sum', label: '英語', totalCredits: 9, courses: [c('E:english:english-i', '英語Ⅰ'), c('E:english:english-ii', '英語Ⅱ'), c('E:english:english-iia', '英語ⅡA'), c('E:english:english-iib', '英語ⅡB'), c('E:english:english-iic', '英語ⅡC')], note: '左記の5科目から組み合わせて合計9単位以上' },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('E:informatics:technology-i', '情報技術Ⅰ', 2), c('E:informatics:processing-i', '情報処理Ⅰ', 2)] },
  ],
  KOSEN_A: [
    { subjectSlug: 'japanese', mode: 'any', label: '国語', courses: [c('KOSEN_A:japanese:related', '国語に関する科目', 4)], note: '令和4年4月以降に高専へ入学した方' },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('KOSEN_A:geography:related', '地理に関する科目', 2)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('KOSEN_A:history:related', '歴史に関する科目', 2)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('KOSEN_A:civics:public-related', '公共に関する科目', 2)] },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('KOSEN_A:math:related', '数学に関する科目', 3)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('KOSEN_A:physics:related', '物理に関する科目', 2)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('KOSEN_A:chemistry:related', '化学に関する科目', 2)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('KOSEN_A:biology:related', '生物に関する科目', 2)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('KOSEN_A:earth-science:related', '地学に関する科目', 2)] },
    { subjectSlug: 'english', mode: 'any', label: '英語', courses: [c('KOSEN_A:english:related', '英語に関する科目', 3)] },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('KOSEN_A:informatics:related', '情報に関する科目', 2)] },
  ],
  KOSEN_B: [
    { subjectSlug: 'japanese', mode: 'any', label: '国語', courses: [c('KOSEN_B:japanese:related', '国語に関する科目', 3)], note: '平成25年4月から令和4年3月までに高専へ入学した方' },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('KOSEN_B:geography:related', '地理に関する科目', 2)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('KOSEN_B:history:world-related', '世界史に関する科目', 2), c('KOSEN_B:history:japan-related', '日本史に関する科目', 2)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('KOSEN_B:civics:contemporary-related', '現代社会に関する科目', 2)] },
    { subjectSlug: 'civics', mode: 'all', label: '公共（倫理・政治経済）', courses: [c('KOSEN_B:civics:ethics-related', '倫理に関する科目', 2), c('KOSEN_B:civics:politics-economics-related', '政治・経済に関する科目', 2)], note: '倫理と政治・経済は両方必要' },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('KOSEN_B:math:related', '数学に関する科目', 3)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('KOSEN_B:physics:related', '物理に関する科目', 2)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('KOSEN_B:chemistry:related', '化学に関する科目', 2)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('KOSEN_B:biology:related', '生物に関する科目', 2)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('KOSEN_B:earth-science:related', '地学に関する科目', 2)] },
    { subjectSlug: 'english', mode: 'any', label: '英語', courses: [c('KOSEN_B:english:related', '英語に関する科目', 3)] },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('KOSEN_B:informatics:society-related', '社会と情報に相当する科目', 2), c('KOSEN_B:informatics:science-related', '情報の科学に相当する科目', 2)], note: 'どちらか1科目で免除可能' },
  ],
  KOSEN_C: [
    { subjectSlug: 'japanese', mode: 'any', label: '国語', courses: [c('KOSEN_C:japanese:related', '国語に関する科目', 3)], note: '平成15年4月から平成25年3月までに高専へ入学した方' },
    { subjectSlug: 'geography', mode: 'any', label: '地理', courses: [c('KOSEN_C:geography:related', '地理に関する科目', 2)] },
    { subjectSlug: 'history', mode: 'any', label: '歴史', courses: [c('KOSEN_C:history:world-related', '世界史に関する科目', 2), c('KOSEN_C:history:japan-related', '日本史に関する科目', 2)] },
    { subjectSlug: 'civics', mode: 'any', label: '公共', courses: [c('KOSEN_C:civics:contemporary-related', '現代社会に関する科目', 2)] },
    { subjectSlug: 'civics', mode: 'all', label: '公共（倫理・政治経済）', courses: [c('KOSEN_C:civics:ethics-related', '倫理に関する科目', 2), c('KOSEN_C:civics:politics-economics-related', '政治・経済に関する科目', 2)], note: '倫理と政治・経済は両方必要' },
    { subjectSlug: 'math', mode: 'any', label: '数学', courses: [c('KOSEN_C:math:related', '数学に関する科目', 3)] },
    { subjectSlug: 'physics', mode: 'any', label: '物理基礎', courses: [c('KOSEN_C:physics:related', '物理に関する科目', 2)] },
    { subjectSlug: 'chemistry', mode: 'any', label: '化学基礎', courses: [c('KOSEN_C:chemistry:related', '化学に関する科目', 2)] },
    { subjectSlug: 'biology', mode: 'any', label: '生物基礎', courses: [c('KOSEN_C:biology:related', '生物に関する科目', 2)] },
    { subjectSlug: 'earth-science', mode: 'any', label: '地学基礎', courses: [c('KOSEN_C:earth-science:related', '地学に関する科目', 2)] },
    { subjectSlug: 'english', mode: 'any', label: '英語', courses: [c('KOSEN_C:english:related', '英語に関する科目', 3)] },
    { subjectSlug: 'informatics', mode: 'any', label: '情報', courses: [c('KOSEN_C:informatics:a-related', '情報Aに相当する科目', 2), c('KOSEN_C:informatics:b-related', '情報Bに相当する科目', 2), c('KOSEN_C:informatics:c-related', '情報Cに相当する科目', 2)], note: 'いずれか1科目で免除可能' },
  ],
}

export const exemptionSubjects: ExemptionSubject[] = [
  {
    name: '国語',
    slug: 'japanese',
    category: 'required',
    categoryLabel: '必修',
    exemptionConditions: [
      '高校で現代の国語と言語文化、または旧課程の国語総合等を規定単位数以上修得している場合',
    ],
    creditThreshold: 4,
  },
  {
    name: '数学',
    slug: 'math',
    category: 'required',
    categoryLabel: '必修',
    exemptionConditions: [
      '高校で数学Ⅰの単位を規定数以上取得している場合',
      '実用数学技能検定（数検）2級以上に合格している場合',
    ],
    creditThreshold: 3,
    qualificationExemptions: [{ name: '実用数学技能検定', level: '2級以上' }],
  },
  {
    name: '英語',
    slug: 'english',
    category: 'required',
    categoryLabel: '必修',
    exemptionConditions: [
      '高校で英語コミュニケーションⅠ、英語Ⅰ、旧課程の英語科目の組み合わせ等を規定単位数以上修得している場合',
      '実用英語技能検定（英検）準2級以上（準2級プラスを含む）に合格している場合',
      '全国商業高等学校協会 英語検定試験2級以上に合格している場合',
      '国際連合公用語英語検定試験C級以上に合格している場合',
    ],
    creditThreshold: 3,
    qualificationExemptions: [
      { name: '実用英語技能検定', level: '準2級以上（準2級プラスを含む）' },
      { name: '全国商業高等学校協会 英語検定試験', level: '2級以上' },
      { name: '国際連合公用語英語検定試験', level: 'C級以上' },
    ],
  },
  {
    name: '歴史',
    slug: 'history',
    category: 'required',
    categoryLabel: '必修（歴史総合または世界史A）',
    exemptionConditions: [
      '高校で歴史総合、世界史A・B、日本史A・B等を入学時期別の条件で規定単位数以上修得している場合',
      '歴史能力検定の世界史3級以上と日本史3級以上の両方に合格している場合',
    ],
    creditThreshold: 2,
    qualificationExemptions: [{ name: '歴史能力検定', level: '世界史3級以上＋日本史3級以上' }],
  },
  {
    name: '地理',
    slug: 'geography',
    category: 'required',
    categoryLabel: '必修（地理総合または地理A・地理B）',
    exemptionConditions: [
      '高校で地理総合・地理A・地理B等を入学時期別の条件で規定単位数以上修得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '公民',
    slug: 'civics',
    category: 'select',
    categoryLabel: '選択（公共/現代社会/倫理/政治経済）',
    exemptionConditions: [
      '高校で公共、現代社会、倫理、政治・経済等を入学時期別の条件で規定単位数以上修得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '科学と人間生活',
    slug: 'science-life',
    category: 'select',
    categoryLabel: '選択（理科）',
    exemptionConditions: [
      '高校で科学と人間生活の単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '物理基礎',
    slug: 'physics',
    category: 'select',
    categoryLabel: '選択（理科）',
    exemptionConditions: [
      '高校で物理基礎または物理の単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '化学基礎',
    slug: 'chemistry',
    category: 'select',
    categoryLabel: '選択（理科）',
    exemptionConditions: [
      '高校で化学基礎または化学の単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '生物基礎',
    slug: 'biology',
    category: 'select',
    categoryLabel: '選択（理科）',
    exemptionConditions: [
      '高校で生物基礎または生物の単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '地学基礎',
    slug: 'earth-science',
    category: 'select',
    categoryLabel: '選択（理科）',
    exemptionConditions: [
      '高校で地学基礎または地学の単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '情報',
    slug: 'informatics',
    category: 'required',
    categoryLabel: '必修（令和8年度から）',
    exemptionConditions: [
      '高校で情報Ⅰ、社会と情報、情報の科学、情報A・B・C等を入学時期別の条件で規定単位数以上修得している場合',
      '情報処理技術者試験のうち、ITパスポート試験に合格している場合',
    ],
    creditThreshold: 2,
    qualificationExemptions: [{ name: 'ITパスポート試験', level: '合格' }],
  },
]

export type EikenLevel = 'なし' | '3級' | '準2級' | '準2級プラス' | '2級' | '準1級' | '1級'
export type CommonQualificationLevel = 'なし' | '3級' | '準2級' | '2級' | '準1級' | '1級'
export type HistoryExamLevel = 'なし' | '3級' | '2級' | '1級'
export type ZenshoEnglishLevel = 'なし' | '2級' | '1級'
export type UnitedNationsEnglishLevel = 'なし' | 'C級' | 'B級' | 'A級' | '特A級'

export const eikenLevels: EikenLevel[] = ['なし', '3級', '準2級', '準2級プラス', '2級', '準1級', '1級']
export const sukenLevels: CommonQualificationLevel[] = ['なし', '3級', '準2級', '2級', '準1級', '1級']
export const historyExamLevels: HistoryExamLevel[] = ['なし', '3級', '2級', '1級']
export const zenshoEnglishLevels: ZenshoEnglishLevel[] = ['なし', '2級', '1級']
export const unitedNationsEnglishLevels: UnitedNationsEnglishLevel[] = ['なし', 'C級', 'B級', 'A級', '特A級']

export interface ExemptionInput {
  enrolled: boolean
  admissionPeriod: AdmissionPeriod
  credits: Record<string, number>
  eiken: EikenLevel
  suken: CommonQualificationLevel
  rekikenWorld: HistoryExamLevel
  rekikenJapan: HistoryExamLevel
  zenshoEnglish: ZenshoEnglishLevel
  unEnglish: UnitedNationsEnglishLevel
  itPassport: boolean
  otherQualification: string
}

export const defaultExemptionInput: ExemptionInput = {
  enrolled: false,
  admissionPeriod: '',
  credits: {},
  eiken: 'なし',
  suken: 'なし',
  rekikenWorld: 'なし',
  rekikenJapan: 'なし',
  zenshoEnglish: 'なし',
  unEnglish: 'なし',
  itPassport: false,
  otherQualification: '',
}

export type ExemptionStatus = 'possible' | 'needed' | 'unknown'

export function getCreditRequirementGroups(period: AdmissionPeriod, subjectSlug?: string) {
  if (!period) return []
  const groups = creditRequirementsByPeriod[period] ?? []
  return subjectSlug ? groups.filter((group) => group.subjectSlug === subjectSlug) : groups
}

function creditFor(input: ExemptionInput, key: string): number {
  return input.credits?.[key] ?? 0
}

function groupSatisfied(group: CreditRequirementGroup, input: ExemptionInput): boolean {
  if (group.mode === 'sum') {
    const total = group.courses.reduce((sum, course) => sum + creditFor(input, course.key), 0)
    return total >= (group.totalCredits ?? 0)
  }

  if (group.mode === 'all') {
    return group.courses.every((course) => creditFor(input, course.key) >= (course.requiredCredits ?? 0))
  }

  return group.courses.some((course) => creditFor(input, course.key) >= (course.requiredCredits ?? 0))
}

function groupHasAnyCredit(group: CreditRequirementGroup, input: ExemptionInput): boolean {
  return group.courses.some((course) => creditFor(input, course.key) > 0)
}

export function formatRequirementGroup(group: CreditRequirementGroup): string {
  if (group.mode === 'sum') {
    return `${group.courses.map((course) => course.name).join('・')}を組み合わせて${group.totalCredits}単位以上`
  }

  const body = group.courses
    .map((course) => `${course.name}${course.requiredCredits != null ? `${course.requiredCredits}単位` : ''}`)
    .join(group.mode === 'all' ? '＋' : ' / ')

  return `${body}${group.mode === 'all' ? '（すべて必要）' : '（いずれか）'}`
}

export function evaluateCreditExemption(subject: ExemptionSubject, input: ExemptionInput): ExemptionStatus {
  const period = input.admissionPeriod
  if (!period) return 'unknown'

  const groups = getCreditRequirementGroups(period, subject.slug)
  if (groups.length === 0) return 'unknown'
  if (groups.some((group) => groupSatisfied(group, input))) return 'possible'
  if (groups.some((group) => groupHasAnyCredit(group, input))) return 'needed'
  return 'unknown'
}

export function evaluateExemption(
  subject: ExemptionSubject,
  input: ExemptionInput
): ExemptionStatus {
  const eiken = input.eiken ?? 'なし'
  const suken = input.suken ?? 'なし'
  const rekikenWorld = input.rekikenWorld ?? 'なし'
  const rekikenJapan = input.rekikenJapan ?? 'なし'

  // 英検による英語免除
  if (subject.slug === 'english') {
    const levelOrder: EikenLevel[] = ['なし', '3級', '準2級', '準2級プラス', '2級', '準1級', '1級']
    const idx = levelOrder.indexOf(eiken)
    if (idx >= 2) return 'possible' // 準2級以上
    if (input.zenshoEnglish && input.zenshoEnglish !== 'なし') return 'possible' // 全商英検2級以上
    if (input.unEnglish && input.unEnglish !== 'なし') return 'possible' // 国連英検C級以上
  }

  // 数検による数学免除
  if (subject.slug === 'math' && suken !== 'なし') {
    const levelOrder: CommonQualificationLevel[] = ['なし', '3級', '準2級', '2級', '準1級', '1級']
    const idx = levelOrder.indexOf(suken)
    if (idx >= 3) return 'possible' // 2級以上
  }

  // 歴史能力検定による歴史免除（世界史・日本史の両方が必要）
  if (subject.slug === 'history' && rekikenWorld !== 'なし' && rekikenJapan !== 'なし') {
    return 'possible'
  }

  // ITパスポート試験による情報免除
  if (subject.slug === 'informatics' && input.itPassport) return 'possible'

  const creditStatus = evaluateCreditExemption(subject, input)
  if (creditStatus === 'possible') return 'possible'
  if (creditStatus === 'needed') return 'needed'

  return 'unknown'
}
