/**
 * 公共過去問のタグマッピング
 * 新課程「公共」を主軸に、旧課程の現代社会・倫理・政治・経済PDFは参考区分として扱う。
 */

import publicTags from '@/data/civicsTags.json'

export type PublicRuleSet = {
  code: string
  label: string
  subjectName: string
}

export type PublicTopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type PublicBlockHit = {
  block: string
  blockIndex: number
  heading: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
  topic_l1: string
  topicHits: PublicTopicHit[]
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'medium' | 'low'
  formatTags: string[]
}

export type PublicAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: PublicRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: PublicBlockHit[]
  detectedBlocks: string[]
  questionCount: number
  formatCounts: Record<string, number>
  analyzedAt: string
}

type RuleSetData = {
  code: string
  label: string
  subject_name: string
  topic_l1: string[]
}

type SplitBlock = {
  label: string
  heading: string
  text: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
}

const ruleSets = publicTags.rule_sets as RuleSetData[]
const keywordMap = publicTags.keyword_map as Record<string, { keywords: string[] }>
const formatKeywords = (publicTags as any).format_keywords as Record<string, string[]>

const publicRuleSet = ruleSets.find((rule) => rule.code === 'PUB_NEW') ?? ruleSets[0]

export const defaultPublicRuleSet: PublicRuleSet = {
  code: publicRuleSet.code,
  label: publicRuleSet.label,
  subjectName: publicRuleSet.subject_name
}

function toHalfWidthDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) => String(char.charCodeAt(0) - 0xff10))
}

function normalizeText(text: string): string {
  return toHalfWidthDigits(text)
    .replace(/[　\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countKeyword(text: string, keyword: string): number {
  const matches = text.match(new RegExp(escapeRegExp(keyword), 'g'))
  return matches?.length ?? 0
}

function toRuleSet(rule: RuleSetData): PublicRuleSet {
  return {
    code: rule.code,
    label: rule.label,
    subjectName: rule.subject_name
  }
}

export function detectPublicRuleSet(text: string, fileName = ''): PublicRuleSet {
  const target = normalizeText(`${fileName}\n${text}`)
  if (/政治[・･]?経済|政\s*治\s*[・･]?\s*経\s*済/.test(target)) {
    return toRuleSet(ruleSets.find((rule) => rule.code === 'PUB_OLD_POLIECON') ?? publicRuleSet)
  }
  if (/現代社会|現\s*代\s*社\s*会/.test(target)) {
    return toRuleSet(ruleSets.find((rule) => rule.code === 'PUB_OLD_MODERN') ?? publicRuleSet)
  }
  if (/倫理|倫\s*理/.test(target)) {
    return toRuleSet(ruleSets.find((rule) => rule.code === 'PUB_OLD_ETHICS') ?? publicRuleSet)
  }
  return defaultPublicRuleSet
}

function topicsForRuleSet(ruleSet: PublicRuleSet): string[] {
  const rule = ruleSets.find((item) => item.code === ruleSet.code) ?? publicRuleSet
  return rule.topic_l1
}

export function detectPublicExamYear(text: string, fileName = ''): number | null {
  const target = normalizeText(`${text}\n${fileName}`)

  const reiwa = target.match(/令和\s*([元0-9]{1,2})\s*年度?/)
  if (reiwa) {
    const raw = reiwa[1]
    const yearNumber = raw === '元' ? 1 : Number(raw)
    return 2018 + yearNumber
  }

  const heisei = target.match(/平成\s*([0-9]{1,2})\s*年度?/)
  if (heisei) return 1988 + Number(heisei[1])

  const western = target.match(/20(1[4-9]|2[0-9])\s*(?:年度|年)?/)
  if (western) return Number(western[0].match(/20\d{2}/)?.[0])

  return null
}

export function detectPublicExamSession(text: string, fileName = ''): string {
  const target = normalizeText(`${fileName}\n${text}`)
  const year = detectPublicExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function estimatePublicQuestionCount(text: string): number {
  const normalized = normalizeText(text)
  const range = normalized.match(/解答番号\s*(?:は)?\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/)
  if (range) return Number(range[2]) - Number(range[1]) + 1

  const answerNumbers = Array.from(
    normalized.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  return answerNumbers.length ? Math.max(...answerNumbers) : 0
}

export function detectPublicBlocks(text: string): string[] {
  return splitTextByPublicBlocks(text).map((block) => block.label)
}

function questionSpanToCount(match: RegExpExecArray): number {
  const start = Number(match[1])
  const end = Number(match[2] ?? match[3] ?? start)
  return Math.max(0, end - start + 1)
}

function questionSpanToRange(match: RegExpExecArray): { start: number; end: number } {
  const start = Number(match[1])
  const end = Number(match[2] ?? match[3] ?? start)
  return { start, end }
}

function headingStartFor(text: string, index: number): number {
  const windowStart = Math.max(0, index - 260)
  const window = text.slice(windowStart, index)
  const candidates = [
    window.lastIndexOf('公共 '),
    window.lastIndexOf('現代社会 '),
    window.lastIndexOf('倫理 '),
    window.lastIndexOf('政治・経済 '),
    window.lastIndexOf('政治経済 '),
    window.lastIndexOf('―')
  ].filter((value) => value >= 0)
  const last = candidates.length ? Math.max(...candidates) : -1
  if (last >= 0) return windowStart + last + 1
  const sentence = Math.max(window.lastIndexOf('。'), window.lastIndexOf('\n'))
  return sentence >= 0 ? windowStart + sentence + 1 : windowStart
}

export function splitTextByPublicBlocks(text: string): SplitBlock[] {
  const normalized = normalizeText(text)
  const positions: Array<{
    index: number
    heading: string
    smallQuestionCount: number
    answerRange: { start: number; end: number }
  }> = []
  const blockPattern =
    /問\s*([0-9]{1,2})(?:\s*[〜～~\-－]\s*問\s*([0-9]{1,2})|\s*と\s*問\s*([0-9]{1,2}))\s*に答えよ/g

  let match: RegExpExecArray | null
  while ((match = blockPattern.exec(normalized)) !== null) {
    const startQuestion = Number(match[1])
    if (startQuestion !== 1) continue
    const start = headingStartFor(normalized, match.index)
    positions.push({
      index: start,
      heading: normalized.slice(start, match.index + match[0].length).trim(),
      smallQuestionCount: questionSpanToCount(match),
      answerRange: questionSpanToRange(match)
    })
  }

  if (positions.length === 0) {
    return [{
      label: '大問1',
      heading: '全文',
      text: normalized,
      smallQuestionCount: estimatePublicQuestionCount(normalized),
      answerRange: null
    }]
  }

  return positions.map((position, index) => {
    const end = positions[index + 1]?.index ?? normalized.length
    return {
      label: `大問${index + 1}`,
      heading: position.heading,
      text: normalized.slice(position.index, end),
      smallQuestionCount: position.smallQuestionCount,
      answerRange: position.answerRange
    }
  })
}

export function matchPublicTopicL1(text: string, ruleSet: PublicRuleSet): PublicTopicHit[] {
  const hits: PublicTopicHit[] = []

  for (const topic of topicsForRuleSet(ruleSet)) {
    const keywords = keywordMap[topic]?.keywords ?? [topic]
    let count = 0
    const matchedKeywords = new Set<string>()

    for (const keyword of keywords) {
      const occurrences = countKeyword(text, keyword)
      if (occurrences > 0) {
        count += occurrences
        matchedKeywords.add(keyword)
      }
    }

    if (count > 0) {
      hits.push({
        topic_l1: topic,
        count,
        matchedKeywords: Array.from(matchedKeywords)
      })
    }
  }

  return hits.sort((a, b) => b.count - a.count)
}

export function detectPublicFormatTags(text: string): string[] {
  const detected: string[] = []
  for (const [format, keywords] of Object.entries(formatKeywords)) {
    if (keywords.some((keyword) => countKeyword(text, keyword) > 0)) {
      detected.push(format)
    }
  }
  return detected
}

function extractAnswerRange(text: string): { start: number; end: number } | null {
  const answerNumbers = Array.from(
    text.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  if (!answerNumbers.length) return null
  return {
    start: Math.min(...answerNumbers),
    end: Math.max(...answerNumbers)
  }
}

function topicFromHeading(heading: string, topicHits: PublicTopicHit[]): PublicTopicHit | undefined {
  const candidates: Array<[RegExp, string]> = [
    [/公共的な空間|ライフプラン|職業選択|キャリア|進路/, '公共的な空間とキャリア形成'],
    [/正義|公正|幸福|先哲|思想|法の支配|自然権/, '倫理的主体と先哲の思想'],
    [/ルール|きまり|法の意義|人権|憲法|司法|裁判|契約/, '法の意義・人権・司法'],
    [/政治|主権者|選挙|投票|国会|地方自治|住民投票/, '民主政治・政治参加'],
    [/労働|経済|市場|社会保障|少子高齢化|雇用|税|金融/, '経済・労働・社会保障'],
    [/持続可能|SDGs|国際|地球温暖化|環境|国連/, '国際社会・持続可能な社会'],
    [/青年期|自己形成|アイデンティティ/, '青年期と自己形成'],
    [/現代社会|情報化|グローバル化|多文化/, '現代社会の特質と課題'],
    [/日本国憲法|基本的人権/, '日本国憲法と基本的人権'],
    [/民主政治|政治参加/, '民主政治と政治参加'],
    [/国際社会|地球環境/, '国際社会と地球環境'],
    [/ギリシア|ソクラテス|プラトン|アリストテレス/, '古代ギリシア思想'],
    [/仏教|キリスト教|イスラーム|宗教/, '宗教思想'],
    [/孔子|儒教|老子|中国思想/, '中国思想'],
    [/日本思想|和辻|西田|親鸞|道元/, '日本思想'],
    [/デカルト|カント|ルソー|ロック|近代西洋/, '近代西洋思想'],
    [/生命倫理|環境倫理|iPS|ES細胞|再生医療/, '生命倫理・環境倫理'],
    [/民主主義|立憲主義|権力分立/, '民主政治の原理'],
    [/国会|内閣|裁判所/, '国会・内閣・裁判所'],
    [/地方自治|住民参加/, '地方自治と住民参加'],
    [/市場経済|企業/, '市場経済と企業'],
    [/財政|金融|日本銀行/, '財政・金融'],
    [/労働|社会保障/, '労働・社会保障'],
    [/国際政治|安全保障|核兵器/, '国際政治'],
    [/国際経済|貿易|為替/, '国際経済']
  ]

  for (const [pattern, topic] of candidates) {
    if (pattern.test(heading)) {
      return topicHits.find((hit) => hit.topic_l1 === topic)
    }
  }

  return undefined
}

function chooseTopic(heading: string, topicHits: PublicTopicHit[]): PublicTopicHit | undefined {
  return topicFromHeading(heading, topicHits) ?? topicHits[0]
}

function getConfidence(
  selected: PublicTopicHit | undefined,
  topicHits: PublicTopicHit[],
  heading: string
): 'high' | 'medium' | 'low' {
  if (!selected) return 'low'
  if (topicFromHeading(heading, topicHits) && selected.count >= 1) return selected.count >= 4 ? 'high' : 'medium'
  const secondHit = topicHits.find((hit) => hit.topic_l1 !== selected.topic_l1)
  if (selected.count >= 8 && (!secondHit || selected.count >= secondHit.count * 1.25)) return 'high'
  if (selected.count >= 3) return 'medium'
  return 'low'
}

export function analyzePublicBlocks(text: string, ruleSet: PublicRuleSet): PublicBlockHit[] {
  const blocks = splitTextByPublicBlocks(text)
  let previousAnswerEnd = 0

  return blocks.map((block, index) => {
    const topicHits = matchPublicTopicL1(block.text, ruleSet)
    const selectedTopic = chooseTopic(block.heading, topicHits)
    const formatTags = detectPublicFormatTags(block.text)
    let answerRange = extractAnswerRange(block.text) ?? block.answerRange

    if (answerRange && answerRange.start <= previousAnswerEnd) {
      const start = previousAnswerEnd + 1
      answerRange = {
        start,
        end: Math.max(start, start + block.smallQuestionCount - 1)
      }
    }
    if (answerRange) {
      previousAnswerEnd = Math.max(previousAnswerEnd, answerRange.end)
    }

    return {
      block: block.label,
      blockIndex: index,
      heading: block.heading,
      smallQuestionCount: block.smallQuestionCount,
      answerRange,
      topic_l1: selectedTopic?.topic_l1 ?? '判定保留',
      topicHits,
      matchedKeywords: selectedTopic?.matchedKeywords ?? [],
      keywordCount: selectedTopic?.count ?? 0,
      confidence: getConfidence(selectedTopic, topicHits, block.heading),
      formatTags
    }
  })
}

export function aggregatePublicFormatCounts(blockHits: PublicBlockHit[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const hit of blockHits) {
    for (const format of hit.formatTags) {
      counts[format] = (counts[format] ?? 0) + 1
    }
  }
  return counts
}
