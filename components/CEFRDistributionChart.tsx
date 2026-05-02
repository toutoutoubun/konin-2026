'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CefrDistributionRow } from '@/lib/vocabAnalyzer'

type Props = {
  rows: CefrDistributionRow[]
  viewMode: 'table' | 'chart'
  caption: string
  properNounCount?: number
  unknownBreakdown?: {
    resolvedByStem: number
    trulyUnknown: number
    properNouns: number
    preCefr: number
  }
}

const cefrColors: Record<string, string> = {
  A1: '#22c55e',
  A2: '#3b82f6',
  B1: '#eab308',
  B2: '#f97316',
  'pre-CEFR': '#8b5cf6',
  unknown: '#9ca3af'
}

const cefrBgClasses: Record<string, string> = {
  A1: 'bg-green-100 text-green-800 border-green-300',
  A2: 'bg-blue-100 text-blue-800 border-blue-300',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  B2: 'bg-orange-100 text-orange-800 border-orange-300',
  'pre-CEFR': 'bg-violet-100 text-violet-800 border-violet-300',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300'
}

const cefrLabelMap: Record<string, string> = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  'pre-CEFR': '試験語彙',
  unknown: '未分類'
}

export default function CEFRDistributionChart({ rows, viewMode, caption, properNounCount, unknownBreakdown }: Props) {
  const hasData = rows.some((row) => row.count > 0)

  if (!hasData) {
    return (
      <div className="border-2 border-ink bg-cream p-4" role="status">
        該当データはない：PDF解析後にCEFRレベル別語彙分布を表示します。
      </div>
    )
  }

  const chartData = rows.map((row) => ({
    name: cefrLabelMap[row.level] ?? row.level,
    level: row.level,
    count: row.count,
    rate: row.rate
  }))

  return (
    <div>
      <p className="mb-3 text-sm text-ink/70">内容語のみ集計（機能語・固有名詞は集計対象外）</p>

      {viewMode === 'chart' ? (
        <div className="panel h-[320px] p-4" role="img" aria-label={caption}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'count') return [`${value} 語`, '語彙数']
                  return [value, name]
                }}
              />
              <Bar dataKey="count" stroke="#1A1A1A" strokeWidth={2}>
                {chartData.map((entry) => (
                  <Cell key={entry.level} fill={cefrColors[entry.level] ?? '#9ca3af'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto" role="region" aria-label="CEFRレベル別語彙分布表">
        <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
          <caption className="py-3 text-left font-bold">{caption}</caption>
          <thead className="bg-ink text-cream">
            <tr>
              <th scope="col" className="p-3 text-left">CEFRレベル</th>
              <th scope="col" className="p-3 text-right">語彙数</th>
              <th scope="col" className="p-3 text-right">構成比</th>
              <th scope="col" className="p-3 text-left">分布バー</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.level} className="border-b-2 border-ink even:bg-blue/5">
                <td className="p-3">
                  <span className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${cefrBgClasses[row.level] ?? cefrBgClasses.unknown}`}>
                    {cefrLabelMap[row.level] ?? row.level}
                  </span>
                </td>
                <td className="p-3 text-right tabular-nums">{row.count.toLocaleString()}</td>
                <td className="p-3 text-right tabular-nums">{row.rate}%</td>
                <td className="p-3">
                  <div className="h-5 w-full rounded border border-ink/20 bg-cream">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(row.rate, 100)}%`,
                        backgroundColor: cefrColors[row.level] ?? '#9ca3af'
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unknown breakdown & proper noun info */}
      {(unknownBreakdown || (properNounCount && properNounCount > 0)) && (
        <div className="mt-4 border-2 border-ink bg-cream p-4">
          <h4 className="font-bold text-sm">分類精度の詳細</h4>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {unknownBreakdown && unknownBreakdown.resolvedByStem > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-400" />
                <span>語幹照合で分類済：<strong>{unknownBreakdown.resolvedByStem.toLocaleString()}</strong> 語</span>
              </div>
            )}
            {unknownBreakdown && unknownBreakdown.preCefr > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-violet-400" />
                <span>試験語彙（pre-CEFR）：<strong>{unknownBreakdown.preCefr.toLocaleString()}</strong> 語</span>
              </div>
            )}
            {unknownBreakdown && unknownBreakdown.trulyUnknown > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-gray-400" />
                <span>リスト外（未分類）：<strong>{unknownBreakdown.trulyUnknown.toLocaleString()}</strong> 語</span>
              </div>
            )}
            {properNounCount != null && properNounCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-purple-400" />
                <span>固有名詞（除外）：<strong>{properNounCount.toLocaleString()}</strong> 語</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-ink/60">
            語幹照合：派生語（例：environmental → environment）をCEFRリストの基本形と照合して分類。
            試験語彙（pre-CEFR）：国名形容詞（Japanese等）、月名、曜日、試験指示語など、CEFRレベル外だが試験に頻出する語彙。
            固有名詞はwink-NLPの品詞タグにより自動検出し、CEFR分布の集計から除外。
          </p>
        </div>
      )}
    </div>
  )
}
