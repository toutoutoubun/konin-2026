/**
 * 物理基礎過去問のタグマッピング
 * 「問1〜問Nに答えよ。」で大問を分割し、各大問の本文から分野・形式を判定する。
 */

import physicsTags from '@/data/physicsTags.json'

export type PhysicsRuleSet = {
  code: string
  label: string
}

export type PhysicsTopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type PhysicsTopicL2Hit = {
  topic_l2: string
  parent: string
  count: number
  matchedKeywords: string[]
}

export type PhysicsBlockHit = {
  block: string
  blockIndex: number
  heading: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
  topic_l1: string
  topicHits: PhysicsTopicHit[]
  topicL2Hits: PhysicsTopicL2Hit[]
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'medium' | 'low'
  formatTags: string[]
}

export type PhysicsAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: PhysicsRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: PhysicsBlockHit[]
  detectedBlocks: string[]
  questionCount: number
  formatCounts: Record<string, number>
  analyzedAt: string
}

type PhysicsUnit = {
  block: string
  topic_l1: string
  topic_l2: string[]
  keywords: string[]
}

const ruleSetData = physicsTags.rule_sets[0]
const units = ruleSetData.units as PhysicsUnit[]
const formatKeywords = (physicsTags as any).format_keywords as Record<string, string[]>

export const physicsRuleSet: PhysicsRuleSet = {
  code: ruleSetData.code,
  label: ruleSetData.label
}

const l2Keywords: Record<string, { parent: string; keywords: string[] }> = {
  '有効数字': { parent: '物理量と測定', keywords: ['有効数字', '桁', '測定値'] },
  '単位換算': { parent: '物理量と測定', keywords: ['単位換算', 'km/h', 'm/s', 'cm', 'mm', '単位'] },
  '速度・加速度': { parent: '力と運動', keywords: ['速度', '速さ', '加速度', '等速', '等加速度', '移動', '変位'] },
  '相対速度': { parent: '力と運動', keywords: ['相対速度', '近づいて', '遠ざかって', '東向き', '西向き'] },
  '力の合成・分解': { parent: '力と運動', keywords: ['合力', '分力', '力の合成', '力の分解', '斜面'] },
  '運動方程式': { parent: '力と運動', keywords: ['運動方程式', 'ma', '加速度', '張力', '滑車'] },
  '慣性・作用反作用': { parent: '力と運動', keywords: ['慣性', '作用反作用', '作用・反作用', '急ブレーキ'] },
  '落下運動': { parent: '力と運動', keywords: ['自由落下', '落下', '鉛直', '重力加速度'] },
  '摩擦': { parent: '力と運動', keywords: ['摩擦', '静止摩擦', '動摩擦', 'すべり'] },
  '仕事': { parent: 'エネルギーと仕事', keywords: ['仕事', '力がした仕事'] },
  '仕事率': { parent: 'エネルギーと仕事', keywords: ['仕事率', 'W'] },
  '運動エネルギー': { parent: 'エネルギーと仕事', keywords: ['運動エネルギー'] },
  '位置エネルギー': { parent: 'エネルギーと仕事', keywords: ['位置エネルギー'] },
  '力学的エネルギー保存': { parent: 'エネルギーと仕事', keywords: ['力学的エネルギー', '保存'] },
  'エネルギー資源': { parent: 'エネルギーと仕事', keywords: ['一次エネルギー', '二次エネルギー', '発電', '蓄電', '揚水'] },
  '熱量': { parent: '熱', keywords: ['熱量', 'J', 'cal'] },
  '比熱': { parent: '熱', keywords: ['比熱', '比熱容量'] },
  '熱量保存': { parent: '熱', keywords: ['熱量保存', '熱平衡', '熱の移動'] },
  '状態変化': { parent: '熱', keywords: ['状態変化', '融解', '蒸発', '沸騰', '潜熱'] },
  '熱と温度': { parent: '熱', keywords: ['温度', '熱運動', '絶対温度'] },
  '波の性質': { parent: '波・音・光', keywords: ['波', '縦波', '横波', '振幅'] },
  '振動数・波長・周期': { parent: '波・音・光', keywords: ['振動数', '波長', '周期', '速さ'] },
  '音': { parent: '波・音・光', keywords: ['音', '音波', '音速', 'おんさ', 'うなり'] },
  '弦・気柱の振動': { parent: '波・音・光', keywords: ['弦', '気柱', '共鳴', '固有振動'] },
  '光の反射・屈折': { parent: '波・音・光', keywords: ['光', '反射', '屈折', 'レンズ', '焦点'] },
  'オームの法則': { parent: '電気', keywords: ['オーム', '電流', '電圧', '抵抗'] },
  '直列・並列回路': { parent: '電気', keywords: ['直列', '並列', '回路'] },
  '電力・電力量': { parent: '電気', keywords: ['電力', '電力量', 'W', 'Wh'] },
  'ジュール熱': { parent: '電気', keywords: ['ジュール熱', '発熱'] },
  '電磁誘導': { parent: '電気', keywords: ['電磁誘導', '磁場', '磁界', 'コイル'] }
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

export function detectPhysicsExamYear(text: string, fileName = ''): number | null {
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

export function detectPhysicsExamSession(text: string, fileName = ''): string {
  const target = normalizeText(`${fileName}\n${text}`)
  const year = detectPhysicsExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function estimatePhysicsQuestionCount(text: string): number {
  const normalized = normalizeText(text)
  const range = normalized.match(/解答番号\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/)
  if (range) return Number(range[2]) - Number(range[1]) + 1

  const answerNumbers = Array.from(
    normalized.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  return answerNumbers.length ? Math.max(...answerNumbers) : 0
}

export function detectPhysicsBlocks(text: string): string[] {
  return splitTextByPhysicsBlocks(text).map((block) => block.label)
}

export function splitTextByPhysicsBlocks(text: string): Array<{
  label: string
  heading: string
  text: string
  smallQuestionCount: number
}> {
  const normalized = normalizeText(text)
  const positions: Array<{ index: number; heading: string; smallQuestionCount: number }> = []
  const pattern = /問\s*1\s*[〜～~\-－]\s*問\s*([0-9]{1,2})\s*に答えよ/g

  let match: RegExpExecArray | null
  while ((match = pattern.exec(normalized)) !== null) {
    positions.push({
      index: match.index,
      heading: match[0],
      smallQuestionCount: Number(match[1])
    })
  }

  if (positions.length === 0) {
    return [{
      label: '大問1',
      heading: '全文',
      text: normalized,
      smallQuestionCount: estimatePhysicsQuestionCount(normalized)
    }]
  }

  return positions.map((position, index) => {
    const end = positions[index + 1]?.index ?? normalized.length
    return {
      label: `大問${index + 1}`,
      heading: position.heading,
      text: normalized.slice(position.index, end),
      smallQuestionCount: position.smallQuestionCount
    }
  })
}

export function matchPhysicsTopicL1(text: string): PhysicsTopicHit[] {
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

export function matchPhysicsTopicL2(text: string, parent?: string): PhysicsTopicL2Hit[] {
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

export function detectPhysicsFormatTags(text: string): string[] {
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

function getConfidence(topHit: PhysicsTopicHit | undefined, secondHit: PhysicsTopicHit | undefined): 'high' | 'medium' | 'low' {
  if (!topHit) return 'low'
  if (topHit.count >= 8 && (!secondHit || topHit.count >= secondHit.count * 1.25)) return 'high'
  if (topHit.count >= 3) return 'medium'
  return 'low'
}

export function analyzePhysicsBlocks(text: string): PhysicsBlockHit[] {
  const blocks = splitTextByPhysicsBlocks(text)
  let previousAnswerEnd = 0

  return blocks.map((block, index) => {
    const topicHits = matchPhysicsTopicL1(block.text)
    const topHit = topicHits[0]
    const topicL2Hits = matchPhysicsTopicL2(block.text, topHit?.topic_l1)
    const formatTags = detectPhysicsFormatTags(block.text)
    let answerRange = extractAnswerRange(block.text)

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
      topic_l1: topHit?.topic_l1 ?? '判定保留',
      topicHits,
      topicL2Hits,
      matchedKeywords: topHit?.matchedKeywords ?? [],
      keywordCount: topHit?.count ?? 0,
      confidence: getConfidence(topHit, topicHits[1]),
      formatTags
    }
  })
}

export function aggregatePhysicsFormatCounts(blockHits: PhysicsBlockHit[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const hit of blockHits) {
    for (const format of hit.formatTags) {
      counts[format] = (counts[format] ?? 0) + 1
    }
  }
  return counts
}
