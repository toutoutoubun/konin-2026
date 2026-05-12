export type ExemptionSubject = {
  name: string
  slug: string
  category: 'required' | 'select'
  categoryLabel: string
  exemptionConditions: string[]
  creditThreshold?: number
  qualificationExemptions?: { name: string; level: string }[]
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

export function evaluateExemption(
  subject: ExemptionSubject,
  input: ExemptionInput
): ExemptionStatus {
  const rekikenWorld = input.rekikenWorld ?? 'なし'
  const rekikenJapan = input.rekikenJapan ?? 'なし'

  // 英検による英語免除
  if (subject.slug === 'english') {
    const levelOrder: EikenLevel[] = ['なし', '3級', '準2級', '準2級プラス', '2級', '準1級', '1級']
    const idx = levelOrder.indexOf(input.eiken)
    if (idx >= 2) return 'possible' // 準2級以上
    if (input.zenshoEnglish && input.zenshoEnglish !== 'なし') return 'possible' // 全商英検2級以上
    if (input.unEnglish && input.unEnglish !== 'なし') return 'possible' // 国連英検C級以上
  }

  // 数検による数学免除
  if (subject.slug === 'math' && input.suken !== 'なし') {
    const levelOrder: CommonQualificationLevel[] = ['なし', '3級', '準2級', '2級', '準1級', '1級']
    const idx = levelOrder.indexOf(input.suken)
    if (idx >= 3) return 'possible' // 2級以上
  }

  // 歴史能力検定による歴史免除（世界史・日本史の両方が必要）
  if (subject.slug === 'history' && rekikenWorld !== 'なし' && rekikenJapan !== 'なし') {
    return 'possible'
  }

  // ITパスポート試験による情報免除
  if (subject.slug === 'informatics' && input.itPassport) return 'possible'

  // 高校単位による免除
  if (input.enrolled) {
    const credit = input.credits[subject.slug]
    if (credit !== undefined && credit > 0 && subject.creditThreshold !== undefined) {
      if (credit >= subject.creditThreshold) return 'possible'
      return 'unknown' // 単位はあるが規定数未満の可能性
    }
    // 在籍ありだが単位未入力
    if (credit === undefined || credit === 0) return 'unknown'
  }

  // 入力なし
  if (!input.enrolled) return 'unknown'

  return 'needed'
}
