/**
 * mathScoreCalculator.ts — v2.0
 *
 * 数学頻出分析の集計・ランキング・年度推移・重み付きスコアを計算する。
 *
 * Sections:
 *   A. よく出る単元ランキング (topic_l1 単位)
 *   B. 近年重み付きランキング (latest 1.0, prev 0.8, 2-ago 0.6, 3-ago 0.4, earlier 0.2)
 *   C. 大問別分布
 *   D. 年度推移
 *   F. 解析対象外カウント
 */

import type { MathAnalysisResult, DetectedBlock } from './mathTagMapper'

// ── 型定義 ─────────────────────────────────────

export type MathRankingRow = {
  unit: string
  count: number
  rate: number
}

export type MathRecentRankingRow = {
  unit: string
  score: number
  latestSession: string
}

export type MathBlockDistRow = {
  block: string
  topic_l1: string
  count: number
  rate: number
}

export type MathTrendRow = {
  session: string
  unit: string
  count: number
}

export type MathAggregateSummary = {
  totalFiles: number

  /** A. topic_l1 単位の頻出ランキング */
  unitRanking: MathRankingRow[]

  /** B. 近年重み付きランキング */
  recentRanking: MathRecentRankingRow[]

  /** C. 大問別分布 */
  blockDistribution: MathBlockDistRow[]

  /** D. 年度推移 (session × topic_l1) */
  trendRows: MathTrendRow[]

  /** セッション一覧（ソート済み） */
  sessions: string[]

  /** F. 解析対象外カウント */
  totalCidHeavyPages: number
  totalBlankPages: number
  totalAnswerPages: number

  /** フィルタ用一覧 */
  availableL1: string[]
  availableL2: string[]
  availableBlocks: string[]
}

// ── 重み定義 ─────────────────────────────────────

const SESSION_WEIGHTS = [1.0, 0.8, 0.6, 0.4] as const
const DEFAULT_WEIGHT = 0.2

// ── メイン集計 ─────────────────────────────────────

export function aggregateMathResults(results: MathAnalysisResult[]): MathAggregateSummary {
  if (results.length === 0) return emptyAggregate()

  // 年度ソート（新しい順）
  const sorted = [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )

  const l1Counts = new Map<string, number>()
  const blockCounts = new Map<string, { topic_l1: string; count: number }>()
  const recentScores = new Map<string, { score: number; latestSession: string }>()
  const trendMap = new Map<string, Map<string, number>>()
  const allL2 = new Set<string>()

  let totalCidHeavyPages = 0
  let totalBlankPages = 0
  let totalAnswerPages = 0

  sorted.forEach((result, resultIndex) => {
    const weight =
      resultIndex < SESSION_WEIGHTS.length
        ? SESSION_WEIGHTS[resultIndex]
        : DEFAULT_WEIGHT

    totalCidHeavyPages += result.cidHeavyPages
    totalBlankPages += result.blankPages
    totalAnswerPages += result.answerPages ?? 0

    const sessionKey = result.examSession

    if (!trendMap.has(sessionKey)) trendMap.set(sessionKey, new Map())
    const sessionMap = trendMap.get(sessionKey)!

    for (const block of result.detectedBlocks) {
      // topic_l1 カウント
      l1Counts.set(block.topic_l1, (l1Counts.get(block.topic_l1) ?? 0) + 1)

      // 大問別カウント
      const bKey = block.blockLabel
      const existing = blockCounts.get(bKey) ?? { topic_l1: block.topic_l1, count: 0 }
      existing.count += 1
      blockCounts.set(bKey, existing)

      // 年度推移
      sessionMap.set(block.topic_l1, (sessionMap.get(block.topic_l1) ?? 0) + 1)

      // 近年重み付きスコア
      const current = recentScores.get(block.topic_l1) ?? {
        score: 0,
        latestSession: sessionKey
      }
      recentScores.set(block.topic_l1, {
        score: current.score + weight,
        latestSession: current.latestSession || sessionKey
      })

      // L2 収集
      for (const l2 of block.matchedL2) {
        allL2.add(l2)
      }
    }
  })

  // ── 出力生成 ─────────────────────────────────────

  const totalL1 = Array.from(l1Counts.values()).reduce((s, c) => s + c, 0) || 1
  const totalBlocks = Array.from(blockCounts.values()).reduce((s, b) => s + b.count, 0) || 1

  const unitRanking = toRanking(l1Counts, totalL1)

  const recentRanking: MathRecentRankingRow[] = Array.from(recentScores.entries())
    .map(([unit, val]) => ({
      unit,
      score: round(val.score),
      latestSession: val.latestSession
    }))
    .sort((a, b) => b.score - a.score)

  const blockDistribution: MathBlockDistRow[] = Array.from(blockCounts.entries())
    .map(([block, val]) => ({
      block,
      topic_l1: val.topic_l1,
      count: val.count,
      rate: round((val.count / totalBlocks) * 100)
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.block.replace(/[^0-9]/g, ''), 10)
      const bNum = parseInt(b.block.replace(/[^0-9]/g, ''), 10)
      return aNum - bNum
    })

  const sessions = Array.from(trendMap.keys()).sort()
  const trendRows: MathTrendRow[] = []
  for (const session of sessions) {
    const sessionMap = trendMap.get(session)!
    for (const [unit, count] of sessionMap) {
      trendRows.push({ session, unit, count })
    }
  }

  return {
    totalFiles: results.length,
    unitRanking,
    recentRanking,
    blockDistribution,
    trendRows,
    sessions,
    totalCidHeavyPages,
    totalBlankPages,
    totalAnswerPages,
    availableL1: Array.from(l1Counts.keys()).sort(),
    availableL2: Array.from(allL2).sort(),
    availableBlocks: Array.from(blockCounts.keys()).sort((a, b) => {
      const aNum = parseInt(a.replace(/[^0-9]/g, ''), 10)
      const bNum = parseInt(b.replace(/[^0-9]/g, ''), 10)
      return aNum - bNum
    })
  }
}

// ── フィルタ ─────────────────────────────────────

export type MathFilters = {
  sessionRange: string
  block: string
  topicL1: string
  topicL2: string
}

export const initialMathFilters: MathFilters = {
  sessionRange: 'all',
  block: 'all',
  topicL1: 'all',
  topicL2: 'all'
}

/**
 * フィルタに基づいて結果を絞り込む
 */
export function filterMathResults(
  results: MathAnalysisResult[],
  filters: MathFilters
): MathAnalysisResult[] {
  let filtered = [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )

  // 試験回範囲
  if (filters.sessionRange === 'recent4') filtered = filtered.slice(0, 4)
  else if (filters.sessionRange === 'recent2') filtered = filtered.slice(0, 2)
  else if (filters.sessionRange === 'older') filtered = filtered.slice(4)

  // ブロックフィルタ
  if (filters.block !== 'all') {
    filtered = filtered
      .map((r) => ({
        ...r,
        detectedBlocks: r.detectedBlocks.filter(
          (b) => b.blockLabel === filters.block
        )
      }))
      .filter((r) => r.detectedBlocks.length > 0)
  }

  // topic_l1 フィルタ
  if (filters.topicL1 !== 'all') {
    filtered = filtered
      .map((r) => ({
        ...r,
        detectedBlocks: r.detectedBlocks.filter(
          (b) => b.topic_l1 === filters.topicL1
        )
      }))
      .filter((r) => r.detectedBlocks.length > 0)
  }

  // topic_l2 フィルタ
  if (filters.topicL2 !== 'all') {
    filtered = filtered
      .map((r) => ({
        ...r,
        detectedBlocks: r.detectedBlocks.filter((b) =>
          b.matchedL2.includes(filters.topicL2)
        )
      }))
      .filter((r) => r.detectedBlocks.length > 0)
  }

  return filtered
}

// ── ユーティリティ ─────────────────────────────────

function toRanking(map: Map<string, number>, total: number): MathRankingRow[] {
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

function emptyAggregate(): MathAggregateSummary {
  return {
    totalFiles: 0,
    unitRanking: [],
    recentRanking: [],
    blockDistribution: [],
    trendRows: [],
    sessions: [],
    totalCidHeavyPages: 0,
    totalBlankPages: 0,
    totalAnswerPages: 0,
    availableL1: [],
    availableL2: [],
    availableBlocks: []
  }
}
