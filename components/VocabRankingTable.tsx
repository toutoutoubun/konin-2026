'use client'

import type { AggregatedVocabItem } from '@/lib/scoreCalculator'
import type { CefrLevel } from '@/lib/vocabAnalyzer'

type Props = {
  rows: AggregatedVocabItem[]
  caption: string
  cefrFilter?: CefrLevel | 'all'
  posFilter?: string
  limit?: number
}

const cefrColors: Record<CefrLevel, string> = {
  A1: 'bg-green-100 text-green-800 border-green-300',
  A2: 'bg-blue-100 text-blue-800 border-blue-300',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  B2: 'bg-orange-100 text-orange-800 border-orange-300',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300'
}

export default function VocabRankingTable({ rows, caption, cefrFilter = 'all', posFilter = 'all', limit = 20 }: Props) {
  let filtered = rows
  if (cefrFilter !== 'all') {
    filtered = filtered.filter((row) => row.cefrLevel === cefrFilter)
  }
  if (posFilter !== 'all') {
    filtered = filtered.filter((row) => row.pos === posFilter)
  }
  const display = filtered.slice(0, limit)

  if (!display.length) {
    return (
      <div className="border-2 border-ink bg-cream p-4" role="status">
        該当データはない：PDF解析後に頻出語彙ランキングを表示します。
      </div>
    )
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label={caption}>
      <p className="mb-2 text-sm text-ink/70">
        内容語のみ集計（機能語（冠詞・前置詞・接続詞など）は集計対象外）
      </p>
      <table className="w-full min-w-[700px] border-collapse bg-paper" role="table">
        <caption className="py-3 text-left font-bold">{caption}</caption>
        <thead className="bg-ink text-cream">
          <tr>
            <th scope="col" className="p-3 text-left">順位</th>
            <th scope="col" className="p-3 text-left">単語</th>
            <th scope="col" className="p-3 text-left">品詞</th>
            <th scope="col" className="p-3 text-left">CEFRレベル</th>
            <th scope="col" className="p-3 text-right">出現回数</th>
            <th scope="col" className="p-3 text-right">出現率</th>
          </tr>
        </thead>
        <tbody>
          {display.map((row, index) => (
            <tr key={row.word} className="border-b-2 border-ink even:bg-blue/5">
              <td className="p-3">{index + 1}</td>
              <td className="p-3 font-bold font-mono">{row.word}</td>
              <td className="p-3">{row.posJa}</td>
              <td className="p-3">
                <span className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${cefrColors[row.cefrLevel]}`}>
                  {row.cefrLevel}
                </span>
              </td>
              <td className="p-3 text-right tabular-nums">{row.count}</td>
              <td className="p-3 text-right tabular-nums">{row.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
