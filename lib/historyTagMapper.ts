/**
 * 歴史過去問のタグマッピング
 * kuromoji.jsで抽出した名詞をhistoryTags.jsonのキーワードと照合し
 * topic_l1・topic_l2・era_tag・region_tag・format_tagを付与する
 */

import historyTags from '@/data/historyTags.json'
import type { FormatTag } from './historyFormatDetector'
import { detectFormatTags } from './historyFormatDetector'

export type HistoryRuleSetCode = 'HIST_OLD' | 'HIST_NEW'

export type HistoryRuleSet = {
  code: HistoryRuleSetCode
  label: string
  subject_name: string
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

export type EraHit = {
  era: string
  count: number
}

export type RegionHit = {
  region: string
  count: number
}

export type HistoryAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: HistoryRuleSet
  rawText: string
  pageTexts: string[]
  topicHits: TopicHit[]
  topicL2Hits: TopicL2Hit[]
  eraHits: EraHit[]
  regionHits: RegionHit[]
  formatTags: FormatTag[]
  formatCounts: Record<string, number>
  detectedBlocks: string[]
  questionCount: number
  analyzedAt: string
}

/** rule_set を取得 */
export const historyRuleSets: HistoryRuleSet[] = historyTags.rule_sets.map((rs) => ({
  code: rs.code as HistoryRuleSetCode,
  label: rs.label,
  subject_name: rs.subject_name,
  period: rs.period,
  topic_l1: rs.topic_l1
}))

/** 年度から rule_set を自動判定 */
export function getHistoryRuleSet(year: number | null): HistoryRuleSet {
  if (year && year >= 2024) {
    return historyRuleSets.find((rs) => rs.code === 'HIST_NEW')!
  }
  return historyRuleSets.find((rs) => rs.code === 'HIST_OLD')!
}

/** 年度を検出 */
export function detectHistoryExamYear(text: string, fileName = ''): number | null {
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
export function detectHistoryExamSession(text: string, fileName = ''): string {
  const target = `${fileName}\n${text}`
  const year = detectHistoryExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

/** 大問番号を検出（HIST_OLD: 1〜7, HIST_NEW: 第1部〜第4部） */
export function detectHistoryBlocks(text: string, ruleSet: HistoryRuleSet): string[] {
  const blocks: string[] = []

  if (ruleSet.code === 'HIST_NEW') {
    const pattern = /第\s*([1-4])\s*部/g
    let match
    while ((match = pattern.exec(text)) !== null) {
      const label = `第${match[1]}部`
      if (!blocks.includes(label)) blocks.push(label)
    }
  } else {
    // HIST_OLD: 大問番号 1〜7 を検出
    const pattern = /(?:^|\s|　)([1-7１-７])\s*(?:　|\s)/g
    let match
    while ((match = pattern.exec(text)) !== null) {
      const num = match[1].replace(/[１-７]/g, (c) => String(c.charCodeAt(0) - 0xFF10))
      const label = `大問${num}`
      if (!blocks.includes(label)) blocks.push(label)
    }
    // フォールバック: もっと一般的なパターン
    if (blocks.length === 0) {
      const altPattern = /第?\s*([1-7１-７])\s*問/g
      let altMatch
      while ((altMatch = altPattern.exec(text)) !== null) {
        const num = altMatch[1].replace(/[１-７]/g, (c) => String(c.charCodeAt(0) - 0xFF10))
        const label = `大問${num}`
        if (!blocks.includes(label)) blocks.push(label)
      }
    }
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
export function estimateQuestionCount(text: string, ruleSet: HistoryRuleSet): number {
  // 解答番号のパターンから推定
  const answerNumbers = text.match(/解答番号\s*\d+/g)
  if (answerNumbers) return answerNumbers.length

  // フォールバック: rule_set の既定値
  if (ruleSet.code === 'HIST_NEW') return 26
  return 32
}

/** キーワードマッチでtopic_l1タグを付与 */
export function matchTopicL1(
  nouns: string[],
  fullText: string,
  ruleSet: HistoryRuleSet
): TopicHit[] {
  const keywordMap = historyTags.keyword_map.topic_l1 as Record<string, { keywords: string[]; era: string; regions: string[] }>
  const hits = new Map<string, { count: number; matchedKeywords: Set<string> }>()

  // ruleSet に含まれる topic_l1 だけを対象にする
  const validTopics = new Set(ruleSet.topic_l1)

  for (const [topic, config] of Object.entries(keywordMap)) {
    if (!validTopics.has(topic)) continue

    let matchCount = 0
    const matched = new Set<string>()

    for (const keyword of config.keywords) {
      // 名詞リストで照合
      const nounMatches = nouns.filter((n) => n.includes(keyword) || keyword.includes(n))
      if (nounMatches.length > 0) {
        matchCount += nounMatches.length
        matched.add(keyword)
      }
      // フルテキストでも照合（大問をまたぐケースに対応）
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
  const l2Map = historyTags.keyword_map.topic_l2 as Record<string, { parent: string; keywords: string[]; era: string; region: string }>
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

/** era_tag を集計 */
export function aggregateEraTags(topicHits: TopicHit[]): EraHit[] {
  const keywordMap = historyTags.keyword_map.topic_l1 as Record<string, { keywords: string[]; era: string; regions: string[] }>
  const eraMap = new Map<string, number>()

  for (const hit of topicHits) {
    const config = keywordMap[hit.topic_l1]
    if (config) {
      const era = config.era
      eraMap.set(era, (eraMap.get(era) ?? 0) + hit.count)
    }
  }

  return Array.from(eraMap.entries())
    .map(([era, count]) => ({ era, count }))
    .sort((a, b) => b.count - a.count)
}

/** region_tag を集計 */
export function aggregateRegionTags(topicHits: TopicHit[]): RegionHit[] {
  const keywordMap = historyTags.keyword_map.topic_l1 as Record<string, { keywords: string[]; era: string; regions: string[] }>
  const regionMap = new Map<string, number>()

  for (const hit of topicHits) {
    const config = keywordMap[hit.topic_l1]
    if (config?.regions) {
      for (const region of config.regions) {
        regionMap.set(region, (regionMap.get(region) ?? 0) + hit.count)
      }
    }
  }

  return Array.from(regionMap.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
}

/** format_tag を集計 */
export function aggregateFormatTags(text: string): { tags: FormatTag[]; counts: Record<string, number> } {
  const tags = detectFormatTags(text)
  const counts: Record<string, number> = {}
  for (const tag of tags) {
    counts[tag] = (counts[tag] ?? 0) + 1
  }
  return { tags, counts }
}
