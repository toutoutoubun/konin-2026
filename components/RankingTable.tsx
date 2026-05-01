import type { RankingRow, RecentRankingRow } from '@/lib/scoreCalculator'

type Props = {
  rows: RankingRow[]
  caption: string
  kind?: 'unit' | 'recent'
  recentRows?: RecentRankingRow[]
}

export default function RankingTable({ rows, caption, kind = 'unit', recentRows = [] }: Props) {
  if (kind === 'recent') {
    return (
      <div className="overflow-x-auto" role="region" aria-label={caption}>
        <table className="w-full min-w-[640px] border-collapse bg-paper" role="table">
          <caption className="py-3 text-left font-bold">{caption}</caption>
          <thead className="bg-ink text-cream">
            <tr>
              <th scope="col" className="p-3 text-left">順位</th>
              <th scope="col" className="p-3 text-left">単元</th>
              <th scope="col" className="p-3 text-left">重み付きスコア</th>
              <th scope="col" className="p-3 text-left">直近の出現</th>
            </tr>
          </thead>
          <tbody>
            {recentRows.map((row, index) => (
              <tr key={row.unit} className="border-b-2 border-ink even:bg-blue/5">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-bold">{row.unit}</td>
                <td className="p-3">{row.score}</td>
                <td className="p-3">{row.latestSession}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label={caption}>
      <table className="w-full min-w-[640px] border-collapse bg-paper" role="table">
        <caption className="py-3 text-left font-bold">{caption}</caption>
        <thead className="bg-ink text-cream">
          <tr>
            <th scope="col" className="p-3 text-left">順位</th>
            <th scope="col" className="p-3 text-left">単元</th>
            <th scope="col" className="p-3 text-left">出現回数</th>
            <th scope="col" className="p-3 text-left">出現率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.unit} className="border-b-2 border-ink even:bg-blue/5">
              <td className="p-3">{index + 1}</td>
              <td className="p-3 font-bold">{row.unit}</td>
              <td className="p-3">{row.count}</td>
              <td className="p-3">{row.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
