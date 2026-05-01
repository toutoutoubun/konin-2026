/**
 * mathScoreCalculator.ts
 * 数学頻出分析の集計・ランキング・年度推移・重み付きスコアを計算する。
 *
 * Sections:
 *   A. よく出る単元ランキング (topic_l1 + topic_l2)
 *   B. 近年重み付きランキング (latest 1.0, prev 0.8, 2-ago 0.6, 3-ago 0.4, earlier 0.2)
 *   C. 大問別分布
 *   D. 年度推移
 */

import type { MathAnalysisResult, MathQuestionBlock } from './mathTagMapper'

// ── 型定義 ─────────────────────────────────────────

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
  totalSubQuestions: number
  formulaOnlyTotal: number

  /** A. topic_l2 単位の頻出ランキング */
  unitRanking: MathRankingRow[]

  /** topic_l1 単位の頻出ランキング */
  l1Ranking: MathRankingRow[]

  /** B. 近年重み付きランキング */
  recentRanking: MathRecentRankingRow[]

  /** C. 大問別分布 */
  blockDistribution: MathBlockDistRow[]

  /** D. 年度推移 (session × topic_l1) */
  trendRows: MathTrendRow[]

  /** セッション一覧（ソート済み） */
  sessions: string[]

  /** 利用可能な topic_l1 一覧 */
  availableL1: string[]

  /** 利用可能な topic_l2 一覧 */
  availableL2: string[]

  /** 利用可能なブロック一覧 */
  availableBlocks: string[]
}

// ── 重み定義 ─────────────────────────────────────────

const SESSION_WEIGHTS = [1.0, 0.8, 0.6, 0.4] as const
const DEFAULT_WEIGHT = 0.2

// ── メイン集計 ─────────────────────────────────────────

export function aggregateMathResults(results: MathAnalysisResult[]): MathAggregateSummary {
  if (results.length === 0) {
    return emptyAggregate()
  }

  // 年度ソート（新しい順）
  const sorted = [...results].sort(
    (a, b) => (b.examYear ?? 0) - (a.examYear ?? 0) || b.examSession.localeCompare(a.examSession)
  )

  // カウンターマップ
  const l2Counts = new Map<string, number>()
  const l1Counts = new Map<string, number>()
  const blockCounts = new Map<string, { topic_l1: string; count: number }>()
  const recentScores = new Map<string, { score: number; latestSession: string }>()
  const trendMap = new Map<string, Map<string, number>>() // session → (topic_l1 → count)

  let totalSubQuestions = 0
  let formulaOnlyTotal = 0

  sorted.forEach((result, resultIndex) => {
    const weight = resultIndex < SESSION_WEIGHTS.length
      ? SESSION_WEIGHTS[resultIndex]
      : DEFAULT_WEIGHT

    formulaOnlyTotal += result.formulaOnlyTotal

    for (const block of result.questionBlocks) {
      const blockKey = `第${block.blockNumber}問`
      const existing = blockCounts.get(blockKey) ?? { topic_l1: block.topic_l1, count: 0 }

      // 大問別カウント（大問の出現回数はファイル数分）
      existing.count += 1
      blockCounts.set(blockKey, existing)

      // topic_l1 カウント
      l1Counts.set(block.topic_l1, (l1Counts.get(block.topic_l1) ?? 0) + block.totalSubQuestions)

      // 年度推移データ
      const sessionKey = result.examSession
      if (!trendMap.has(sessionKey)) trendMap.set(sessionKey, new Map())
      const sessionMap = trendMap.get(sessionKey)!
      sessionMap.set(block.topic_l1, (sessionMap.get(block.topic_l1) ?? 0) + block.totalSubQuestions)

      for (const sub of block.subQuestions) {
        totalSubQuestions++

        if (sub.isFormulaOnly || !sub.topic_l2) continue

        // topic_l2 カウント
        l2Counts.set(sub.topic_l2, (l2Counts.get(sub.topic_l2) ?? 0) + 1)

        // 近年重み付きスコア
        const current = recentScores.get(sub.topic_l2) ?? {
          score: 0,
          latestSession: result.examSession
        }
        recentScores.set(sub.topic_l2, {
          score: current.score + 1 * weight,
          latestSession: current.latestSession || result.examSession
        })
      }
    }
  })

  // ── 出力生成 ─────────────────────────────────────────

  const totalL2 = Array.from(l2Counts.values()).reduce((s, c) => s + c, 0) || 1
  const totalL1 = Array.from(l1Counts.values()).reduce((s, c) => s + c, 0) || 1
  const totalBlocks = Array.from(blockCounts.values()).reduce((s, b) => s + b.count, 0) || 1

  const unitRanking = toRanking(l2Counts, totalL2)
  const l1Ranking = toRanking(l1Counts, totalL1)

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

  // 年度推移行
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
    totalSubQuestions,
    formulaOnlyTotal,
    unitRanking,
    l1Ranking,
    recentRanking,
    blockDistribution,
    trendRows,
    sessions,
    availableL1: Array.from(l1Counts.keys()).sort(),
    availableL2: Array.from(l2Counts.keys()).sort(),
    availableBlocks: Array.from(blockCounts.keys()).sort((a, b) => {
      const aNum = parseInt(a.replace(/[^0-9]/g, ''), 10)
      const bNum = parseInt(b.replace(/[^0-9]/g, ''), 10)
      return aNum - bNum
    })
  }
}

// ── フィルタ ─────────────────────────────────────────

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
    (a, b) => (b.examYear ?? 0) - (a.examYear ?? 0) || b.examSession.localeCompare(a.examSession)
  )

  // 試験回範囲
  if (filters.sessionRange === 'recent4') filtered = filtered.slice(0, 4)
  else if (filters.sessionRange === 'recent2') filtered = filtered.slice(0, 2)
  else if (filters.sessionRange === 'older') filtered = filtered.slice(4)

  // ブロックフィルタ
  if (filters.block !== 'all') {
    const blockNum = parseInt(filters.block.replace(/[^0-9]/g, ''), 10)
    filtered = filtered.map((r) => ({
      ...r,
      questionBlocks: r.questionBlocks.filter((b) => b.blockNumber === blockNum)
    })).filter((r) => r.questionBlocks.length > 0)
  }

  // topic_l1 フィルタ
  if (filters.topicL1 !== 'all') {
    filtered = filtered.map((r) => ({
      ...r,
      questionBlocks: r.questionBlocks.filter((b) => b.topic_l1 === filters.topicL1)
    })).filter((r) => r.questionBlocks.length > 0)
  }

  // topic_l2 フィルタ
  if (filters.topicL2 !== 'all') {
    filtered = filtered.map((r) => ({
      ...r,
      questionBlocks: r.questionBlocks.map((b) => ({
        ...b,
        subQuestions: b.subQuestions.filter((sq) => sq.topic_l2 === filters.topicL2)
      })).filter((b) => b.subQuestions.length > 0)
    })).filter((r) => r.questionBlocks.length > 0)
  }

  return filtered
}

// ── ユーティリティ ─────────────────────────────────────────

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
    totalSubQuestions: 0,
    formulaOnlyTotal: 0,
    unitRanking: [],
    l1Ranking: [],
    recentRanking: [],
    blockDistribution: [],
    trendRows: [],
    sessions: [],
    availableL1: [],
    availableL2: [],
    availableBlocks: []
  }
}
