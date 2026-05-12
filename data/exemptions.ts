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
      '高校で国語総合または現代の国語・言語文化の単位を規定数以上取得している場合',
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
      '実用数学技能検定（数検）2級以上を取得している場合',
    ],
    creditThreshold: 3,
    qualificationExemptions: [{ name: '数検', level: '2級' }],
  },
  {
    name: '英語',
    slug: 'english',
    category: 'required',
    categoryLabel: '必修',
    exemptionConditions: [
      '高校で英語の単位を規定数以上取得している場合',
      '実用英語技能検定（英検）準2級以上を取得している場合',
    ],
    creditThreshold: 3,
    qualificationExemptions: [{ name: '英検', level: '準2級' }],
  },
  {
    name: '歴史',
    slug: 'history',
    category: 'required',
    categoryLabel: '必修（歴史総合または世界史A）',
    exemptionConditions: [
      '高校で歴史総合または世界史Aの単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '地理',
    slug: 'geography',
    category: 'required',
    categoryLabel: '必修（地理総合または地理A・地理B）',
    exemptionConditions: [
      '高校で地理総合・地理A・地理Bの単位を規定数以上取得している場合',
    ],
    creditThreshold: 2,
  },
  {
    name: '公民',
    slug: 'civics',
    category: 'select',
    categoryLabel: '選択（公共/現代社会/倫理/政治経済）',
    exemptionConditions: [
      '高校で公共・現代社会・倫理・政治経済の単位を規定数以上取得している場合',
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
]

export type QualificationLevel = 'なし' | '3級' | '準2級' | '2級' | '準1級' | '1級'
export const qualificationLevels: QualificationLevel[] = ['なし', '3級', '準2級', '2級', '準1級', '1級']

export interface ExemptionInput {
  enrolled: boolean
  credits: Record<string, number>
  eiken: QualificationLevel
  suken: QualificationLevel
  kanken: QualificationLevel
  otherQualification: string
}

export const defaultExemptionInput: ExemptionInput = {
  enrolled: false,
  credits: {},
  eiken: 'なし',
  suken: 'なし',
  kanken: 'なし',
  otherQualification: '',
}

export type ExemptionStatus = 'possible' | 'needed' | 'unknown'

export function evaluateExemption(
  subject: ExemptionSubject,
  input: ExemptionInput
): ExemptionStatus {
  // 英検による英語免除
  if (subject.slug === 'english' && input.eiken !== 'なし') {
    const levelOrder: QualificationLevel[] = ['なし', '3級', '準2級', '2級', '準1級', '1級']
    const idx = levelOrder.indexOf(input.eiken)
    if (idx >= 2) return 'possible' // 準2級以上
  }

  // 数検による数学免除
  if (subject.slug === 'math' && input.suken !== 'なし') {
    const levelOrder: QualificationLevel[] = ['なし', '3級', '準2級', '2級', '準1級', '1級']
    const idx = levelOrder.indexOf(input.suken)
    if (idx >= 3) return 'possible' // 2級以上
  }

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
