/**
 * 歴史過去問の集計・スコア計算
 * セクションA〜Gに必要なデータを生成する
 */

import type {
  EraHit,
  HistoryAnalysisResult,
  HistoryRuleSetCode,
  RegionHit,
  TopicHit
} from './historyTagMapper'

/* ── フィルタ型 ── */

export type HistoryFilters = {
  ruleSet: string       // 'all' | 'HIST_OLD' | 'HIST_NEW'
  sessionRange: string  // 'all' | 'recent4' | 'recent2' | 'older'
  topicL1: string       // 'all' | topic name
  eraTag: string        // 'all' | era name
  regionTag: string     // 'all' | region name
  formatTag: string     // 'all' | format name
}

export const initialHistoryFilters: HistoryFilters = {
  ruleSet: 'all',
  sessionRange: 'all',
  topicL1: 'all',
  eraTag: 'all',
  regionTag: 'all',
  formatTag: 'all'
}

/* ── ランキング行型 ── */

export type RankingRow = {
  unit: string
  count: number
  rate: number
}

export type RecentRankingRow = {
  unit: string
  score: number
  latestSession: string
}

export type TrendRow = {
  session: string
  unit: string
  count: number
  ruleSet: string
}

export type EraRow = {
  era: string
  count: number
  rate: number
}

export type RegionRow = {
  region: string
  count: number
  rate: number
}

export type FormatRow = {
  format: string
  count: number
  rate: number
}

/* ── 集計サマリー型 ── */

export type HistoryAggregateSummary = {
  totalCount: number
  // Section A: よく出るテーマランキング
  unitRanking: RankingRow[]
  // Section B: 近年頻出ランキング
  recentRanking: RecentRankingRow[]
  // Section C: 時代別出題分布
  eraRows: EraRow[]
  // Section D: 地域別出題分布
  regionRows: RegionRow[]
  // Section E: 出題形式分布
  formatRows: FormatRow[]
  // Section F: 年度推移
  trendRows: TrendRow[]
  // メタ情報
  ruleSetCodes: HistoryRuleSetCode[]
  availableTopicL1: string[]
  availableEras: string[]
  availableRegions: string[]
  availableFormats: string[]
}

/* ── 重み付き ── */

const SESSION_WEIGHTS = [1.0, 0.8, 0.6, 0.4]

/* ── フィルタ関数 ── */

export function filterHistoryResults(
  results: HistoryAnalysisResult[],
  filters: HistoryFilters
): HistoryAnalysisResult[] {
  let next = [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )

  // 制度区分フィルタ
  if (filters.ruleSet !== 'all') {
    next = next.filter((r) => r.ruleSet.code === filters.ruleSet)
  }

  // 試験回範囲フィルタ
  if (filters.sessionRange === 'recent4') next = next.slice(0, 4)
  if (filters.sessionRange === 'recent2') next = next.slice(0, 2)
  if (filters.sessionRange === 'older') next = next.slice(4)

  // topic_l1フィルタ
  if (filters.topicL1 !== 'all') {
    next = next.filter((r) =>
      r.topicHits.some((h) => h.topic_l1 === filters.topicL1)
    )
  }

  // era_tagフィルタ
  if (filters.eraTag !== 'all') {
    next = next.filter((r) =>
      r.eraHits.some((h) => h.era === filters.eraTag)
    )
  }

  // region_tagフィルタ
  if (filters.regionTag !== 'all') {
    next = next.filter((r) =>
      r.regionHits.some((h) => h.region === filters.regionTag)
    )
  }

  // format_tagフィルタ
  if (filters.formatTag !== 'all') {
    next = next.filter((r) =>
      r.formatTags.includes(filters.formatTag as any)
    )
  }

  return next
}

/* ── 集計関数 ── */

export function aggregateHistoryResults(
  results: HistoryAnalysisResult[]
): HistoryAggregateSummary {
  const sorted = [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )

  // topic_l1 の集計
  const topicCounts = new Map<string, number>()
  const recentScores = new Map<string, { score: number; latestSession: string }>()
  const trendRows: TrendRow[] = []

  sorted.forEach((result, resultIndex) => {
    const weight = SESSION_WEIGHTS[resultIndex] ?? 0.2

    for (const hit of result.topicHits) {
      // 通常カウント
      topicCounts.set(
        hit.topic_l1,
        (topicCounts.get(hit.topic_l1) ?? 0) + hit.count
      )

      // 重み付きスコア
      const current = recentScores.get(hit.topic_l1) ?? {
        score: 0,
        latestSession: result.examSession
      }
      recentScores.set(hit.topic_l1, {
        score: current.score + hit.count * weight,
        latestSession: current.latestSession || result.examSession
      })

      // 年度推移
      trendRows.push({
        session: result.examSession,
        unit: hit.topic_l1,
        count: hit.count,
        ruleSet: result.ruleSet.code
      })
    }
  })

  // era の集計
  const eraCounts = new Map<string, number>()
  for (const result of sorted) {
    for (const hit of result.eraHits) {
      eraCounts.set(hit.era, (eraCounts.get(hit.era) ?? 0) + hit.count)
    }
  }

  // region の集計
  const regionCounts = new Map<string, number>()
  for (const result of sorted) {
    for (const hit of result.regionHits) {
      regionCounts.set(hit.region, (regionCounts.get(hit.region) ?? 0) + hit.count)
    }
  }

  // format の集計
  const formatCounts = new Map<string, number>()
  for (const result of sorted) {
    for (const [format, count] of Object.entries(result.formatCounts)) {
      formatCounts.set(format, (formatCounts.get(format) ?? 0) + count)
    }
  }

  // 合計
  const totalTopic = Array.from(topicCounts.values()).reduce((s, c) => s + c, 0)
  const totalEra = Array.from(eraCounts.values()).reduce((s, c) => s + c, 0)
  const totalRegion = Array.from(regionCounts.values()).reduce((s, c) => s + c, 0)
  const totalFormat = Array.from(formatCounts.values()).reduce((s, c) => s + c, 0)

  // メタ情報収集
  const allTopicL1 = Array.from(new Set(sorted.flatMap((r) => r.topicHits.map((h) => h.topic_l1))))
  const allEras = Array.from(new Set(sorted.flatMap((r) => r.eraHits.map((h) => h.era))))
  const allRegions = Array.from(new Set(sorted.flatMap((r) => r.regionHits.map((h) => h.region))))
  const allFormats = Array.from(new Set(sorted.flatMap((r) => r.formatTags)))

  return {
    totalCount: results.length,
    unitRanking: toRanking(topicCounts, totalTopic),
    recentRanking: Array.from(recentScores.entries())
      .map(([unit, val]) => ({
        unit,
        score: round(val.score),
        latestSession: val.latestSession
      }))
      .sort((a, b) => b.score - a.score),
    eraRows: Array.from(eraCounts.entries())
      .map(([era, count]) => ({
        era,
        count,
        rate: totalEra ? round((count / totalEra) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count),
    regionRows: Array.from(regionCounts.entries())
      .map(([region, count]) => ({
        region,
        count,
        rate: totalRegion ? round((count / totalRegion) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count),
    formatRows: Array.from(formatCounts.entries())
      .map(([format, count]) => ({
        format,
        count,
        rate: totalFormat ? round((count / totalFormat) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count),
    trendRows,
    ruleSetCodes: Array.from(
      new Set(results.map((r) => r.ruleSet.code))
    ) as HistoryRuleSetCode[],
    availableTopicL1: allTopicL1,
    availableEras: allEras,
    availableRegions: allRegions,
    availableFormats: allFormats
  }
}

/* ── ユーティリティ ── */

function toRanking(map: Map<string, number>, total: number): RankingRow[] {
  return Array.from(map.entries())
    .map(([unit, count]) => ({
      unit,
      count,
      rate: total ? round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}
