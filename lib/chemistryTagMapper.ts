/**
 * 化学基礎過去問のタグマッピング
 * 大問見出しと本文キーワードを併用し、分野・小テーマ・出題形式を判定する。
 */

import chemistryTags from '@/data/chemistryTags.json'

export type ChemistryRuleSet = {
  code: string
  label: string
}

export type ChemistryTopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type ChemistryTopicL2Hit = {
  topic_l2: string
  parent: string
  count: number
  matchedKeywords: string[]
}

export type ChemistryBlockHit = {
  block: string
  blockIndex: number
  heading: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
  topic_l1: string
  topicHits: ChemistryTopicHit[]
  topicL2Hits: ChemistryTopicL2Hit[]
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'medium' | 'low'
  formatTags: string[]
}

export type ChemistryAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: ChemistryRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: ChemistryBlockHit[]
  detectedBlocks: string[]
  questionCount: number
  formatCounts: Record<string, number>
  analyzedAt: string
}

type ChemistryUnit = {
  block: string
  topic_l1: string
  topic_l2: string[]
  keywords: string[]
}

type SplitBlock = {
  label: string
  heading: string
  text: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
}

const ruleSetData = chemistryTags.rule_sets[0]
const units = ruleSetData.units as ChemistryUnit[]
const formatKeywords = (chemistryTags as any).format_keywords as Record<string, string[]>

export const chemistryRuleSet: ChemistryRuleSet = {
  code: ruleSetData.code,
  label: ruleSetData.label
}

const l2Keywords: Record<string, { parent: string; keywords: string[] }> = {
  '身近な物質と材料': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['身近な物質', '材料', '金属', 'プラスチック', 'セラミックス', '繊維', '食品', '洗剤']
  },
  '物質の分離・精製': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['分離', '精製', 'ろ過', 'ろ紙', '蒸留', '分留', '再結晶', '抽出', 'クロマトグラフィー']
  },
  '元素と単体・化合物': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['元素', '単体', '化合物', '純物質', '混合物', '元素記号', '同素体']
  },
  '原子の構造': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['原子', '原子番号', '質量数', '陽子', '中性子', '電子', '同位体']
  },
  '電子配置': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['電子配置', '電子殻', '価電子', '最外殻電子', '閉殻']
  },
  '周期表': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['周期表', '族', '周期', 'アルカリ金属', 'ハロゲン', '希ガス']
  },
  'イオン': {
    parent: '化学と人間生活・物質の構成粒子',
    keywords: ['イオン', '陽イオン', '陰イオン', '価数', 'イオン式']
  },
  'イオン結合': {
    parent: '物質と化学結合',
    keywords: ['イオン結合', 'イオン結晶', '組成式', '塩化ナトリウム', '静電気力']
  },
  '共有結合': {
    parent: '物質と化学結合',
    keywords: ['共有結合', '電子式', '構造式', '分子式', '配位結合']
  },
  '金属結合': {
    parent: '物質と化学結合',
    keywords: ['金属結合', '自由電子', '展性', '延性', '金属結晶']
  },
  '分子の極性': {
    parent: '物質と化学結合',
    keywords: ['極性', '無極性', '電気陰性度', '極性分子', '無極性分子']
  },
  '結晶の分類': {
    parent: '物質と化学結合',
    keywords: ['結晶', 'イオン結晶', '分子結晶', '共有結合結晶', '金属結晶']
  },
  '分子間力': {
    parent: '物質と化学結合',
    keywords: ['分子間力', '水素結合', 'ファンデルワールス力', '沸点', '融点']
  },
  '物質量': {
    parent: '物質量と化学反応式',
    keywords: ['物質量', 'モル', 'mol', '粒子数']
  },
  'モル質量': {
    parent: '物質量と化学反応式',
    keywords: ['モル質量', '原子量', '分子量', '式量', '質量']
  },
  'アボガドロ数': {
    parent: '物質量と化学反応式',
    keywords: ['アボガドロ数', '6.0', '6.02', '個']
  },
  '化学反応式': {
    parent: '物質量と化学反応式',
    keywords: ['化学反応式', '反応式', '係数', '量的関係']
  },
  '量的関係': {
    parent: '物質量と化学反応式',
    keywords: ['量的関係', '標準状態', '22.4', '気体', '体積', '質量保存']
  },
  '溶液の濃度': {
    parent: '物質量と化学反応式',
    keywords: ['溶液', '溶質', '溶媒', '濃度', '質量パーセント濃度', 'モル濃度']
  },
  '酸・塩基の定義': {
    parent: '化学反応（酸・塩基）',
    keywords: ['酸・塩基', '酸性', '塩基', 'アルカリ', 'アレーニウス', 'ブレンステッド', '強酸', '弱酸']
  },
  '水素イオン濃度': {
    parent: '化学反応（酸・塩基）',
    keywords: ['水素イオン', '水酸化物イオン', '電離', '電離度']
  },
  'pH': {
    parent: '化学反応（酸・塩基）',
    keywords: ['pH', 'ピーエイチ', '水素イオン指数']
  },
  '中和反応': {
    parent: '化学反応（酸・塩基）',
    keywords: ['中和', '中和反応', '塩', '水']
  },
  '中和滴定': {
    parent: '化学反応（酸・塩基）',
    keywords: ['中和滴定', '滴定', 'ビュレット', 'ホールピペット', 'コニカルビーカー']
  },
  '塩の性質': {
    parent: '化学反応（酸・塩基）',
    keywords: ['塩', '加水分解', '酸性塩', '塩基性塩', '正塩']
  },
  '指示薬': {
    parent: '化学反応（酸・塩基）',
    keywords: ['指示薬', 'フェノールフタレイン', 'メチルオレンジ', 'リトマス']
  },
  '酸化数': {
    parent: '化学反応（酸化還元）',
    keywords: ['酸化数', '酸化', '還元']
  },
  '酸化剤・還元剤': {
    parent: '化学反応（酸化還元）',
    keywords: ['酸化剤', '還元剤', '過マンガン酸カリウム', '硫酸酸性']
  },
  '電子の授受': {
    parent: '化学反応（酸化還元）',
    keywords: ['電子の授受', '電子を失う', '電子を受け取る', '半反応式']
  },
  '金属のイオン化傾向': {
    parent: '化学反応（酸化還元）',
    keywords: ['イオン化傾向', '金属の反応性', '金属樹', '析出']
  },
  '電池': {
    parent: '化学反応（酸化還元）',
    keywords: ['電池', 'ダニエル電池', 'ボルタ電池', '燃料電池', '正極', '負極']
  },
  '電気分解': {
    parent: '化学反応（酸化還元）',
    keywords: ['電気分解', '電解質', '非電解質', '電極', '陽極', '陰極']
  }
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

export function detectChemistryExamYear(text: string, fileName = ''): number | null {
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

export function detectChemistryExamSession(text: string, fileName = ''): string {
  const target = normalizeText(`${fileName}\n${text}`)
  const year = detectChemistryExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function estimateChemistryQuestionCount(text: string): number {
  const normalized = normalizeText(text)
  const range = normalized.match(/解答番号\s*(?:は)?\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/)
  if (range) return Number(range[2]) - Number(range[1]) + 1

  const answerNumbers = Array.from(
    normalized.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  return answerNumbers.length ? Math.max(...answerNumbers) : 0
}

export function detectChemistryBlocks(text: string): string[] {
  return splitTextByChemistryBlocks(text).map((block) => block.label)
}

export function splitTextByChemistryBlocks(text: string): SplitBlock[] {
  const normalized = normalizeText(text)
  const positions: Array<{
    index: number
    heading: string
    smallQuestionCount: number
    answerRange: { start: number; end: number }
  }> = []
  const headingPattern =
    /((?:化学と人間生活|物質の構成粒子|物質と化学結合|物質量と化学反応式|化学反応|酸と塩基|酸化還元)[^。]{0,90}?について[，,、。]?\s*問\s*([0-9]{1,2})\s*[〜～~\-－]\s*問\s*([0-9]{1,2})\s*に答えよ)/g

  let match: RegExpExecArray | null
  while ((match = headingPattern.exec(normalized)) !== null) {
    const start = Number(match[2])
    const end = Number(match[3])
    positions.push({
      index: match.index,
      heading: match[1],
      smallQuestionCount: Math.max(0, end - start + 1),
      answerRange: { start, end }
    })
  }

  if (positions.length === 0) {
    const fallbackPattern = /(問\s*([0-9]{1,2})\s*[〜～~\-－]\s*問\s*([0-9]{1,2})\s*に答えよ)/g
    while ((match = fallbackPattern.exec(normalized)) !== null) {
      const start = Number(match[2])
      const end = Number(match[3])
      positions.push({
        index: match.index,
        heading: match[1],
        smallQuestionCount: Math.max(0, end - start + 1),
        answerRange: { start, end }
      })
    }
  }

  if (positions.length === 0) {
    return [{
      label: '大問1',
      heading: '全文',
      text: normalized,
      smallQuestionCount: estimateChemistryQuestionCount(normalized),
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

export function matchChemistryTopicL1(text: string): ChemistryTopicHit[] {
  const hits = new Map<string, { count: number; matchedKeywords: Set<string> }>()

  for (const unit of units) {
    let count = 0
    const matchedKeywords = new Set<string>()

    for (const keyword of unit.keywords) {
      const occurrences = countKeyword(text, keyword)
      if (occurrences > 0) {
        count += occurrences
        matchedKeywords.add(keyword)
      }
    }

    if (count > 0) {
      hits.set(unit.topic_l1, {
        count,
        matchedKeywords
      })
    }
  }

  return Array.from(hits.entries())
    .map(([topic_l1, data]) => ({
      topic_l1,
      count: data.count,
      matchedKeywords: Array.from(data.matchedKeywords)
    }))
    .sort((a, b) => b.count - a.count)
}

export function matchChemistryTopicL2(text: string, parent?: string): ChemistryTopicL2Hit[] {
  const hits = new Map<string, { parent: string; count: number; matchedKeywords: Set<string> }>()

  for (const [topic_l2, config] of Object.entries(l2Keywords)) {
    if (parent && config.parent !== parent) continue

    let count = 0
    const matchedKeywords = new Set<string>()
    for (const keyword of config.keywords) {
      const occurrences = countKeyword(text, keyword)
      if (occurrences > 0) {
        count += occurrences
        matchedKeywords.add(keyword)
      }
    }

    if (count > 0) {
      hits.set(topic_l2, {
        parent: config.parent,
        count,
        matchedKeywords
      })
    }
  }

  return Array.from(hits.entries())
    .map(([topic_l2, data]) => ({
      topic_l2,
      parent: data.parent,
      count: data.count,
      matchedKeywords: Array.from(data.matchedKeywords)
    }))
    .sort((a, b) => b.count - a.count)
}

export function detectChemistryFormatTags(text: string): string[] {
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

function topicFromHeading(
  heading: string,
  blockText: string,
  topicHits: ChemistryTopicHit[]
): ChemistryTopicHit | undefined {
  if (/化学と人間生活|物質の構成粒子/.test(heading)) {
    return topicHits.find((hit) => hit.topic_l1 === '化学と人間生活・物質の構成粒子') ?? {
      topic_l1: '化学と人間生活・物質の構成粒子',
      count: 1,
      matchedKeywords: ['大問見出し']
    }
  }

  if (/物質と化学結合/.test(heading)) {
    return topicHits.find((hit) => hit.topic_l1 === '物質と化学結合') ?? {
      topic_l1: '物質と化学結合',
      count: 1,
      matchedKeywords: ['大問見出し']
    }
  }

  if (/物質量と化学反応式/.test(heading)) {
    return topicHits.find((hit) => hit.topic_l1 === '物質量と化学反応式') ?? {
      topic_l1: '物質量と化学反応式',
      count: 1,
      matchedKeywords: ['大問見出し']
    }
  }

  if (/化学反応|酸と塩基|酸化還元/.test(heading)) {
    const acidScore = ['酸・塩基', '酸性', '塩基', 'pH', '中和', '滴定', '指示薬', '水素イオン', '強酸', '弱酸']
      .reduce((sum, keyword) => sum + countKeyword(blockText, keyword), 0)
    const redoxScore = ['酸化', '還元', '酸化数', '酸化剤', '還元剤', '電池', '電気分解', 'イオン化傾向']
      .reduce((sum, keyword) => sum + countKeyword(blockText, keyword), 0)
    const preferred = acidScore >= redoxScore
      ? '化学反応（酸・塩基）'
      : '化学反応（酸化還元）'
    return topicHits.find((hit) => hit.topic_l1 === preferred)
  }

  return undefined
}

function chooseTopic(
  heading: string,
  blockText: string,
  topicHits: ChemistryTopicHit[]
): ChemistryTopicHit | undefined {
  return topicFromHeading(heading, blockText, topicHits) ?? topicHits[0]
}

function getConfidence(
  selected: ChemistryTopicHit | undefined,
  topicHits: ChemistryTopicHit[],
  heading: string
): 'high' | 'medium' | 'low' {
  if (!selected) return 'low'
  if (/化学と人間生活|物質の構成粒子|物質と化学結合|物質量と化学反応式/.test(heading) && selected.count >= 1) {
    return selected.count >= 4 ? 'high' : 'medium'
  }
  const secondHit = topicHits.find((hit) => hit.topic_l1 !== selected.topic_l1)
  if (selected.count >= 7 && (!secondHit || selected.count >= secondHit.count * 1.25)) return 'high'
  if (selected.count >= 3) return 'medium'
  return 'low'
}

export function analyzeChemistryBlocks(text: string): ChemistryBlockHit[] {
  const blocks = splitTextByChemistryBlocks(text)
  let previousAnswerEnd = 0

  return blocks.map((block, index) => {
    const topicHits = matchChemistryTopicL1(block.text)
    const selectedTopic = chooseTopic(block.heading, block.text, topicHits)
    const topicL2Hits = matchChemistryTopicL2(block.text, selectedTopic?.topic_l1)
    const formatTags = detectChemistryFormatTags(block.text)
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
      topicL2Hits,
      matchedKeywords: selectedTopic?.matchedKeywords ?? [],
      keywordCount: selectedTopic?.count ?? 0,
      confidence: getConfidence(selectedTopic, topicHits, block.heading),
      formatTags
    }
  })
}

export function aggregateChemistryFormatCounts(blockHits: ChemistryBlockHit[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const hit of blockHits) {
    for (const format of hit.formatTags) {
      counts[format] = (counts[format] ?? 0) + 1
    }
  }
  return counts
}
