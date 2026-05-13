/**
 * 生物基礎過去問のタグマッピング
 * 大問見出しと本文キーワードを併用し、分野・小テーマ・出題形式を判定する。
 */

import biologyTags from '@/data/biologyTags.json'

export type BiologyRuleSet = {
  code: string
  label: string
}

export type BiologyTopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type BiologyTopicL2Hit = {
  topic_l2: string
  parent: string
  count: number
  matchedKeywords: string[]
}

export type BiologyBlockHit = {
  block: string
  blockIndex: number
  heading: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
  topic_l1: string
  topicHits: BiologyTopicHit[]
  topicL2Hits: BiologyTopicL2Hit[]
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'medium' | 'low'
  formatTags: string[]
}

export type BiologyAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: BiologyRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: BiologyBlockHit[]
  detectedBlocks: string[]
  questionCount: number
  formatCounts: Record<string, number>
  analyzedAt: string
}

type BiologyUnit = {
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

const ruleSetData = biologyTags.rule_sets[0]
const units = ruleSetData.units as BiologyUnit[]
const formatKeywords = (biologyTags as any).format_keywords as Record<string, string[]>

export const biologyRuleSet: BiologyRuleSet = {
  code: ruleSetData.code,
  label: ruleSetData.label
}

const l2Keywords: Record<string, { parent: string; keywords: string[] }> = {
  '生物の共通性': { parent: '生物の特徴', keywords: ['生物の共通性', '共通性', 'DNA', '細胞', 'ATP'] },
  '細胞の構造': { parent: '生物の特徴', keywords: ['細胞膜', '核', 'ミトコンドリア', '葉緑体', 'リボソーム', '液胞', '細胞壁'] },
  '原核細胞・真核細胞': { parent: '生物の特徴', keywords: ['原核細胞', '真核細胞', '原核', '真核', '細菌'] },
  'ATPと代謝': { parent: '生物の特徴', keywords: ['ATP', 'ADP', 'エネルギー', '代謝', '呼吸', '光合成'] },
  '酵素': { parent: '生物の特徴', keywords: ['酵素', '基質', 'タンパク質', '触媒'] },
  '顕微鏡・細胞数推定': { parent: '生物の特徴', keywords: ['顕微鏡', '細胞数', '推定', '発光', '培養'] },
  'DNAの構造': { parent: '遺伝子とその働き', keywords: ['DNA', '二重らせん', 'ヌクレオチド', '塩基'] },
  '遺伝情報とタンパク質': { parent: '遺伝子とその働き', keywords: ['遺伝情報', 'タンパク質', 'アミノ酸', 'コドン'] },
  'DNAの複製': { parent: '遺伝子とその働き', keywords: ['DNAの複製', '複製'] },
  '細胞周期': { parent: '遺伝子とその働き', keywords: ['細胞周期', 'S期', 'M期', '染色体'] },
  '遺伝子の発現': { parent: '遺伝子とその働き', keywords: ['発現', '転写', '翻訳', 'mRNA', 'RNA'] },
  'ゲノム': { parent: '遺伝子とその働き', keywords: ['ゲノム', '遺伝子'] },
  '体液と循環': { parent: '神経系と内分泌系による調節', keywords: ['血液', '血しょう', '血漿', '組織液', 'リンパ液', '心臓'] },
  '自律神経': { parent: '神経系と内分泌系による調節', keywords: ['自律神経', '交感神経', '副交感神経', '中枢神経'] },
  '内分泌系': { parent: '神経系と内分泌系による調節', keywords: ['内分泌系', '視床下部', '脳下垂体', '副腎', 'すい臓'] },
  'ホルモン': { parent: '神経系と内分泌系による調節', keywords: ['ホルモン', 'インスリン', 'グルカゴン', 'アドレナリン'] },
  '血糖濃度調節': { parent: '神経系と内分泌系による調節', keywords: ['血糖', '血糖濃度', 'グルコース', '糖尿病'] },
  'フィードバック': { parent: '神経系と内分泌系による調節', keywords: ['フィードバック', '調節'] },
  '恒常性': { parent: '神経系と内分泌系による調節', keywords: ['恒常性', 'ホメオスタシス', '体温調節'] },
  '自然免疫': { parent: '免疫', keywords: ['自然免疫', '食作用', '好中球', 'マクロファージ'] },
  '獲得免疫': { parent: '免疫', keywords: ['獲得免疫', 'リンパ球', 'T細胞', 'B細胞', '記憶細胞'] },
  '白血球': { parent: '免疫', keywords: ['白血球', '好中球', 'マクロファージ', 'リンパ球'] },
  '抗体': { parent: '免疫', keywords: ['抗体', '抗原', '体液性免疫'] },
  '予防接種': { parent: '免疫', keywords: ['予防接種', 'ワクチン', '記憶細胞'] },
  'アレルギー・拒絶反応': { parent: '免疫', keywords: ['アレルギー', '拒絶反応', '移植', 'エイズ'] },
  'バイオーム': { parent: '植生と遷移', keywords: ['バイオーム', '年平均気温', '年降水量', 'ツンドラ', 'サバンナ'] },
  '植生帯': { parent: '植生と遷移', keywords: ['植生帯', '照葉樹林', '夏緑樹林', '針葉樹林', '亜高山帯'] },
  '遷移': { parent: '植生と遷移', keywords: ['遷移', '先駆植物', 'パイオニア植物'] },
  '一次遷移・二次遷移': { parent: '植生と遷移', keywords: ['一次遷移', '二次遷移', '裸地', '土壌'] },
  '陽樹・陰樹': { parent: '植生と遷移', keywords: ['陽樹', '陰樹', '林床', '光'] },
  '極相': { parent: '植生と遷移', keywords: ['極相', '極相林', 'ギャップ'] },
  '森林構造': { parent: '植生と遷移', keywords: ['森林', '低木林', '混交林', '階層構造'] },
  '生態系': { parent: '生態系とその保全', keywords: ['生態系', '生産者', '消費者', '分解者'] },
  '食物連鎖': { parent: '生態系とその保全', keywords: ['食物連鎖', '食物網', '栄養段階'] },
  '物質循環': { parent: '生態系とその保全', keywords: ['物質循環', '炭素循環', '窒素循環'] },
  '生物多様性': { parent: '生態系とその保全', keywords: ['生物多様性', '種多様性', '遺伝的多様性', '生態系多様性'] },
  '外来生物': { parent: '生態系とその保全', keywords: ['外来生物', '外来種', '在来生物'] },
  '絶滅危惧': { parent: '生態系とその保全', keywords: ['絶滅危惧', 'レッドリスト', '保護'] },
  '地球温暖化': { parent: '生態系とその保全', keywords: ['地球温暖化', '温暖化', '分布域', '海面'] },
  '人間活動と保全': { parent: '生態系とその保全', keywords: ['人間活動', '保全', '里山', '草刈り', '野焼き', '半自然草原'] }
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

export function detectBiologyExamYear(text: string, fileName = ''): number | null {
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

export function detectBiologyExamSession(text: string, fileName = ''): string {
  const target = normalizeText(`${fileName}\n${text}`)
  const year = detectBiologyExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function estimateBiologyQuestionCount(text: string): number {
  const normalized = normalizeText(text)
  const range = normalized.match(/解答番号\s*(?:は)?\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/)
  if (range) return Number(range[2]) - Number(range[1]) + 1

  const answerNumbers = Array.from(
    normalized.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  return answerNumbers.length ? Math.max(...answerNumbers) : 0
}

export function detectBiologyBlocks(text: string): string[] {
  return splitTextByBiologyBlocks(text).map((block) => block.label)
}

function questionSpanToCount(match: RegExpExecArray): number {
  const start = Number(match[2])
  const end = Number(match[3] ?? match[4] ?? start)
  return Math.max(0, end - start + 1)
}

function questionSpanToRange(match: RegExpExecArray): { start: number; end: number } {
  const start = Number(match[2])
  const end = Number(match[3] ?? match[4] ?? start)
  return { start, end }
}

export function splitTextByBiologyBlocks(text: string): SplitBlock[] {
  const normalized = normalizeText(text)
  const positions: Array<{
    index: number
    heading: string
    smallQuestionCount: number
    answerRange: { start: number; end: number }
  }> = []
  const headingPattern =
    /((?:生物の特徴|遺伝子とその働き|神経系と内分泌系による調節|神経系と内分泌系|体内環境|免疫|植生と遷移|生態系とその保全|生態系)[^。]{0,80}?に関して[，,、。]?\s*科学的に探究した[。.]?\s*問\s*([0-9]{1,2})(?:\s*[〜～~\-－]\s*問\s*([0-9]{1,2})|\s*と\s*問\s*([0-9]{1,2}))\s*に答えよ)/g

  let match: RegExpExecArray | null
  while ((match = headingPattern.exec(normalized)) !== null) {
    positions.push({
      index: match.index,
      heading: match[1],
      smallQuestionCount: questionSpanToCount(match),
      answerRange: questionSpanToRange(match)
    })
  }

  if (positions.length === 0) {
    const fallbackPattern =
      /(.{0,80}?に関して[，,、。]?\s*科学的に探究した[。.]?\s*問\s*([0-9]{1,2})(?:\s*[〜～~\-－]\s*問\s*([0-9]{1,2})|\s*と\s*問\s*([0-9]{1,2}))\s*に答えよ)/g
    while ((match = fallbackPattern.exec(normalized)) !== null) {
      positions.push({
        index: match.index,
        heading: match[1],
        smallQuestionCount: questionSpanToCount(match),
        answerRange: questionSpanToRange(match)
      })
    }
  }

  if (positions.length === 0) {
    return [{
      label: '大問1',
      heading: '全文',
      text: normalized,
      smallQuestionCount: estimateBiologyQuestionCount(normalized),
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

export function matchBiologyTopicL1(text: string): BiologyTopicHit[] {
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
      hits.set(unit.topic_l1, { count, matchedKeywords })
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

export function matchBiologyTopicL2(text: string, parent?: string): BiologyTopicL2Hit[] {
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

export function detectBiologyFormatTags(text: string): string[] {
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

function fallbackHit(topic_l1: string): BiologyTopicHit {
  return {
    topic_l1,
    count: 1,
    matchedKeywords: ['大問見出し']
  }
}

function topicFromHeading(heading: string, topicHits: BiologyTopicHit[]): BiologyTopicHit | undefined {
  const candidates: Array<[RegExp, string]> = [
    [/生物の特徴/, '生物の特徴'],
    [/遺伝子とその働き/, '遺伝子とその働き'],
    [/神経系と内分泌系|体内環境/, '神経系と内分泌系による調節'],
    [/免疫/, '免疫'],
    [/植生と遷移/, '植生と遷移'],
    [/生態系とその保全|生態系/, '生態系とその保全']
  ]

  for (const [pattern, topic] of candidates) {
    if (pattern.test(heading)) {
      return topicHits.find((hit) => hit.topic_l1 === topic) ?? fallbackHit(topic)
    }
  }

  return undefined
}

function chooseTopic(heading: string, topicHits: BiologyTopicHit[]): BiologyTopicHit | undefined {
  return topicFromHeading(heading, topicHits) ?? topicHits[0]
}

function getConfidence(
  selected: BiologyTopicHit | undefined,
  topicHits: BiologyTopicHit[],
  heading: string
): 'high' | 'medium' | 'low' {
  if (!selected) return 'low'
  if (/生物の特徴|遺伝子とその働き|神経系と内分泌系|体内環境|免疫|植生と遷移|生態系/.test(heading) && selected.count >= 1) {
    return selected.count >= 4 ? 'high' : 'medium'
  }
  const secondHit = topicHits.find((hit) => hit.topic_l1 !== selected.topic_l1)
  if (selected.count >= 7 && (!secondHit || selected.count >= secondHit.count * 1.25)) return 'high'
  if (selected.count >= 3) return 'medium'
  return 'low'
}

export function analyzeBiologyBlocks(text: string): BiologyBlockHit[] {
  const blocks = splitTextByBiologyBlocks(text)
  let previousAnswerEnd = 0

  return blocks.map((block, index) => {
    const topicHits = matchBiologyTopicL1(block.text)
    const selectedTopic = chooseTopic(block.heading, topicHits)
    const topicL2Hits = matchBiologyTopicL2(block.text, selectedTopic?.topic_l1)
    const formatTags = detectBiologyFormatTags(block.text)
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

export function aggregateBiologyFormatCounts(blockHits: BiologyBlockHit[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const hit of blockHits) {
    for (const format of hit.formatTags) {
      counts[format] = (counts[format] ?? 0) + 1
    }
  }
  return counts
}
