export type ToolPage = {
  slug: string
  href: string
  label: string
  title: string
  summary: string
  description: string
  cta: string
  accent: 'blue' | 'orange' | 'yellow'
  highlights: string[]
  bestFor: string[]
}

export const toolPages: ToolPage[] = [
  {
    slug: 'application-todo',
    href: '/application-todo/',
    label: 'APPLICATION MAP',
    title: '出願Todoリスト',
    summary: '高認の出願準備を、時期・書類・免除申請・郵送まで順番に確認するチェックリストです。',
    description:
      '出願前に漏れやすい確認事項を、試験概要、受験科目、必要書類、免除申請、郵送、受験票確認までの流れに分けて整理します。チェック状態は端末内に保存されるため、あとで戻っても続きから確認できます。',
    cta: 'Todoを開く',
    accent: 'blue',
    highlights: [
      '試験概要、受験資格、日程、出願期間を順に確認',
      '単位修得証明書や技能審査の証明書類など、免除申請に必要な準備を分離',
      '願書郵送後の受験票確認まで、出願の終点を見失わない構成',
    ],
    bestFor: [
      '出願準備で何から手をつけるか整理したい',
      '免除申請書類を出願書類と一緒に管理したい',
      '公式ページを見ながらチェックを残したい',
    ],
  },
  {
    slug: 'route-compare',
    href: '/route-compare/',
    label: 'ROUTE COMPARE',
    title: 'ルート比較',
    summary: '高認取得、通信制高校転籍、在籍継続の三つの進み方を同じ観点で比較します。',
    description:
      '現在の学年、欠席期間、卒業への意向、希望時期を入力すると、それぞれの進路の特徴と注意点を並べて確認できます。決定を急がせるものではなく、相談前に論点を整理するための比較表です。',
    cta: '比較する',
    accent: 'orange',
    highlights: [
      '高認、通信制高校、在籍継続を同じ表で比較',
      '入力内容に応じて、単位確認や出席要件などの注意点を表示',
      '費用、在籍、卒業資格、大学受験へのつながりを整理',
    ],
    bestFor: [
      '今の学校に残るか、高認へ進むかを考えている',
      '通信制高校との違いを短時間で見たい',
      '家族や学校に相談する前に条件を言語化したい',
    ],
  },
  {
    slug: 'exemption-check',
    href: '/exemption-check/',
    label: 'EXEMPTION CHECK',
    title: '免除・必要科目確認',
    summary: '取得済み単位や技能審査から、免除できる可能性がある科目を整理します。',
    description:
      '文部科学省の免除要件を確認しながら、高校・高専の単位修得証明書、英検・数検・歴検・ITパスポートなどの技能審査、受験が必要な可能性のある科目を見分けます。確定判定ではなく、出願前に公式書類と照合するための下書きとして使います。',
    cta: '免除を確認する',
    accent: 'yellow',
    highlights: [
      '高校・高専の入学時期別の単位免除要件を確認する前提で整理',
      '技能審査による免除対象を入力欄に反映',
      '免除申請チェックリストで、証明書類の準備漏れを防ぐ',
    ],
    bestFor: [
      '高校・高専で取った単位が高認に使えるか見たい',
      '英検や数検などで免除できる科目を確認したい',
      '受験科目と免除科目を願書作成前に整理したい',
    ],
  },
  {
    slug: 'analysis',
    href: '/analysis/',
    label: 'PAST EXAM ANALYSIS',
    title: '公式PDF傾向分析',
    summary: '文部科学省公式PDFを端末内で解析し、科目ごとの頻出単元や年度推移を可視化します。',
    description:
      'ユーザー自身が取得した公式PDFをブラウザ内で読み取り、問題文や設問文を保存・再掲載せずに、出題傾向データだけを集計します。英語、数学、歴史、地理、科学と人間生活、物理基礎など、実装済み科目の分析ページへ移動できます。',
    cta: '分析科目を選ぶ',
    accent: 'blue',
    highlights: [
      'PDFはサーバーへ送信せず、端末内で解析',
      '頻出単元、出題形式、年度別推移、科目固有の観点を表示',
      '問題文そのものではなく、学習計画に使う傾向データだけを扱う',
    ],
    bestFor: [
      '過去問PDFから重点単元を見つけたい',
      '直近回で出やすい形式や分野を確認したい',
      '科目ごとに学習順序を決めたい',
    ],
  },
]

export function getToolPage(slug: string) {
  return toolPages.find((tool) => tool.slug === slug)
}
