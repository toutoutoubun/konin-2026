'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CefrDistributionRow } from '@/lib/vocabAnalyzer'

type Props = {
  rows: CefrDistributionRow[]
  viewMode: 'table' | 'chart'
  caption: string
}

const cefrColors: Record<string, string> = {
  A1: '#22c55e',
  A2: '#3b82f6',
  B1: '#eab308',
  B2: '#f97316',
  unknown: '#9ca3af'
}

const cefrBgClasses: Record<string, string> = {
  A1: 'bg-green-100 text-green-800 border-green-300',
  A2: 'bg-blue-100 text-blue-800 border-blue-300',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  B2: 'bg-orange-100 text-orange-800 border-orange-300',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300'
}

export default function CEFRDistributionChart({ rows, viewMode, caption }: Props) {
  const hasData = rows.some((row) => row.count > 0)

  if (!hasData) {
    return (
      <div className="border-2 border-ink bg-cream p-4" role="status">
        該当データはない：PDF解析後にCEFRレベル別語彙分布を表示します。
      </div>
    )
  }

  const chartData = rows.map((row) => ({
    name: row.level === 'unknown' ? '未分類' : row.level,
    level: row.level,
    count: row.count,
    rate: row.rate
  }))

  return (
    <div>
      <p className="mb-3 text-sm text-ink/70">内容語のみ集計（機能語は集計対象外）</p>

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
                  <span className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${cefrBgClasses[row.level]}`}>
                    {row.level === 'unknown' ? '未分類' : row.level}
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
    </div>
  )
}
