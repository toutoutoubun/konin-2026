/**
 * 地学基礎過去問の集計・スコア計算
 */

import type {
  EarthScienceAnalysisResult,
  EarthScienceBlockHit
} from './earthScienceTagMapper'

export type EarthScienceFilters = {
  topic: string
  format: string
  sessionRange: string
}

export const initialEarthScienceFilters: EarthScienceFilters = {
  topic: 'all',
  format: 'all',
  sessionRange: 'all'
}

export type EarthScienceRankingRow = {
  topic: string
  count: number
  rate: number
}

export type EarthScienceRecentRow = {
  topic: string
  score: number
  latestSession: string
}

export type EarthScienceTrendRow = {
  session: string
  topic: string
  count: number
}

export type EarthScienceBlockRow = {
  session: string
  block: string
  heading: string
  topic: string
  smallQuestionCount: number
  answerRange: string
  confidence: EarthScienceBlockHit['confidence']
  formats: string
  matchedKeywords: string
}

export type EarthScienceFormatRow = {
  format: string
  count: number
  rate: number
}

export type EarthScienceAggregateSummary = {
  totalCount: number
  totalBlocks: number
  hasLowConfidence: boolean
  topicRanking: EarthScienceRankingRow[]
  recentRanking: EarthScienceRecentRow[]
  trendRows: EarthScienceTrendRow[]
  blockRows: EarthScienceBlockRow[]
  formatRows: EarthScienceFormatRow[]
  availableTopics: string[]
  availableFormats: string[]
  sessions: string[]
}

const SESSION_WEIGHTS = [1.0, 0.8, 0.6, 0.4]

function sortResults(results: EarthScienceAnalysisResult[]): EarthScienceAnalysisResult[] {
  return [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )
}

export function filterEarthScienceResults(
  results: EarthScienceAnalysisResult[],
  filters: EarthScienceFilters
): EarthScienceAnalysisResult[] {
  let next = sortResults(results)

  if (filters.topic !== 'all') {
    next = next.map((result) => ({
      ...result,
      blockHits: result.blockHits.filter((hit) => hit.topic_l1 === filters.topic)
    })).filter((result) => result.blockHits.length > 0)
  }

  if (filters.format !== 'all') {
    next = next.map((result) => ({
      ...result,
      blockHits: result.blockHits.filter((hit) => hit.formatTags.includes(filters.format))
    })).filter((result) => result.blockHits.length > 0)
  }

  if (filters.sessionRange === 'recent4') next = next.slice(0, 4)
  if (filters.sessionRange === 'recent2') next = next.slice(0, 2)
  if (filters.sessionRange === 'older') next = next.slice(4)

  return next
}

export function aggregateEarthScienceResults(
  results: EarthScienceAnalysisResult[]
): EarthScienceAggregateSummary {
  const sorted = sortResults(results)
  const topicCounts = new Map<string, number>()
  const recentScores = new Map<string, { score: number; latestSession: string }>()
  const formatCounts = new Map<string, number>()
  const trendRows: EarthScienceTrendRow[] = []
  const blockRows: EarthScienceBlockRow[] = []
  let hasLowConfidence = false

  sorted.forEach((result, resultIndex) => {
    const weight = SESSION_WEIGHTS[resultIndex] ?? 0.2

    for (const hit of result.blockHits) {
      if (hit.confidence === 'low') hasLowConfidence = true

      topicCounts.set(hit.topic_l1, (topicCounts.get(hit.topic_l1) ?? 0) + 1)

      const recent = recentScores.get(hit.topic_l1) ?? {
        score: 0,
        latestSession: result.examSession
      }
      recentScores.set(hit.topic_l1, {
        score: recent.score + weight,
        latestSession: recent.latestSession || result.examSession
      })

      trendRows.push({
        session: result.examSession,
        topic: hit.topic_l1,
        count: 1
      })

      for (const format of hit.formatTags) {
        formatCounts.set(format, (formatCounts.get(format) ?? 0) + 1)
      }

      blockRows.push({
        session: result.examSession,
        block: hit.block,
        heading: hit.heading,
        topic: hit.topic_l1,
        smallQuestionCount: hit.smallQuestionCount,
        answerRange: hit.answerRange ? `${hit.answerRange.start}〜${hit.answerRange.end}` : '未検出',
        confidence: hit.confidence,
        formats: hit.formatTags.join('、') || '未検出',
        matchedKeywords: hit.matchedKeywords.slice(0, 6).join('、') || '未検出'
      })
    }
  })

  const totalBlocks = Array.from(topicCounts.values()).reduce((sum, count) => sum + count, 0)

  const topicRanking = Array.from(topicCounts.entries())
    .map(([topic, count]) => ({
      topic,
      count,
      rate: totalBlocks ? round((count / totalBlocks) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)

  const recentRanking = Array.from(recentScores.entries())
    .map(([topic, data]) => ({
      topic,
      score: round(data.score),
      latestSession: data.latestSession
    }))
    .sort((a, b) => b.score - a.score)

  const totalFormatHits = Array.from(formatCounts.values()).reduce((sum, count) => sum + count, 0)
  const formatRows = Array.from(formatCounts.entries())
    .map(([format, count]) => ({
      format,
      count,
      rate: totalFormatHits ? round((count / totalFormatHits) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)

  const availableTopics = Array.from(new Set(
    sorted.flatMap((result) => result.blockHits.map((hit) => hit.topic_l1))
  ))
  const availableFormats = Array.from(new Set(
    sorted.flatMap((result) => result.blockHits.flatMap((hit) => hit.formatTags))
  ))
  const sessions = Array.from(new Set(sorted.map((result) => result.examSession)))

  return {
    totalCount: results.length,
    totalBlocks,
    hasLowConfidence,
    topicRanking,
    recentRanking,
    trendRows,
    blockRows,
    formatRows,
    availableTopics,
    availableFormats,
    sessions
  }
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}
