/**
 * 地理過去問のタグマッピング
 * kuromoji.jsで抽出した名詞をgeographyTags.jsonのキーワードと照合し
 * topic_l1・topic_l2・region_tag・format_tagを付与する
 */

import geographyTags from '@/data/geographyTags.json'
import type { GeoFormatTag } from './geographyFormatDetector'
import { detectGeoFormatTags } from './geographyFormatDetector'

export type GeoRuleSetCode = 'GEO_OLD' | 'GEO_NEW'

export type GeoSubjectName = '地理A' | '地理B' | '地理'

export type GeoRuleSet = {
  code: GeoRuleSetCode
  label: string
  subjects: string[]
  period: string
  topic_l1: string[]
}

export type TopicHit = {
  topic_l1: string
  count: number
  matchedKeywords: string[]
}

export type TopicL2Hit = {
  topic_l2: string
  parent: string
  count: number
  matchedKeywords: string[]
}

export type RegionHit = {
  region: string
  count: number
}

export type GeoAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: GeoRuleSet
  detectedSubject: GeoSubjectName | null
  rawText: string
  pageTexts: string[]
  topicHits: TopicHit[]
  topicL2Hits: TopicL2Hit[]
  regionHits: RegionHit[]
  formatTags: GeoFormatTag[]
  formatCounts: Record<string, number>
  detectedBlocks: string[]
  questionCount: number
  analyzedAt: string
}

/* ── rule_set 定義 ── */

function getTopicL1ForRuleSet(rs: typeof geographyTags.rule_sets[number]): string[] {
  if (rs.code === 'GEO_NEW') {
    return (rs as any).topic_l1 as string[]
  }
  // GEO_OLD: 地理A・地理B 両方の topic_l1 を結合
  const topicA: string[] = (rs as any).topic_l1_A ?? []
  const topicB: string[] = (rs as any).topic_l1_B ?? []
  return Array.from(new Set([...topicA, ...topicB]))
}

export const geoRuleSets: GeoRuleSet[] = geographyTags.rule_sets.map((rs) => ({
  code: rs.code as GeoRuleSetCode,
  label: rs.label,
  subjects: rs.subjects,
  period: rs.period,
  topic_l1: getTopicL1ForRuleSet(rs)
}))

/** 年度から rule_set を自動判定 */
export function getGeoRuleSet(year: number | null): GeoRuleSet {
  if (year && year >= 2024) {
    return geoRuleSets.find((rs) => rs.code === 'GEO_NEW')!
  }
  return geoRuleSets.find((rs) => rs.code === 'GEO_OLD')!
}

/** 年度を検出 */
export function detectGeoExamYear(text: string, fileName = ''): number | null {
  const target = `${fileName}\n${text}`

  const western = target.match(/20(1[4-9]|2[0-9])\s*(?:年度|年)?/)
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

/** 試験回を検出 */
export function detectGeoExamSession(text: string, fileName = ''): string {
  const target = `${fileName}\n${text}`
  const year = detectGeoExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

/** 科目名を検出（GEO_OLD: 地理A・地理B 判定） */
export function detectGeoSubject(text: string, ruleSet: GeoRuleSet): GeoSubjectName | null {
  if (ruleSet.code === 'GEO_NEW') return '地理'

  // GEO_OLD: 地理Aと地理Bのどちらかを検出
  // PDFテキストから科目名パターンを検出
  const hasGeoA = /地理\s*[AＡ]/.test(text)
  const hasGeoB = /地理\s*[BＢ]/.test(text)

  // 地理A固有のキーワードによる推定
  const geoAKeywords = /生活文化の多様性|生活圏の地理的課題|地球的課題/
  const geoBKeywords = /現代世界の諸地域|自然環境・資源・産業|人口・都市/

  const aScore = (hasGeoA ? 3 : 0) + (geoAKeywords.test(text) ? 2 : 0)
  const bScore = (hasGeoB ? 3 : 0) + (geoBKeywords.test(text) ? 2 : 0)

  if (aScore > bScore) return '地理A'
  if (bScore > aScore) return '地理B'
  if (hasGeoA) return '地理A'
  if (hasGeoB) return '地理B'

  return null
}

/** 大問番号を検出 */
export function detectGeoBlocks(text: string, _ruleSet: GeoRuleSet): string[] {
  const blocks: string[] = []
  const pattern = /第\s*([1-5１-５])\s*問/g
  let match
  while ((match = pattern.exec(text)) !== null) {
    const num = match[1].replace(/[１-５]/g, (c) => String(c.charCodeAt(0) - 0xFF10))
    const label = `第${num}問`
    if (!blocks.includes(label)) blocks.push(label)
  }
  return blocks.sort()
}

/** 解答番号範囲を検出 */
export function detectAnswerRange(text: string): { start: number; end: number } | null {
  const match = text.match(/解答番号は\s*(\d+)\s*[〜～~ー]\s*(\d+)/)
  if (match) {
    return { start: Number(match[1]), end: Number(match[2]) }
  }
  return null
}

/** 問題数を推定 */
export function estimateQuestionCount(text: string, ruleSet: GeoRuleSet): number {
  const answerNumbers = text.match(/解答番号\s*\d+/g)
  if (answerNumbers) return answerNumbers.length

  // 選択肢番号 問1〜問20 のパターン
  const questionNums = text.match(/問\s*\d+/g)
  if (questionNums) {
    const nums = questionNums.map((q) => Number(q.replace(/問\s*/, '')))
    return Math.max(...nums)
  }

  return ruleSet.code === 'GEO_NEW' ? 20 : 20
}

/** キーワードマッチでtopic_l1タグを付与 */
export function matchTopicL1(
  nouns: string[],
  fullText: string,
  ruleSet: GeoRuleSet
): TopicHit[] {
  const keywordMap = geographyTags.keyword_map.topic_l1 as Record<string, { keywords: string[]; regions: string[] }>
  const hits = new Map<string, { count: number; matchedKeywords: Set<string> }>()

  const validTopics = new Set(ruleSet.topic_l1)

  for (const [topic, config] of Object.entries(keywordMap)) {
    if (!validTopics.has(topic)) continue

    let matchCount = 0
    const matched = new Set<string>()

    for (const keyword of config.keywords) {
      const nounMatches = nouns.filter((n) => n.includes(keyword) || keyword.includes(n))
      if (nounMatches.length > 0) {
        matchCount += nounMatches.length
        matched.add(keyword)
      }
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const textMatches = fullText.match(regex)
      if (textMatches) {
        matchCount += textMatches.length
        matched.add(keyword)
      }
    }

    if (matchCount > 0) {
      hits.set(topic, {
        count: matchCount,
        matchedKeywords: matched
      })
    }
  }

  return Array.from(hits.entries())
    .map(([topic, data]) => ({
      topic_l1: topic,
      count: data.count,
      matchedKeywords: Array.from(data.matchedKeywords)
    }))
    .sort((a, b) => b.count - a.count)
}

/** キーワードマッチでtopic_l2タグを付与 */
export function matchTopicL2(
  nouns: string[],
  fullText: string
): TopicL2Hit[] {
  const l2Map = geographyTags.keyword_map.topic_l2 as Record<string, { parent: string; keywords: string[]; regions: string[] }>
  const hits = new Map<string, { parent: string; count: number; matchedKeywords: Set<string> }>()

  for (const [topic, config] of Object.entries(l2Map)) {
    let matchCount = 0
    const matched = new Set<string>()

    for (const keyword of config.keywords) {
      const nounMatches = nouns.filter((n) => n.includes(keyword) || keyword.includes(n))
      if (nounMatches.length > 0) {
        matchCount += nounMatches.length
        matched.add(keyword)
      }
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const textMatches = fullText.match(regex)
      if (textMatches) {
        matchCount += textMatches.length
        matched.add(keyword)
      }
    }

    if (matchCount > 0) {
      hits.set(topic, {
        parent: config.parent,
        count: matchCount,
        matchedKeywords: matched
      })
    }
  }

  return Array.from(hits.entries())
    .map(([topic, data]) => ({
      topic_l2: topic,
      parent: data.parent,
      count: data.count,
      matchedKeywords: Array.from(data.matchedKeywords)
    }))
    .sort((a, b) => b.count - a.count)
}

/** region_tag を集計（地理専用：キーワードベース） */
export function aggregateRegionTags(nouns: string[], fullText: string): RegionHit[] {
  const regionKeywords = geographyTags.keyword_map.region_keywords as Record<string, string[]>
  const regionMap = new Map<string, number>()

  for (const [region, keywords] of Object.entries(regionKeywords)) {
    let count = 0
    for (const keyword of keywords) {
      const nounMatches = nouns.filter((n) => n.includes(keyword) || keyword.includes(n))
      count += nounMatches.length

      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const textMatches = fullText.match(regex)
      if (textMatches) count += textMatches.length
    }
    if (count > 0) {
      regionMap.set(region, count)
    }
  }

  return Array.from(regionMap.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
}

/** format_tag を集計 */
export function aggregateFormatTags(text: string): { tags: GeoFormatTag[]; counts: Record<string, number> } {
  const tags = detectGeoFormatTags(text)
  const counts: Record<string, number> = {}
  for (const tag of tags) {
    counts[tag] = (counts[tag] ?? 0) + 1
  }
  return { tags, counts }
}
