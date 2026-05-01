'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type ChartDatum = Record<string, string | number>

type Props = {
  data: ChartDatum[]
  type?: 'bar' | 'line'
  xKey: string
  yKey: string
  label: string
  color?: string
}

export default function FrequencyChart({ data, type = 'bar', xKey, yKey, label, color = '#1A5CFF' }: Props) {
  if (!data.length) {
    return <div className="panel p-6" role="img" aria-label={`${label}。該当データはない`}>該当データはない：PDF解析後にグラフを表示します。</div>
  }

  return (
    <div className="panel h-[320px] p-4" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
            <XAxis dataKey={xKey} interval={0} angle={-18} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={4} dot={{ r: 5, fill: '#1A1A1A' }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
            <XAxis dataKey={xKey} interval={0} angle={-18} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey={yKey} fill={color} stroke="#1A1A1A" strokeWidth={2} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
