'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import type { GrammarVocabCrossCell, CefrLevel } from '@/lib/vocabAnalyzer'

type Props = {
  rows: GrammarVocabCrossCell[]
  caption: string
}

const cefrLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'pre-CEFR', 'unknown']

// CEFRレベルごとのヘッダー色。Tailwindのカスタムカラー設定（blue/yellow/orange を
// 単一文字列に上書き）の影響で `bg-blue-600` などの shade 派生クラスが生成されないため、
// 直接インラインstyleでHEX指定して常に発色するようにする。
const cefrHeaderStyles: Record<CefrLevel, { backgroundColor: string; color: string }> = {
  A1: { backgroundColor: '#16A34A', color: '#FFFFFF' }, // green-600
  A2: { backgroundColor: '#2563EB', color: '#FFFFFF' }, // blue-600
  B1: { backgroundColor: '#D97706', color: '#FFFFFF' }, // amber-600（B1: 視認性のため茶系の濃色）
  B2: { backgroundColor: '#EA580C', color: '#FFFFFF' }, // orange-600
  'pre-CEFR': { backgroundColor: '#7C3AED', color: '#FFFFFF' }, // violet-600
  unknown: { backgroundColor: '#6B7280', color: '#FFFFFF' } // gray-500
}

const cefrDetails: Record<CefrLevel, { label: string; hint: string }> = {
  A1: { label: 'A1', hint: '基礎' },
  A2: { label: 'A2', hint: '日常' },
  B1: { label: 'B1', hint: '標準' },
  B2: { label: 'B2', hint: '発展' },
  'pre-CEFR': { label: '試験語彙', hint: '指示語等' },
  unknown: { label: '未分類', hint: 'リスト外' }
}

function cefrLabel(level: CefrLevel): string {
  return cefrDetails[level]?.label ?? level
}

function heatStyle(value: number, rowMax: number): CSSProperties {
  if (value === 0 || rowMax === 0) {
    return { backgroundColor: '#FFFAF0', color: '#1A1A1A' }
  }

  const ratio = value / rowMax
  const lightness = Math.max(38, 94 - Math.round(ratio * 50))

  return {
    backgroundColor: `hsl(22 100% ${lightness}%)`,
    color: ratio >= 0.58 ? '#FFFAF0' : '#1A1A1A'
  }
}

export default function GrammarVocabCrossTable({ rows, caption }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('heatmap')

  const { grammars, matrix, rowTotals, rowMaxes, topCombinations } = useMemo(() => {
    const map = new Map<string, Map<CefrLevel, number>>()

    rows.forEach((cell) => {
      if (!map.has(cell.grammar)) map.set(cell.grammar, new Map())
      const grammarMap = map.get(cell.grammar)!
      const current = (grammarMap.get(cell.cefrLevel) ?? 0) + cell.count
      grammarMap.set(cell.cefrLevel, current)
    })

    const grammarTotals = Array.from(map.entries())
      .map(([grammar, levelMap]) => ({
        grammar,
        total: Array.from(levelMap.values()).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => b.total - a.total)

    const sortedGrammars = grammarTotals.map((g) => g.grammar)

    const matrixData: Record<string, Record<CefrLevel, number>> = {}
    const totals: Record<string, number> = {}
    const maxes: Record<string, number> = {}

    sortedGrammars.forEach((grammar) => {
      const levelMap = map.get(grammar)!
      matrixData[grammar] = {} as Record<CefrLevel, number>
      totals[grammar] = 0
      maxes[grammar] = 0
      cefrLevels.forEach((level) => {
        const count = levelMap.get(level) ?? 0
        matrixData[grammar][level] = count
        totals[grammar] += count
        maxes[grammar] = Math.max(maxes[grammar], count)
      })
    })

    const combos: Array<{ grammar: string; cefrLevel: CefrLevel; count: number }> = []
    sortedGrammars.forEach((grammar) => {
      cefrLevels.forEach((level) => {
        const count = matrixData[grammar][level]
        if (count > 0) combos.push({ grammar, cefrLevel: level, count })
      })
    })
    combos.sort((a, b) => b.count - a.count)

    return { grammars: sortedGrammars, matrix: matrixData, rowTotals: totals, rowMaxes: maxes, topCombinations: combos }
  }, [rows])

  if (!grammars.length) {
    return (
      <div className="border-2 border-ink bg-cream p-4" role="status">
        該当データはない：PDF解析後に文法×語彙レベルのクロス集計を表示します。
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-3" role="group" aria-label="表示形式を切り替える">
          <button
            className={`hard-button px-4 py-2 ${viewMode === 'heatmap' ? 'bg-blue text-white' : 'bg-paper'}`}
            type="button"
            aria-pressed={viewMode === 'heatmap'}
            onClick={() => setViewMode('heatmap')}
          >
            ヒートマップ
          </button>
          <button
            className={`hard-button px-4 py-2 ${viewMode === 'table' ? 'bg-blue text-white' : 'bg-paper'}`}
            type="button"
            aria-pressed={viewMode === 'table'}
            onClick={() => setViewMode('table')}
          >
            表
          </button>
        </div>
      </div>

      {viewMode === 'heatmap' ? (
        <div className="overflow-x-auto" role="region" aria-label={caption}>
          <p className="mb-3 text-sm text-ink/70">
            数字は語彙数、下段はその文法項目内での構成比です。色の濃さは行ごとに調整しているため、文法項目ごとの語彙レベルの偏りを比較できます。
          </p>
          <table className="w-full min-w-[860px] border-collapse" role="table">
            <caption className="py-3 text-left font-bold">{caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="bg-ink p-3 text-left text-cream">文法項目</th>
                {cefrLevels.map((level) => (
                  <th
                    key={level}
                    scope="col"
                    className="p-3 text-center"
                    style={cefrHeaderStyles[level]}
                  >
                    <span className="block text-sm font-bold">{cefrDetails[level].label}</span>
                    <span className="block text-xs font-normal opacity-90">{cefrDetails[level].hint}</span>
                  </th>
                ))}
                <th scope="col" className="bg-ink p-3 text-center text-cream">合計</th>
              </tr>
            </thead>
            <tbody>
              {grammars.map((grammar) => {
                const rowTotal = rowTotals[grammar] ?? 0
                const rowMax = rowMaxes[grammar] ?? 0
                return (
                  <tr key={grammar} className="border-b-2 border-ink">
                    <th scope="row" className="bg-paper p-3 text-left font-bold">{grammar}</th>
                    {cefrLevels.map((level) => {
                      const value = matrix[grammar]?.[level] ?? 0
                      const rate = rowTotal > 0 ? Math.round((value / rowTotal) * 100) : 0
                      const isStrong = rowMax > 0 && value / rowMax >= 0.58
                      return (
                        <td
                          key={level}
                          className="min-w-[96px] border-l border-ink/20 p-2 text-center tabular-nums"
                          style={heatStyle(value, rowMax)}
                          title={`${grammar} × ${cefrLabel(level)}: ${value}件 / 行内${rate}%`}
                        >
                          {value > 0 ? (
                            <span className="inline-flex flex-col items-center leading-tight">
                              <span className="text-base font-bold">{value.toLocaleString()}</span>
                              <span className={`text-[11px] ${isStrong ? 'text-cream/85' : 'text-ink/60'}`}>{rate}%</span>
                            </span>
                          ) : (
                            <span className="text-ink/30">-</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="border-l-2 border-ink bg-paper p-3 text-center font-bold tabular-nums">{rowTotal}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink/70">
            <span>行内の多さ：</span>
            <span className="inline-block h-4 w-8 rounded border border-ink/20" style={{ backgroundColor: '#FFFAF0' }} /> なし
            <span className="inline-block h-4 w-8 rounded border border-ink/20" style={{ backgroundColor: 'hsl(22 100% 78%)' }} /> 少
            <span className="inline-block h-4 w-8 rounded border border-ink/20" style={{ backgroundColor: 'hsl(22 100% 58%)' }} />
            <span className="inline-block h-4 w-8 rounded border border-ink/20" style={{ backgroundColor: 'hsl(22 100% 44%)' }} /> 多
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto" role="region" aria-label={`${caption}（リスト形式）`}>
          <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
            <caption className="py-3 text-left font-bold">{caption}</caption>
            <thead className="bg-ink text-cream">
              <tr>
                <th scope="col" className="p-3 text-left">順位</th>
                <th scope="col" className="p-3 text-left">文法項目</th>
                <th scope="col" className="p-3 text-left">CEFRレベル</th>
                <th scope="col" className="p-3 text-right">件数</th>
              </tr>
            </thead>
            <tbody>
              {topCombinations.slice(0, 20).map((combo, index) => (
                <tr key={`${combo.grammar}-${combo.cefrLevel}`} className="border-b-2 border-ink even:bg-blue/5">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-bold">{combo.grammar}</td>
                  <td className="p-3">{cefrLabel(combo.cefrLevel)}</td>
                  <td className="p-3 text-right tabular-nums">{combo.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topCombinations.length > 0 && (
        <div className="mt-4 border-2 border-ink bg-cream p-4">
          <h4 className="font-bold">傾向サマリー</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {topCombinations.slice(0, 3).map((combo) => (
              <li key={`${combo.grammar}-${combo.cefrLevel}`}>
                {combo.grammar}では{cefrLabel(combo.cefrLevel)}レベルの語彙が多く使われています（{combo.count}件）
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
