import englishTags from '@/data/englishTags.json'

export type RuleSetCode = 'EN_2014' | 'EN_2016' | 'EN_2024'

export type RuleSet = {
  code: RuleSetCode
  label: string
  total_questions: number
  formats: string[]
  distribution?: Record<string, number>
}

export type QuestionBlock = {
  id: string
  heading: string
  text: string
  format: string
  questionCount: number
  choices: string[]
}

export type GrammarTag = {
  name: string
  count: number
  examples: string[]
}

export type VocabularyLevel = {
  level: 'A1' | 'A2' | 'B1' | 'B2'
  count: number
}

export type AnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: RuleSet
  rawText: string
  questionBlocks: QuestionBlock[]
  grammarTags: GrammarTag[]
  vocabularyLevels: VocabularyLevel[]
  formatCounts: Record<string, number>
  analyzedAt: string
}

export const ruleSets: RuleSet[] = englishTags.rule_sets.map((rule) => ({
  ...rule,
  code: rule.code as RuleSetCode,
  distribution: rule.distribution
    ? Object.fromEntries(Object.entries(rule.distribution).filter(([, value]) => typeof value === 'number'))
    : undefined
}))

export function detectExamYear(text: string, fileName = ''): number | null {
  const target = `${fileName}\n${text}`
  const western = target.match(/20(1[4-9]|2[0-5])\s*(?:年度|年)?/)
  if (western) return Number(western[0].match(/20\d{2}/)?.[0])

  const reiwa = target.match(/令和\s*([元1-9]|[0-9]{1,2})\s*年度?/)
  if (reiwa) {
    const raw = reiwa[1]
    const yearNumber = raw === '元' ? 1 : Number(raw)
    return 2018 + yearNumber
  }

  const heisei = target.match(/平成\s*([0-9]{1,2})\s*年度?/)
  if (heisei) return 1988 + Number(heisei[1])

  return null
}

export function detectExamSession(text: string, fileName = ''): string {
  const target = `${fileName}\n${text}`
  const year = detectExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目|No\.\s*([12]))/i)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2] ?? sessionMatch?.[3]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function getRuleSetForYear(year: number | null): RuleSet {
  if (year && year >= 2024) return ruleSets.find((rule) => rule.code === 'EN_2024')!
  if (year && year >= 2016) return ruleSets.find((rule) => rule.code === 'EN_2016')!
  if (year && year >= 2014) return ruleSets.find((rule) => rule.code === 'EN_2014')!
  return ruleSets.find((rule) => rule.code === 'EN_2024')!
}

export function detectQuestionBlocks(text: string, ruleSet: RuleSet): QuestionBlock[] {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const headingPattern = /(第\s*[0-9一二三四五六七八九十]+\s*問|Part\s*[0-9]+|問\s*[0-9]+)/gi
  const matches = Array.from(normalized.matchAll(headingPattern))

  if (!matches.length) {
    return ruleSet.formats.map((format, index) => ({
      id: `block-${index + 1}`,
      heading: `推定ブロック ${index + 1}`,
      text: normalized.slice(index * 700, (index + 1) * 700),
      format,
      questionCount: ruleSet.distribution?.[format] ?? Math.max(1, Math.round(ruleSet.total_questions / ruleSet.formats.length)),
      choices: detectChoices(normalized)
    }))
  }

  return matches.map((match, index) => {
    const start = match.index ?? 0
    const end = matches[index + 1]?.index ?? normalized.length
    const blockText = normalized.slice(start, end)
    const format = ruleSet.formats[index] ?? inferFormat(blockText, ruleSet)
    return {
      id: `block-${index + 1}`,
      heading: match[0],
      text: blockText,
      format,
      questionCount: detectSmallQuestions(blockText) || ruleSet.distribution?.[format] || 1,
      choices: detectChoices(blockText)
    }
  })
}

export function inferFormat(text: string, ruleSet: RuleSet): string {
  const patterns: Array<[string, RegExp]> = [
    ['強勢', /accent|stress|強勢/i],
    ['会話', /conversation|dialogue|会話|A:|B:/i],
    ['語句整序', /並べ替|語句整序|rearrange|order/i],
    ['メッセージ', /message|e-mail|email|letter|メッセージ/i],
    ['語彙', /vocabulary|語彙|意味/i],
    ['資料・お知らせ', /notice|announcement|graph|table|お知らせ|資料/i],
    ['資料読解', /graph|table|資料|表|グラフ/i],
    ['長文読解', /passage|read the following|長文/i],
    ['文順', /文順|order of sentences|paragraph/i]
  ]
  const hit = patterns.find(([format, regex]) => ruleSet.formats.includes(format) && regex.test(text))
  return hit?.[0] ?? ruleSet.formats[0]
}

function detectSmallQuestions(text: string): number {
  const matches = text.match(/(?:問\s*[0-9]+|\([0-9]+\)|【[0-9]+】)/g)
  return matches ? Math.min(matches.length, 12) : 0
}

function detectChoices(text: string): string[] {
  const matches = text.match(/(?:[アイウエ]\s*[\.．、)]|[A-D]\s*[\.．)]|[①②③④])/g)
  return Array.from(new Set(matches ?? [])).slice(0, 20)
}

export function countFormats(blocks: QuestionBlock[], ruleSet: RuleSet): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(ruleSet.formats.map((format) => [format, 0]))
  blocks.forEach((block) => {
    counts[block.format] = (counts[block.format] ?? 0) + Math.max(1, block.questionCount)
  })
  if (!blocks.length && ruleSet.distribution) return { ...ruleSet.distribution }
  return counts
}
