/**
 * 地学基礎過去問のタグマッピング
 * 大問見出しと本文キーワードを併用し、分野・小テーマ・出題形式を判定する。
 */

import earthScienceTags from '@/data/earthScienceTags.json'

export type EarthScienceRuleSet = {
  code: string
  label: string
}

export type EarthScienceTopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type EarthScienceTopicL2Hit = {
  topic_l2: string
  parent: string
  count: number
  matchedKeywords: string[]
}

export type EarthScienceBlockHit = {
  block: string
  blockIndex: number
  heading: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
  topic_l1: string
  topicHits: EarthScienceTopicHit[]
  topicL2Hits: EarthScienceTopicL2Hit[]
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'medium' | 'low'
  formatTags: string[]
}

export type EarthScienceAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: EarthScienceRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: EarthScienceBlockHit[]
  detectedBlocks: string[]
  questionCount: number
  formatCounts: Record<string, number>
  analyzedAt: string
}

type EarthScienceUnit = {
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

const ruleSetData = earthScienceTags.rule_sets[0]
const units = ruleSetData.units as EarthScienceUnit[]
const formatKeywords = (earthScienceTags as any).format_keywords as Record<string, string[]>

export const earthScienceRuleSet: EarthScienceRuleSet = {
  code: ruleSetData.code,
  label: ruleSetData.label
}

const l2Keywords: Record<string, { parent: string; keywords: string[] }> = {
  '地球の形と大きさ': { parent: '地球の概観', keywords: ['地球の形', '地球の大きさ', '地球の全周', '地球の円周', '赤道半径', '極半径'] },
  '緯度・経度': { parent: '地球の概観', keywords: ['緯度', '経度', '経線', '緯線', '子午線', '赤道'] },
  '地球楕円体': { parent: '地球の概観', keywords: ['回転楕円体', '地球楕円体', '偏平率', '北極', '南極'] },
  '地球の測定': { parent: '地球の概観', keywords: ['エラトステネス', '測量', 'スタジア', '地図'] },
  '太陽高度': { parent: '地球の概観', keywords: ['太陽高度', '夏至', '太陽の光', '影の角度'] },
  '地球内部の構造': { parent: '固体地球', keywords: ['地球内部', '内部構造', '地殻', 'マントル', '核', '内核', '外核', 'リソスフェア', 'アセノスフェア'] },
  'プレートテクトニクス': { parent: '固体地球', keywords: ['プレート', 'プレート境界', '海嶺', '海溝', '沈み込み', 'トラフ', '対流', 'GPS'] },
  '地震波': { parent: '固体地球', keywords: ['地震波', 'P波', 'S波', '震源', '震央'] },
  '火山活動': { parent: '固体地球', keywords: ['火山', '噴火', 'マグマ', '溶岩', '火山灰', '火砕流'] },
  '岩石と鉱物': { parent: '固体地球', keywords: ['岩石', '鉱物', '火成岩', '深成岩', '火山岩', '玄武岩', '花こう岩'] },
  '大気の構造': { parent: '大気と海洋', keywords: ['大気圏', '対流圏', '成層圏', '大気', '気温'] },
  '天気の変化': { parent: '大気と海洋', keywords: ['天気', '雲', '降水', '前線', '温暖前線', '寒冷前線', '台風', '梅雨'] },
  '気圧と風': { parent: '大気と海洋', keywords: ['高気圧', '低気圧', '等圧線', '風向', '風速', '偏西風', '季節風', '貿易風'] },
  '海流': { parent: '大気と海洋', keywords: ['海流', '暖流', '寒流', '黒潮', '親潮', '海洋の大循環', '深層循環', '表層循環'] },
  '日本の気象': { parent: '大気と海洋', keywords: ['日本', '季節風', '梅雨', '台風', '黄砂', 'フェーン現象'] },
  '気候変動': { parent: '大気と海洋', keywords: ['気候変動', 'エルニーニョ', 'ラニーニャ', '海面水温'] },
  '太陽系': { parent: '宇宙', keywords: ['太陽系', '惑星', '水星', '金星', '火星', '木星', '土星', '衛星', '小惑星', '彗星'] },
  '太陽の構造': { parent: '宇宙', keywords: ['太陽', '黒点', 'コロナ', 'プロミネンス', '光球'] },
  '惑星の特徴': { parent: '宇宙', keywords: ['地球型惑星', '木星型惑星', '惑星', '大気', '衛星'] },
  '恒星': { parent: '宇宙', keywords: ['恒星', '等級', '絶対等級', '見かけの等級', 'HR図', '主系列星', '赤色巨星', '白色矮星'] },
  '銀河': { parent: '宇宙', keywords: ['銀河', '天の川', '年周視差', '光年'] },
  '宇宙の誕生': { parent: '宇宙', keywords: ['宇宙の誕生', 'ビッグバン', '宇宙'] },
  '堆積岩': { parent: '地層・岩石・地史', keywords: ['堆積岩', '砂岩', '泥岩', '石灰岩', 'れき岩', '礫岩', '凝灰岩', '大理石'] },
  '地層の対比': { parent: '地層・岩石・地史', keywords: ['地層の対比', '鍵層', '火山灰層', '柱状図', '不整合'] },
  '化石': { parent: '地層・岩石・地史', keywords: ['化石', '示準化石', '示相化石', '三葉虫', 'フズリナ', 'アンモナイト', '恐竜', 'ナウマンゾウ'] },
  '地質年代': { parent: '地層・岩石・地史', keywords: ['地質年代', '古生代', '中生代', '新生代', '白亜紀', '大量絶滅'] },
  '地質構造': { parent: '地層・岩石・地史', keywords: ['断層', '褶曲', '背斜', '向斜', '走向', '傾斜'] },
  '地質図': { parent: '地層・岩石・地史', keywords: ['地質図', '露頭', '柱状図', '走向', '傾斜'] },
  '地震災害': { parent: '自然災害と防災', keywords: ['地震災害', '地震', '震度', 'マグニチュード', '活断層', '液状化'] },
  '火山災害': { parent: '自然災害と防災', keywords: ['火山災害', '噴火災害', '火砕流', '溶岩', '火山灰'] },
  '気象災害': { parent: '自然災害と防災', keywords: ['気象災害', '台風', '大雨', '洪水', '高潮', '土砂災害', '線状降水帯'] },
  '津波': { parent: '自然災害と防災', keywords: ['津波', '南海トラフ', '東北地方太平洋沖地震'] },
  'ハザードマップ': { parent: '自然災害と防災', keywords: ['ハザードマップ', '避難', '避難情報', '緊急地震速報'] },
  '防災・減災': { parent: '自然災害と防災', keywords: ['防災', '減災', '備え', '避難'] },
  '地球温暖化': { parent: '地球環境', keywords: ['地球温暖化', '温暖化', '二酸化炭素', '温室効果', '海面上昇'] },
  '水資源': { parent: '地球環境', keywords: ['水資源', '地下水', '降水量', '河川'] },
  '自然環境の変化': { parent: '地球環境', keywords: ['自然環境', '環境変動', '氷河', 'オゾン層'] },
  '人間活動': { parent: '地球環境', keywords: ['人間活動', '持続可能', '開発'] },
  '地球史と環境変動': { parent: '地球環境', keywords: ['地球史', '大気組成', '生物の進化', '環境変動'] }
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

export function detectEarthScienceExamYear(text: string, fileName = ''): number | null {
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

export function detectEarthScienceExamSession(text: string, fileName = ''): string {
  const target = normalizeText(`${fileName}\n${text}`)
  const year = detectEarthScienceExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function estimateEarthScienceQuestionCount(text: string): number {
  const normalized = normalizeText(text)
  const range = normalized.match(/解答番号\s*(?:は)?\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/)
  if (range) return Number(range[2]) - Number(range[1]) + 1

  const answerNumbers = Array.from(
    normalized.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  return answerNumbers.length ? Math.max(...answerNumbers) : 0
}

export function detectEarthScienceBlocks(text: string): string[] {
  return splitTextByEarthScienceBlocks(text).map((block) => block.label)
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

export function splitTextByEarthScienceBlocks(text: string): SplitBlock[] {
  const normalized = normalizeText(text)
  const positions: Array<{
    index: number
    heading: string
    smallQuestionCount: number
    answerRange: { start: number; end: number }
  }> = []
  const headingWords = '地球の形|地球の大きさ|地球の内部構造|プレート|地球内部|固体地球|地震波|地震|火山|火成岩|岩石|マントル|地殻|大気圧|大気大循環|水蒸気|エルニーニョ|海流|大気|海洋|天気|気象|前線|黄砂|夜空|ISS|太陽系|太陽|恒星|宇宙の構造|宇宙の進化|宇宙|惑星|小天体|天体|地層|化石|地質|断層|褶曲|オゾンホール|自然災害|防災|地球環境|環境|温暖化|水資源'
  const inquiryPattern = new RegExp(
    `((?:${headingWords})[^。]{0,100}?(?:について|に関して)[，,、。]?\\s*科学的に探究した[。.]?\\s*問\\s*([0-9]{1,2})(?:\\s*[〜～~\\-－]\\s*問\\s*([0-9]{1,2})|\\s*と\\s*問\\s*([0-9]{1,2}))\\s*に答えよ)`,
    'g'
  )
  const relationPattern = new RegExp(
    `((?:${headingWords})[^。]{0,100}?に関する\\s*問\\s*([0-9]{1,2})(?:\\s*[〜～~\\-－]\\s*問\\s*([0-9]{1,2})|\\s*と\\s*問\\s*([0-9]{1,2}))\\s*に答えよ)`,
    'g'
  )
  const sentencePattern =
    /(次の文は[^。]{0,160}。問\s*([0-9]{1,2})(?:\s*[〜～~\-－]\s*問\s*([0-9]{1,2})|\s*と\s*問\s*([0-9]{1,2}))\s*に答えよ)/g

  let match: RegExpExecArray | null
  for (const pattern of [inquiryPattern, relationPattern, sentencePattern]) {
    while ((match = pattern.exec(normalized)) !== null) {
      positions.push({
        index: match.index,
        heading: match[1],
        smallQuestionCount: questionSpanToCount(match),
        answerRange: questionSpanToRange(match)
      })
    }
  }
  positions.sort((a, b) => a.index - b.index)

  if (positions.length === 0) {
    const fallbackPatterns = [
      /(.{0,120}?(?:について|に関して)[，,、。]?\s*科学的に探究した[。.]?\s*問\s*([0-9]{1,2})(?:\s*[〜～~\-－]\s*問\s*([0-9]{1,2})|\s*と\s*問\s*([0-9]{1,2}))\s*に答えよ)/g,
      /(.{0,120}?に関する\s*問\s*([0-9]{1,2})(?:\s*[〜～~\-－]\s*問\s*([0-9]{1,2})|\s*と\s*問\s*([0-9]{1,2}))\s*に答えよ)/g
    ]
    for (const pattern of fallbackPatterns) {
      while ((match = pattern.exec(normalized)) !== null) {
        positions.push({
          index: match.index,
          heading: match[1],
          smallQuestionCount: questionSpanToCount(match),
          answerRange: questionSpanToRange(match)
        })
      }
    }
    positions.sort((a, b) => a.index - b.index)
  }

  if (positions.length === 0) {
    return [{
      label: '大問1',
      heading: '全文',
      text: normalized,
      smallQuestionCount: estimateEarthScienceQuestionCount(normalized),
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

export function matchEarthScienceTopicL1(text: string): EarthScienceTopicHit[] {
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

export function matchEarthScienceTopicL2(text: string, parent?: string): EarthScienceTopicL2Hit[] {
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

export function detectEarthScienceFormatTags(text: string): string[] {
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

function fallbackHit(topic_l1: string): EarthScienceTopicHit {
  return {
    topic_l1,
    count: 1,
    matchedKeywords: ['大問見出し']
  }
}

function topicFromHeading(
  heading: string,
  topicHits: EarthScienceTopicHit[]
): EarthScienceTopicHit | undefined {
  const candidates: Array<[RegExp, string]> = [
    [/自然災害|防災|災害|ハザード|液状化|避難/, '自然災害と防災'],
    [/地球環境|環境問題|温暖化|水資源|オゾン|海面上昇|オゾンホール/, '地球環境'],
    [/地球の形|地球の大きさ|回転楕円体|地球楕円体|偏平率|緯度|経線|子午線|エラトステネス/, '地球の概観'],
    [/海流|大気圧|大気大循環|水蒸気|エルニーニョ|大気|海洋|天気|気象|前線|黄砂|気圧|偏西風/, '大気と海洋'],
    [/夜空|ISS|太陽系|太陽|恒星|宇宙|惑星|小天体|天体|銀河/, '宇宙'],
    [/火成岩|深成岩|火山岩|鉱物/, '固体地球'],
    [/プレート|地球内部|地球の内部|内部構造|固体地球|地震波|マントル|地殻|核|火山/, '固体地球'],
    [/地層|化石|地質|断層|褶曲|岩石|石灰岩|アンモナイト|恐竜/, '地層・岩石・地史'],
    [/地震|震源|震央/, '固体地球']
  ]

  for (const [pattern, topic] of candidates) {
    if (pattern.test(heading)) {
      return topicHits.find((hit) => hit.topic_l1 === topic) ?? fallbackHit(topic)
    }
  }

  return undefined
}

function chooseTopic(
  heading: string,
  topicHits: EarthScienceTopicHit[]
): EarthScienceTopicHit | undefined {
  return topicFromHeading(heading, topicHits) ?? topicHits[0]
}

function getConfidence(
  selected: EarthScienceTopicHit | undefined,
  topicHits: EarthScienceTopicHit[],
  heading: string
): 'high' | 'medium' | 'low' {
  if (!selected) return 'low'
  if (/地球の形|地球の大きさ|プレート|地球内部|地球の内部|大気圧|海流|大気|海洋|太陽系|宇宙|地層|化石|自然災害|防災|黄砂|環境/.test(heading) && selected.count >= 1) {
    return selected.count >= 4 ? 'high' : 'medium'
  }
  const secondHit = topicHits.find((hit) => hit.topic_l1 !== selected.topic_l1)
  if (selected.count >= 7 && (!secondHit || selected.count >= secondHit.count * 1.25)) return 'high'
  if (selected.count >= 3) return 'medium'
  return 'low'
}

export function analyzeEarthScienceBlocks(text: string): EarthScienceBlockHit[] {
  const blocks = splitTextByEarthScienceBlocks(text)
  let previousAnswerEnd = 0

  return blocks.map((block, index) => {
    const topicHits = matchEarthScienceTopicL1(block.text)
    const selectedTopic = chooseTopic(block.heading, topicHits)
    const topicL2Hits = matchEarthScienceTopicL2(block.text, selectedTopic?.topic_l1)
    const formatTags = detectEarthScienceFormatTags(block.text)
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

export function aggregateEarthScienceFormatCounts(blockHits: EarthScienceBlockHit[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const hit of blockHits) {
    for (const format of hit.formatTags) {
      counts[format] = (counts[format] ?? 0) + 1
    }
  }
  return counts
}
