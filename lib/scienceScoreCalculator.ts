/**
 * 科学と人間生活 過去問の集計・スコア計算
 * セクションA〜Eに必要なデータを生成する
 */

import type {
  SciAnalysisResult,
  SciBlockHit,
  SciGroupName
} from './scienceTagMapper'
import { selectionStructure } from './scienceTagMapper'

/* ── フィルタ型 ── */

export type SciFilters = {
  group: string        // 'all' | '物理系' | '化学系' | '生物系' | '地学系'
  sessionRange: string // 'all' | 'recent4' | 'recent2' | 'older'
}

export const initialSciFilters: SciFilters = {
  group: 'all',
  sessionRange: 'all'
}

/* ── ランキング行型 ── */

export type RankingRow = {
  unit: string
  count: number
  rate: number
}

export type RecentRankingRow = {
  unit: string
  group: SciGroupName
  score: number
  latestSession: string
}

export type TrendRow = {
  session: string
  unit: string
  group: SciGroupName
  count: number
}

export type BalanceRow = {
  group: SciGroupName
  block1Label: string
  block1Topic: string
  block1Count: number
  block2Label: string
  block2Topic: string
  block2Count: number
}

/* ── 集計サマリー型 ── */

export type SciAggregateSummary = {
  totalCount: number
  hasLowConfidence: boolean
  // Section A: 分野別頻出単元ランキング
  groupRankings: Record<SciGroupName, RankingRow[]>
  allUnitRanking: RankingRow[]
  // Section B: 近年頻出ランキング
  recentRanking: RecentRankingRow[]
  groupRecentRankings: Record<SciGroupName, RecentRankingRow[]>
  // Section C: 分野別出題バランス
  balanceRows: BalanceRow[]
  // Section D: 年度推移
  trendRows: TrendRow[]
  // メタ情報
  availableGroups: SciGroupName[]
  availableUnits: string[]
  sessions: string[]
}

/* ── 重み付き ── */

const SESSION_WEIGHTS = [1.0, 0.8, 0.6, 0.4]

const GROUP_ORDER: SciGroupName[] = ['物理系', '化学系', '生物系', '地学系']

/* ── フィルタ関数 ── */

export function filterSciResults(
  results: SciAnalysisResult[],
  filters: SciFilters
): SciAnalysisResult[] {
  let next = [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )

  // 分野フィルタ：結果内のblockHitsをフィルタ（結果自体は残す）
  if (filters.group !== 'all') {
    next = next.map((r) => ({
      ...r,
      blockHits: r.blockHits.filter((h) => h.group === filters.group)
    })).filter((r) => r.blockHits.length > 0)
  }

  // 試験回範囲フィルタ
  if (filters.sessionRange === 'recent4') next = next.slice(0, 4)
  if (filters.sessionRange === 'recent2') next = next.slice(0, 2)
  if (filters.sessionRange === 'older') next = next.slice(4)

  return next
}

/* ── 集計関数 ── */

export function aggregateSciResults(
  results: SciAnalysisResult[]
): SciAggregateSummary {
  const sorted = [...results].sort(
    (a, b) =>
      (b.examYear ?? 0) - (a.examYear ?? 0) ||
      b.examSession.localeCompare(a.examSession)
  )

  // topic_l2（単元）単位の集計
  const unitCounts = new Map<string, { count: number; group: SciGroupName }>()
  const recentScores = new Map<string, { score: number; group: SciGroupName; latestSession: string }>()
  const trendRows: TrendRow[] = []
  let hasLowConfidence = false

  // ブロック別カウント（バランス用）
  const blockCounts = new Map<string, number>()

  sorted.forEach((result, resultIndex) => {
    const weight = SESSION_WEIGHTS[resultIndex] ?? 0.2

    for (const hit of result.blockHits) {
      if (hit.confidence === 'low') hasLowConfidence = true

      const key = hit.topic_l2

      // 通常カウント
      const current = unitCounts.get(key) ?? { count: 0, group: hit.group }
      unitCounts.set(key, {
        count: current.count + 1,
        group: hit.group
      })

      // 重み付きスコア
      const rCurrent = recentScores.get(key) ?? {
        score: 0,
        group: hit.group,
        latestSession: result.examSession
      }
      recentScores.set(key, {
        score: rCurrent.score + weight,
        group: hit.group,
        latestSession: rCurrent.latestSession || result.examSession
      })

      // 年度推移
      trendRows.push({
        session: result.examSession,
        unit: hit.topic_l2,
        group: hit.group,
        count: 1
      })

      // ブロック別カウント
      blockCounts.set(
        hit.block,
        (blockCounts.get(hit.block) ?? 0) + 1
      )
    }
  })

  // 合計
  const totalUnit = Array.from(unitCounts.values()).reduce((s, c) => s + c.count, 0)

  // 分野別ランキング
  const groupRankings: Record<SciGroupName, RankingRow[]> = {
    '物理系': [],
    '化学系': [],
    '生物系': [],
    '地学系': []
  }

  for (const [unit, data] of unitCounts) {
    const row: RankingRow = {
      unit,
      count: data.count,
      rate: totalUnit ? round((data.count / totalUnit) * 100) : 0
    }
    groupRankings[data.group].push(row)
  }

  // 各分野内でソート
  for (const group of GROUP_ORDER) {
    const groupTotal = groupRankings[group].reduce((s, r) => s + r.count, 0)
    groupRankings[group] = groupRankings[group]
      .map((r) => ({
        ...r,
        rate: groupTotal ? round((r.count / groupTotal) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  // 全体ランキング
  const allUnitRanking = Array.from(unitCounts.entries())
    .map(([unit, data]) => ({
      unit,
      count: data.count,
      rate: totalUnit ? round((data.count / totalUnit) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)

  // 分野別近年頻出
  const groupRecentRankings: Record<SciGroupName, RecentRankingRow[]> = {
    '物理系': [],
    '化学系': [],
    '生物系': [],
    '地学系': []
  }

  const allRecentRanking = Array.from(recentScores.entries())
    .map(([unit, val]) => ({
      unit,
      group: val.group,
      score: round(val.score),
      latestSession: val.latestSession
    }))
    .sort((a, b) => b.score - a.score)

  for (const row of allRecentRanking) {
    groupRecentRankings[row.group].push(row)
  }

  // バランス行
  const balanceRows: BalanceRow[] = selectionStructure.map((group) => ({
    group: group.group as SciGroupName,
    block1Label: group.blocks[0].block,
    block1Topic: group.blocks[0].topic_l2,
    block1Count: blockCounts.get(group.blocks[0].block) ?? 0,
    block2Label: group.blocks[1].block,
    block2Topic: group.blocks[1].topic_l2,
    block2Count: blockCounts.get(group.blocks[1].block) ?? 0
  }))

  // メタ情報
  const sessions = Array.from(new Set(sorted.map((r) => r.examSession)))
  const availableGroups = Array.from(new Set(
    sorted.flatMap((r) => r.blockHits.map((h) => h.group))
  )) as SciGroupName[]
  const availableUnits = Array.from(new Set(
    sorted.flatMap((r) => r.blockHits.map((h) => h.topic_l2))
  ))

  return {
    totalCount: results.length,
    hasLowConfidence,
    groupRankings,
    allUnitRanking,
    recentRanking: allRecentRanking,
    groupRecentRankings,
    balanceRows,
    trendRows,
    availableGroups,
    availableUnits,
    sessions
  }
}

/* ── ユーティリティ ── */

function round(value: number): number {
  return Math.round(value * 10) / 10
}
