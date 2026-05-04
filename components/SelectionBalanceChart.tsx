'use client'

import type { BalanceRow } from '@/lib/scienceScoreCalculator'
import type { SciGroupName } from '@/lib/scienceTagMapper'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'

const GROUP_COLORS: Record<SciGroupName, { block1: string; block2: string }> = {
  '物理系': { block1: '#1A5CFF', block2: '#6B9BFF' },
  '化学系': { block1: '#FF6B35', block2: '#FFAB8A' },
  '生物系': { block1: '#2E8B57', block2: '#6BC992' },
  '地学系': { block1: '#9370DB', block2: '#C4ADEE' }
}

type Props = {
  balanceRows: BalanceRow[]
}

export default function SelectionBalanceChart({ balanceRows }: Props) {
  const chartData = balanceRows.flatMap((row) => [
    {
      name: `${row.block1Label}\n${row.block1Topic}`,
      shortName: row.block1Label,
      count: row.block1Count,
      group: row.group,
      colorKey: 'block1' as const
    },
    {
      name: `${row.block2Label}\n${row.block2Topic}`,
      shortName: row.block2Label,
      count: row.block2Count,
      group: row.group,
      colorKey: 'block2' as const
    }
  ])

  const hasData = chartData.some((d) => d.count > 0)

  return (
    <div>
      {/* グラフ */}
      <div className="panel h-[360px] p-4" role="img" aria-label="分野別出題バランスの棒グラフ。各分野の2大問の出現回数を比較">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 20, bottom: 64, left: 0 }}>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
              <XAxis
                dataKey="shortName"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number, _name: string, props: any) => {
                  const item = props.payload
                  return [`${value}回`, `${item.name.replace('\n', '：')}`]
                }}
              />
              <Bar dataKey="count" stroke="#1A1A1A" strokeWidth={2}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GROUP_COLORS[entry.group]?.[entry.colorKey] ?? '#999'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            該当データはない：PDF解析後にグラフを表示します。
          </div>
        )}
      </div>

      {/* 表 */}
      <div className="mt-5 overflow-x-auto" role="region" aria-label="分野別出題バランス表" tabIndex={0}>
        <table className="w-full min-w-[640px] border-collapse bg-paper" role="table">
          <caption className="py-3 text-left font-bold">
            分野別出題バランス。各分野内の2大問がそれぞれ何回出題されたかの比較。
          </caption>
          <thead className="bg-ink text-cream">
            <tr>
              <th scope="col" className="p-3 text-left">分野</th>
              <th scope="col" className="p-3 text-left">大問A</th>
              <th scope="col" className="p-3 text-right">出現回数</th>
              <th scope="col" className="p-3 text-left">大問B</th>
              <th scope="col" className="p-3 text-right">出現回数</th>
              <th scope="col" className="p-3 text-left">傾向</th>
            </tr>
          </thead>
          <tbody>
            {balanceRows.length > 0 ? (
              balanceRows.map((row) => {
                const total = row.block1Count + row.block2Count
                let tendency = '同数'
                if (row.block1Count > row.block2Count) {
                  tendency = `${row.block1Label}が多い`
                } else if (row.block2Count > row.block1Count) {
                  tendency = `${row.block2Label}が多い`
                }
                if (total === 0) tendency = 'データなし'

                return (
                  <tr key={row.group} className="border-b-2 border-ink even:bg-blue/5">
                    <td className="p-3 font-bold">{row.group}</td>
                    <td className="p-3">
                      <span className="font-bold">{row.block1Label}</span>
                      <br />
                      <span className="text-sm">{row.block1Topic}</span>
                    </td>
                    <td className="p-3 text-right">{row.block1Count}</td>
                    <td className="p-3">
                      <span className="font-bold">{row.block2Label}</span>
                      <br />
                      <span className="text-sm">{row.block2Topic}</span>
                    </td>
                    <td className="p-3 text-right">{row.block2Count}</td>
                    <td className="p-3 text-sm">{tendency}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-3">該当データはない</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
