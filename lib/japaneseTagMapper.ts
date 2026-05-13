/**
 * 国語過去問のタグマッピング
 * 「問1〜問Nに答えよ」を大問境界として分割し、本文キーワードから分野と形式を判定する。
 */

import japaneseTags from '@/data/japaneseTags.json'

export type JapaneseRuleSet = {
  code: string
  label: string
}

export type JapaneseTopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type JapaneseTopicL2Hit = {
  topic_l2: string
  parent: string
  count: number
  matchedKeywords: string[]
}

export type JapaneseBlockHit = {
  block: string
  blockIndex: number
  heading: string
  smallQuestionCount: number
  answerRange: { start: number; end: number } | null
  topic_l1: string
  topicHits: JapaneseTopicHit[]
  topicL2Hits: JapaneseTopicL2Hit[]
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'medium' | 'low'
  formatTags: string[]
}

export type JapaneseAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: JapaneseRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: JapaneseBlockHit[]
  detectedBlocks: string[]
  questionCount: number
  formatCounts: Record<string, number>
  analyzedAt: string
}

type JapaneseUnit = {
  block: string
  topic_l1: string
  topic_l2: string[]
  keywords: string[]
}

const ruleSetData = japaneseTags.rule_sets[0]
const units = ruleSetData.units as JapaneseUnit[]
const formatTags = japaneseTags.format_tags as string[]

export const japaneseRuleSet: JapaneseRuleSet = {
  code: ruleSetData.code,
  label: ruleSetData.label
}

const l2Keywords: Record<string, { parent: string; keywords: string[] }> = {
  '漢字の読み': { parent: '言語知識', keywords: ['漢字の正しい読み', '正しい読み', '読みを', '解答番号は 1', 'ア、イの傍線部の漢字'] },
  '同音異義語': { parent: '言語知識', keywords: ['同じ漢字', '同音', '当たる漢字', 'カタカナ', '用いるもの'] },
  '語句の意味': { parent: '言語知識', keywords: ['意味として', '同じ意味', '語として', '言葉として', '傍線部の意味'] },
  '熟語の構成': { parent: '言語知識', keywords: ['熟語の構成', '同じ構成', '成り立っている熟語'] },
  '慣用句': { parent: '言語知識', keywords: ['慣用句', '空欄に入る言葉', 'という意味になる'] },
  '敬語': { parent: '言語知識', keywords: ['敬語', '尊敬語', '謙譲語', '丁寧語'] },
  '手紙・時候の挨拶': { parent: '言語知識', keywords: ['手紙', '時候', '挨拶', '新暦', '暑中', '残暑'] },
  '話合い': { parent: '実用的な文章・話合い', keywords: ['話合い', '話し合い', '発言', '意見', '提案'] },
  '発表原稿': { parent: '実用的な文章・話合い', keywords: ['発表原稿', '発表', 'スライド', '原稿'] },
  '企画書': { parent: '実用的な文章・話合い', keywords: ['企画書', '事業企画書', '企画案'] },
  '依頼文': { parent: '実用的な文章・話合い', keywords: ['依頼文', 'お願い', '各位', 'ご協力'] },
  '資料比較': { parent: '実用的な文章・話合い', keywords: ['資料 1', '資料Ⅰ', '資料Ⅱ', '比較', 'グラフ', '表'] },
  'ワークシート': { parent: '実用的な文章・話合い', keywords: ['ワークシート', '記入', 'まとめた'] },
  '校内新聞': { parent: '実用的な文章・話合い', keywords: ['校内新聞', '新聞部', '記事'] },
  '要旨把握': { parent: '現代文（評論・説明）', keywords: ['要旨', '筆者の考え', '筆者の主張', '主張'] },
  '筆者の主張': { parent: '現代文（評論・説明）', keywords: ['筆者', '述べている', '論じている', '考えている'] },
  '論理展開': { parent: '現代文（評論・説明）', keywords: ['論理', '因果', '対比', '具体例', '抽象'] },
  '段落構成': { parent: '現代文（評論・説明）', keywords: ['段落', '構成', '順序', '展開'] },
  '心情把握': { parent: '現代文（文学的文章）', keywords: ['心情', '気持ち', '思い', '感情'] },
  '場面展開': { parent: '現代文（文学的文章）', keywords: ['場面', '展開', '回想', '時間軸'] },
  '人物描写': { parent: '現代文（文学的文章）', keywords: ['登場人物', '人物', '描写', '会話文'] },
  '表現技法': { parent: '現代文（文学的文章）', keywords: ['表現技法', '比喩', '象徴', '効果', '表現している'] },
  '随筆': { parent: '現代文（文学的文章）', keywords: ['随筆', '筆者が体験', '体験した出来事'] },
  '古文読解': { parent: '古典・言語文化', keywords: ['古文', '現代語訳', '助動詞', '助詞', '古語'] },
  '和歌': { parent: '古典・言語文化', keywords: ['和歌', '万葉集', '歌', '梅の花', '短歌'] },
  '古典と現代文の読み比べ': { parent: '古典・言語文化', keywords: ['文章Ⅰ', '文章Ⅱ', '読み比べ', '資料Ⅰ', '資料Ⅱ', '現代の小説'] },
  '言語文化': { parent: '古典・言語文化', keywords: ['言語文化', '能楽', '謡曲', '平家物語', '海道記', '栄花物語'] },
  '漢文読解': { parent: '漢文', keywords: ['漢文', '唐', '太宗', '孔子', '孟子', '論語', '故事成語'] },
  '返り点・書き下し': { parent: '漢文', keywords: ['返り点', '書き下し', 'レ点', '一二点', '訓読'] },
  '句法': { parent: '漢文', keywords: ['句法', '否定', '使役', '受身', '反語'] },
  '内容読解': { parent: '漢文', keywords: ['内容として', '理由として', '説明として', '適当なもの'] },
  '漢詩': { parent: '漢文', keywords: ['漢詩', '詩', '絶句', '律詩'] }
}

const formatKeywordMap: Record<string, string[]> = {
  '内容一致': ['内容として', '説明として', '適当なもの', '合致する', '述べているもの', '理由として'],
  '空欄補充': ['空欄', '補う', '入るもの', '〔', 'ａ', 'ｂ'],
  '語句の意味': ['意味として', '同じ意味', '言葉として', '語として', '傍線部'],
  '文法判定': ['文法', '助動詞', '助詞', '敬語', '熟語の構成', '同じ構成'],
  '書き下し文選択': ['書き下し', '訓読', '返り点'],
  '現代語訳選択': ['現代語訳', '訳として'],
  '表現技法判定': ['表現技法', '表現している', '比喩', '効果', '描写'],
  '段落構成把握': ['段落', '構成', '順序', '並べ替え', 'まとめ'],
  '資料読解': ['資料', 'グラフ', '表', 'ワークシート', '企画書', 'レポート'],
  '話合い読解': ['話合い', '発言', '意見', '提案', '発表原稿']
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

function getHit(topicHits: JapaneseTopicHit[], topic: string): JapaneseTopicHit | null {
  return topicHits.find((hit) => hit.topic_l1 === topic) ?? null
}

function countAny(text: string, keywords: string[]): number {
  return keywords.reduce((sum, keyword) => sum + countKeyword(text, keyword), 0)
}

function strongestHit(topicHits: JapaneseTopicHit[]): JapaneseTopicHit | null {
  return topicHits[0] ?? null
}

export function detectJapaneseExamYear(text: string, fileName = ''): number | null {
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

export function detectJapaneseExamSession(text: string, fileName = ''): string {
  const target = normalizeText(`${fileName}\n${text}`)
  const year = detectJapaneseExamYear(text, fileName)
  const sessionMatch = target.match(/第\s*([12])\s*回/)
  const session = sessionMatch?.[1]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

export function estimateJapaneseQuestionCount(text: string): number {
  const normalized = normalizeText(text)
  const ranges = Array.from(normalized.matchAll(/解答番号\s*(?:は)?\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/g))
  if (ranges.length > 0) {
    return Math.max(...ranges.map((match) => Number(match[2])))
  }

  const answerNumbers = Array.from(
    normalized.matchAll(/解答番号(?:は)?\s*([0-9]\s*[0-9]?)/g)
  ).map((match) => Number(match[1].replace(/\s+/g, '')))

  return answerNumbers.length ? Math.max(...answerNumbers) : 0
}

export function detectJapaneseBlocks(text: string): string[] {
  return splitTextByJapaneseBlocks(text).map((block) => block.label)
}

export function splitTextByJapaneseBlocks(text: string): Array<{
  label: string
  heading: string
  text: string
  smallQuestionCount: number
}> {
  const normalized = normalizeText(text)
  const positions: Array<{ index: number; start: number; heading: string; smallQuestionCount: number }> = []
  const pattern = /問\s*1\s*[〜～~\-－]\s*問\s*([0-9]{1,2})\s*に答えよ/g

  let match: RegExpExecArray | null
  while ((match = pattern.exec(normalized)) !== null) {
    const lineStart = Math.max(
      normalized.lastIndexOf('。', match.index - 1),
      normalized.lastIndexOf('国語 ', match.index - 1),
      normalized.lastIndexOf('／', match.index - 1)
    )
    positions.push({
      index: match.index,
      start: lineStart > 0 ? Math.max(0, lineStart - 80) : Math.max(0, match.index - 220),
      heading: match[0],
      smallQuestionCount: Number(match[1])
    })
  }

  const deduped = positions.filter((position, index) => {
    const previous = positions[index - 1]
    return !previous || Math.abs(position.index - previous.index) > 120
  })

  if (deduped.length === 0) {
    return [{
      label: '大問1',
      heading: '全文',
      text: normalized,
      smallQuestionCount: estimateJapaneseQuestionCount(normalized)
    }]
  }

  return deduped.map((position, index) => {
    const end = deduped[index + 1]?.start ?? normalized.length
    return {
      label: `大問${index + 1}`,
      heading: position.heading,
      text: normalized.slice(position.start, end),
      smallQuestionCount: position.smallQuestionCount
    }
  })
}

export function matchJapaneseTopicL1(text: string): JapaneseTopicHit[] {
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

export function matchJapaneseTopicL2(text: string, parent?: string): JapaneseTopicL2Hit[] {
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

function detectFormatTags(text: string): string[] {
  return formatTags.filter((tag) => {
    const keywords = formatKeywordMap[tag] ?? [tag]
    return keywords.some((keyword) => text.includes(keyword))
  })
}

function choosePrimaryTopic(blockText: string, topicHits: JapaneseTopicHit[]): JapaneseTopicHit {
  const topHit = strongestHit(topicHits)
  const kanbunHit = getHit(topicHits, '漢文')
  const classicHit = getHit(topicHits, '古典・言語文化')

  const strongKanbunEvidence = countAny(blockText, [
    '漢文',
    '書き下し',
    '返り点',
    'レ点',
    '一二点',
    '訓読',
    '句法',
    '漢詩',
    '唐',
    '太宗',
    '孔子',
    '孟子',
    '論語',
    '故事成語'
  ])
  const weakKanbunEvidence = countAny(blockText, ['於', '乎', '焉'])

  if (
    kanbunHit &&
    (
      strongKanbunEvidence >= 2 ||
      /漢文|漢詩|返り点|書き下し/.test(blockText) ||
      (strongKanbunEvidence >= 1 && weakKanbunEvidence >= 2)
    )
  ) {
    return kanbunHit
  }

  if (!kanbunHit && (strongKanbunEvidence >= 2 || /漢文|漢詩|返り点|書き下し/.test(blockText))) {
    return {
      topic_l1: '漢文',
      count: strongKanbunEvidence,
      matchedKeywords: ['漢文']
    }
  }

  const classicEvidence = countAny(blockText, [
    '言語文化',
    '古文',
    '古典',
    '和歌',
    '万葉集',
    '平家物語',
    '海道記',
    '栄花物語',
    '現代語訳',
    '古語',
    '助動詞'
  ])
  if (
    classicHit &&
    (
      classicHit === topHit ||
      classicHit.count >= Math.max(6, (topHit?.count ?? 0) * 0.7) ||
      classicEvidence >= 4
    )
  ) {
    return classicHit
  }

  if (!classicHit && classicEvidence >= 3) {
    return {
      topic_l1: '古典・言語文化',
      count: classicEvidence,
      matchedKeywords: ['古典']
    }
  }

  if (topHit && topHit.count >= 2) {
    return topHit
  }

  if (/話合い|発表原稿|企画書|依頼文|ワークシート|校内新聞|生徒会|実行委員会/.test(blockText)) {
    return getHit(topicHits, '実用的な文章・話合い') ?? {
      topic_l1: '実用的な文章・話合い',
      count: 1,
      matchedKeywords: ['話合い']
    }
  }

  if (/漢字|熟語|慣用句|敬語|時候|手紙|同じ漢字/.test(blockText) && blockText.length < 5000) {
    return getHit(topicHits, '言語知識') ?? {
      topic_l1: '言語知識',
      count: 1,
      matchedKeywords: ['漢字']
    }
  }

  if (/小説|随筆|心情|登場人物|場面|描写|僕|私/.test(blockText)) {
    return getHit(topicHits, '現代文（文学的文章）') ?? {
      topic_l1: '現代文（文学的文章）',
      count: 1,
      matchedKeywords: ['小説']
    }
  }

  return topHit ?? {
    topic_l1: '判定保留',
    count: 0,
    matchedKeywords: []
  }
}

function estimateAnswerRange(text: string, fallbackStart: number): { start: number; end: number } | null {
  const normalized = normalizeText(text)
  const values = new Set<number>()

  for (const match of normalized.matchAll(/解答番号\s*は\s*([0-9]{1,2})(?:\s*[・･,、]\s*([0-9]{1,2}))*/g)) {
    const chunk = match[0]
    for (const num of chunk.matchAll(/[0-9]{1,2}/g)) {
      values.add(Number(num[0]))
    }
  }

  for (const match of normalized.matchAll(/解答番号\s*は\s*([0-9]{1,2})\s*[〜～~\-－]\s*([0-9]{1,2})/g)) {
    values.add(Number(match[1]))
    values.add(Number(match[2]))
  }

  if (values.size === 0) {
    return { start: fallbackStart, end: fallbackStart }
  }

  const sorted = Array.from(values).filter((value) => value > 0 && value < 80).sort((a, b) => a - b)
  if (sorted.length === 0) return null
  return { start: sorted[0], end: sorted[sorted.length - 1] }
}

export function analyzeJapaneseBlocks(text: string): JapaneseBlockHit[] {
  const blocks = splitTextByJapaneseBlocks(text)
  let nextAnswerStart = 1

  return blocks.map((block, index) => {
    const blockText = normalizeText(block.text)
    const topicHits = matchJapaneseTopicL1(blockText)
    const primary = choosePrimaryTopic(blockText, topicHits)
    const topicL2Hits = matchJapaneseTopicL2(blockText, primary.topic_l1)
    const matchedKeywords = Array.from(new Set([
      ...primary.matchedKeywords,
      ...topicL2Hits.flatMap((hit) => hit.matchedKeywords)
    ]))
    const answerRange = estimateAnswerRange(blockText, nextAnswerStart)
    if (answerRange) nextAnswerStart = Math.max(nextAnswerStart, answerRange.end + 1)

    const keywordCount = primary.count + topicL2Hits.reduce((sum, hit) => sum + hit.count, 0)
    const confidence: JapaneseBlockHit['confidence'] =
      primary.topic_l1 === '判定保留' ? 'low' : keywordCount >= 5 ? 'high' : 'medium'

    return {
      block: block.label,
      blockIndex: index + 1,
      heading: block.heading,
      smallQuestionCount: block.smallQuestionCount,
      answerRange,
      topic_l1: primary.topic_l1,
      topicHits,
      topicL2Hits,
      matchedKeywords,
      keywordCount,
      confidence,
      formatTags: detectFormatTags(blockText)
    }
  })
}

export function aggregateJapaneseFormatCounts(blockHits: JapaneseBlockHit[]): Record<string, number> {
  return blockHits.reduce<Record<string, number>>((acc, hit) => {
    for (const tag of hit.formatTags) {
      acc[tag] = (acc[tag] ?? 0) + 1
    }
    return acc
  }, {})
}
