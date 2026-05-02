import type { AnalysisResult } from './tagMapper'
import type { VocabItem, CefrDistributionRow, GrammarVocabCrossCell, CefrLevel } from './vocabAnalyzer'
import { posLabelJa } from './vocabAnalyzer'

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

export type AggregatedVocabItem = {
  rank: number
  word: string
  pos: string
  posJa: string
  cefrLevel: CefrLevel
  count: number
  rate: number
}

export type AggregateSummary = {
  totalCount: number
  unitRanking: RankingRow[]
  recentRanking: RecentRankingRow[]
  formatRows: Array<{ format: string; count: number; rate: number }>
  trendRows: TrendRow[]
  grammarRows: RankingRow[]
  ruleSetCodes: string[]
  vocabRanking: AggregatedVocabItem[]
  cefrDistribution: CefrDistributionRow[]
  grammarVocabCross: GrammarVocabCrossCell[]
  totalContentWords: number
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

  /* --- Vocab aggregation across all results --- */
  const vocabMap = new Map<string, { pos: string; cefrLevel: CefrLevel; count: number }>()
  let totalContentWords = 0

  sorted.forEach((result) => {
    totalContentWords += result.totalContentWords ?? 0
    ;(result.vocabItems ?? []).forEach((item: VocabItem) => {
      const existing = vocabMap.get(item.word)
      if (existing) {
        existing.count += item.count
      } else {
        vocabMap.set(item.word, { pos: item.pos, cefrLevel: item.cefrLevel, count: item.count })
      }
    })
  })

  const vocabRanking: AggregatedVocabItem[] = Array.from(vocabMap.entries())
    .map(([word, data]) => ({
      rank: 0,
      word,
      pos: data.pos,
      posJa: posLabelJa[data.pos as keyof typeof posLabelJa] ?? data.pos,
      cefrLevel: data.cefrLevel,
      count: data.count,
      rate: totalContentWords > 0 ? round((data.count / totalContentWords) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)

  vocabRanking.forEach((item, index) => { item.rank = index + 1 })

  /* --- CEFR distribution aggregation --- */
  const cefrCounts: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, unknown: 0 }
  sorted.forEach((result) => {
    ;(result.cefrDistribution ?? []).forEach((row: CefrDistributionRow) => {
      cefrCounts[row.level] += row.count
    })
  })

  const cefrDistribution: CefrDistributionRow[] = (['A1', 'A2', 'B1', 'B2', 'unknown'] as CefrLevel[]).map((level) => ({
    level,
    count: cefrCounts[level],
    rate: totalContentWords > 0 ? round((cefrCounts[level] / totalContentWords) * 100) : 0
  }))

  /* --- Grammar x Vocab cross aggregation --- */
  const crossMap = new Map<string, number>()
  sorted.forEach((result) => {
    ;(result.grammarVocabCross ?? []).forEach((cell: GrammarVocabCrossCell) => {
      const key = `${cell.grammar}|${cell.cefrLevel}`
      crossMap.set(key, (crossMap.get(key) ?? 0) + cell.count)
    })
  })

  const grammarVocabCross: GrammarVocabCrossCell[] = Array.from(crossMap.entries())
    .map(([key, count]) => {
      const [grammar, cefrLevel] = key.split('|')
      return { grammar, cefrLevel: cefrLevel as CefrLevel, count }
    })
    .sort((a, b) => b.count - a.count)

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
    ruleSetCodes: Array.from(new Set(results.map((result) => result.ruleSet.code))),
    vocabRanking,
    cefrDistribution,
    grammarVocabCross,
    totalContentWords
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
