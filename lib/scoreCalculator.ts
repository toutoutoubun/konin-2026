import type { AnalysisResult } from './tagMapper'

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

export type AggregateSummary = {
  totalCount: number
  unitRanking: RankingRow[]
  recentRanking: RecentRankingRow[]
  formatRows: Array<{ format: string; count: number; rate: number }>
  trendRows: TrendRow[]
  grammarRows: RankingRow[]
  ruleSetCodes: string[]
}

const weights = [1, 0.8, 0.6, 0.4]

export function aggregateResults(results: AnalysisResult[]): AggregateSummary {
  const sorted = [...results].sort((a, b) => (b.examYear ?? 0) - (a.examYear ?? 0) || b.examSession.localeCompare(a.examSession))
  const grammarCounts = new Map<string, number>()
  const formatCounts = new Map<string, number>()
  const recentScores = new Map<string, { score: number; latestSession: string }>()
  const trendRows: TrendRow[] = []

  sorted.forEach((result, resultIndex) => {
    const weight = weights[resultIndex] ?? 0.2
    result.grammarTags.forEach((tag) => {
      grammarCounts.set(tag.name, (grammarCounts.get(tag.name) ?? 0) + tag.count)
      const current = recentScores.get(tag.name) ?? { score: 0, latestSession: result.examSession }
      recentScores.set(tag.name, {
        score: current.score + tag.count * weight,
        latestSession: current.latestSession || result.examSession
      })
      trendRows.push({ session: result.examSession, unit: tag.name, count: tag.count, ruleSet: result.ruleSet.code })
    })
    Object.entries(result.formatCounts).forEach(([format, count]) => {
      formatCounts.set(format, (formatCounts.get(format) ?? 0) + count)
    })
  })

  const totalGrammar = Array.from(grammarCounts.values()).reduce((sum, count) => sum + count, 0)
  const totalFormat = Array.from(formatCounts.values()).reduce((sum, count) => sum + count, 0)

  return {
    totalCount: results.length,
    unitRanking: toRanking(grammarCounts, totalGrammar),
    grammarRows: toRanking(grammarCounts, totalGrammar),
    recentRanking: Array.from(recentScores.entries())
      .map(([unit, value]) => ({ unit, score: round(value.score), latestSession: value.latestSession }))
      .sort((a, b) => b.score - a.score),
    formatRows: Array.from(formatCounts.entries())
      .map(([format, count]) => ({ format, count, rate: totalFormat ? round((count / totalFormat) * 100) : 0 }))
      .sort((a, b) => b.count - a.count),
    trendRows,
    ruleSetCodes: Array.from(new Set(results.map((result) => result.ruleSet.code)))
  }
}

function toRanking(map: Map<string, number>, total: number): RankingRow[] {
  return Array.from(map.entries())
    .map(([unit, count]) => ({ unit, count, rate: total ? round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}
