export type RoutePoint = {
  label: string
  value: string
}

export type RouteOption = {
  name: string
  slug: string
  description: string
  points: RoutePoint[]
}

export const routes: RouteOption[] = [
  {
    name: '高認取得',
    slug: 'kounin',
    description: '高等学校卒業程度認定試験に合格することで、高卒と同等の資格を得る方法',
    points: [
      { label: '試験回数', value: '年2回（8月・11月）' },
      { label: '受験資格', value: '満16歳以上・高校未卒業' },
      { label: '在籍', value: '高校を退学・休学しなくても受験可能' },
      { label: '科目数', value: '最大8〜9科目（免除あり）' },
      { label: '費用', value: '検定料のみ（収入印紙で納付）' },
      { label: '卒業資格', value: '高卒資格ではなく高卒同等資格' },
      { label: '大学受験', value: '合格後に大学・専門学校受験が可能' },
    ]
  },
  {
    name: '通信制高校転籍',
    slug: 'tsushinsei',
    description: '現在の高校から通信制高校に転籍・編入する方法',
    points: [
      { label: '転籍時期', value: '学校によって異なる（要確認）' },
      { label: '在籍', value: '高校在籍のまま転籍手続きが必要' },
      { label: '単位引継ぎ', value: '取得済み単位が引き継げる場合がある（学校による）' },
      { label: '費用', value: '学費が必要（学校によって異なる）' },
      { label: '卒業資格', value: '高卒資格が得られる' },
      { label: '登校頻度', value: 'スクーリング要件が学校によって異なる' },
      { label: '大学受験', value: '卒業後に大学・専門学校受験が可能' },
    ]
  },
  {
    name: '在籍継続',
    slug: 'zaiseki',
    description: '現在の高校に在籍したまま、状況に応じて対応する方法',
    points: [
      { label: '在籍', value: '現在の高校に在籍を維持する' },
      { label: '出席要件', value: '卒業には出席日数の要件がある（学校によって異なる）' },
      { label: '留年', value: '出席日数・単位取得状況によって留年の可能性がある' },
      { label: '費用', value: '現在の学費が継続' },
      { label: '卒業資格', value: '卒業できれば高卒資格が得られる' },
      { label: '支援', value: '学校のスクールカウンセラー・担任への相談が可能' },
    ]
  }
]

export type GradeOption = '1年' | '2年' | '3年' | '不明'
export type AbsenceOption = '1ヶ月未満' | '1〜3ヶ月' | '3〜6ヶ月' | '6ヶ月以上' | '不明'
export type GraduationOption = '今の高校を卒業したい' | 'どちらでもよい' | '卒業にこだわらない' | '不明'
export type TimingOption = '今年中' | '来年中' | '時期は決めていない'

export interface RouteCompareInput {
  current_grade?: GradeOption
  absence_duration?: AbsenceOption
  graduation_intention?: GraduationOption
  target_timing?: TimingOption
}

export const gradeOptions: GradeOption[] = ['1年', '2年', '3年', '不明']
export const absenceOptions: AbsenceOption[] = ['1ヶ月未満', '1〜3ヶ月', '3〜6ヶ月', '6ヶ月以上', '不明']
export const graduationOptions: GraduationOption[] = ['今の高校を卒業したい', 'どちらでもよい', '卒業にこだわらない', '不明']
export const timingOptions: TimingOption[] = ['今年中', '来年中', '時期は決めていない']

export type RouteNote = {
  condition: (input: RouteCompareInput) => boolean
  text: string
  route?: string
}

export const conditionalNotes: RouteNote[] = [
  {
    condition: (input) => input.current_grade === '3年',
    text: '3年生の場合、取得済み単位が多い可能性があり、高認の免除科目が増える場合があります。在籍校に単位取得状況を確認してください。',
  },
  {
    condition: (input) => input.absence_duration === '6ヶ月以上',
    text: '長期の欠席がある場合、在籍校での卒業要件（出席日数）について確認が必要です。',
  },
  {
    condition: (input) => input.graduation_intention === '今の高校を卒業したい',
    text: '在籍校での卒業を希望する場合、担任やスクールカウンセラーに出席要件について相談できます。',
    route: 'zaiseki',
  },
  {
    condition: (input) => input.target_timing === '今年中',
    text: '高認は年2回（8月・11月）実施されます。出願期間を確認してください。',
    route: 'kounin',
  },
]
