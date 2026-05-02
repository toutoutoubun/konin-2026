'use client'

import { useMemo, useState } from 'react'
import type { GrammarVocabCrossCell, CefrLevel } from '@/lib/vocabAnalyzer'

type Props = {
  rows: GrammarVocabCrossCell[]
  caption: string
}

const cefrLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'pre-CEFR', 'unknown']

const cefrHeaderColors: Record<CefrLevel, string> = {
  A1: 'bg-green-600',
  A2: 'bg-blue-600',
  B1: 'bg-yellow-600',
  B2: 'bg-orange-600',
  'pre-CEFR': 'bg-violet-600',
  unknown: 'bg-gray-500'
}

const cefrLabelMap: Record<string, string> = {
  A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2',
  'pre-CEFR': '試験語彙', unknown: '未分類'
}

function heatColor(value: number, max: number): string {
  if (value === 0 || max === 0) return 'bg-cream'
  const ratio = value / max
  if (ratio > 0.7) return 'bg-red-200'
  if (ratio > 0.4) return 'bg-orange-100'
  if (ratio > 0.15) return 'bg-yellow-50'
  return 'bg-cream'
}

export default function GrammarVocabCrossTable({ rows, caption }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('heatmap')

  const { grammars, matrix, maxValue, topCombinations } = useMemo(() => {
    const map = new Map<string, Map<CefrLevel, number>>()
    let max = 0

    rows.forEach((cell) => {
      if (!map.has(cell.grammar)) map.set(cell.grammar, new Map())
      const grammarMap = map.get(cell.grammar)!
      const current = (grammarMap.get(cell.cefrLevel) ?? 0) + cell.count
      grammarMap.set(cell.cefrLevel, current)
      if (current > max) max = current
    })

    // Sort grammars by total count
    const grammarTotals = Array.from(map.entries())
      .map(([grammar, levelMap]) => ({
        grammar,
        total: Array.from(levelMap.values()).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => b.total - a.total)

    const sortedGrammars = grammarTotals.map((g) => g.grammar)

    // Build matrix
    const matrixData: Record<string, Record<CefrLevel, number>> = {}
    sortedGrammars.forEach((grammar) => {
      const levelMap = map.get(grammar)!
      matrixData[grammar] = {} as Record<CefrLevel, number>
      cefrLevels.forEach((level) => {
        matrixData[grammar][level] = levelMap.get(level) ?? 0
      })
    })

    // Top combinations
    const combos: Array<{ grammar: string; cefrLevel: CefrLevel; count: number }> = []
    sortedGrammars.forEach((grammar) => {
      cefrLevels.forEach((level) => {
        const count = matrixData[grammar][level]
        if (count > 0) combos.push({ grammar, cefrLevel: level, count })
      })
    })
    combos.sort((a, b) => b.count - a.count)

    return { grammars: sortedGrammars, matrix: matrixData, maxValue: max, topCombinations: combos.slice(0, 5) }
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
          <table className="w-full min-w-[600px] border-collapse" role="table">
            <caption className="py-3 text-left font-bold">{caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="bg-ink p-3 text-left text-cream">文法項目</th>
                {cefrLevels.map((level) => (
                  <th
                    key={level}
                    scope="col"
                    className={`p-3 text-center text-white ${cefrHeaderColors[level]}`}
                  >
                    {cefrLabelMap[level] ?? level}
                  </th>
                ))}
                <th scope="col" className="bg-ink p-3 text-center text-cream">合計</th>
              </tr>
            </thead>
            <tbody>
              {grammars.map((grammar) => {
                const rowTotal = cefrLevels.reduce((sum, level) => sum + (matrix[grammar]?.[level] ?? 0), 0)
                return (
                  <tr key={grammar} className="border-b-2 border-ink">
                    <th scope="row" className="bg-paper p-3 text-left font-bold">{grammar}</th>
                    {cefrLevels.map((level) => {
                      const value = matrix[grammar]?.[level] ?? 0
                      return (
                        <td
                          key={level}
                          className={`p-3 text-center tabular-nums ${heatColor(value, maxValue)} border-l border-ink/20`}
                          title={`${grammar} × ${level}: ${value}件`}
                        >
                          {value > 0 ? value : <span className="text-ink/30">-</span>}
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
            <span>色の濃さ：</span>
            <span className="inline-block h-4 w-8 rounded border border-ink/20 bg-cream" /> 少
            <span className="inline-block h-4 w-8 rounded border border-ink/20 bg-yellow-50" />
            <span className="inline-block h-4 w-8 rounded border border-ink/20 bg-orange-100" />
            <span className="inline-block h-4 w-8 rounded border border-ink/20 bg-red-200" /> 多
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
              {topCombinations.map((combo, index) => (
                <tr key={`${combo.grammar}-${combo.cefrLevel}`} className="border-b-2 border-ink even:bg-blue/5">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-bold">{combo.grammar}</td>
                  <td className="p-3">{cefrLabelMap[combo.cefrLevel] ?? combo.cefrLevel}</td>
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
                {combo.grammar}では{cefrLabelMap[combo.cefrLevel] ?? combo.cefrLevel}レベルの語彙が多く使われています（{combo.count}件）
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
