'use client'

import type { AggregatedVocabItem } from '@/lib/scoreCalculator'
import type { CefrLevel } from '@/lib/vocabAnalyzer'

type Props = {
  rows: AggregatedVocabItem[]
  caption: string
  cefrFilter?: CefrLevel | 'all'
  posFilter?: string
  categoryFilter?: 'all' | 'content' | 'properNoun'
  limit?: number
}

const cefrColors: Record<CefrLevel, string> = {
  A1: 'bg-green-100 text-green-800 border-green-300',
  A2: 'bg-blue-100 text-blue-800 border-blue-300',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  B2: 'bg-orange-100 text-orange-800 border-orange-300',
  'pre-CEFR': 'bg-violet-100 text-violet-800 border-violet-300',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300'
}

function cefrLabel(level: CefrLevel, category?: string): string {
  if (category === 'properNoun' && level !== 'pre-CEFR') return '固有名詞'
  if (level === 'pre-CEFR') return '試験語彙'
  if (level === 'unknown') return '未分類'
  return level
}

function methodLabel(item: AggregatedVocabItem): React.ReactNode {
  if (item.category === 'properNoun' && item.cefrLevel === 'pre-CEFR') {
    return <span className="text-violet-600">試験語彙（国名形容詞等）</span>
  }
  if (item.category === 'properNoun') {
    return <span className="text-purple-600">NLP固有名詞検出</span>
  }
  if (item.resolvedVia) {
    return <span className="text-blue-600">語幹 &quot;{item.resolvedVia}&quot; で照合</span>
  }
  if (item.cefrLevel === 'pre-CEFR') {
    return <span className="text-violet-600">試験頻出語彙</span>
  }
  if (item.cefrLevel !== 'unknown') {
    return <span className="text-green-600">直接照合</span>
  }
  return <span className="text-gray-400">リスト外</span>
}

export default function VocabRankingTable({ rows, caption, cefrFilter = 'all', posFilter = 'all', categoryFilter = 'all', limit = 20 }: Props) {
  let filtered = rows
  if (categoryFilter !== 'all') {
    filtered = filtered.filter((row) => row.category === categoryFilter)
  }
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
        内容語のみ集計（機能語（冠詞・前置詞・接続詞など）は集計対象外）。固有名詞は別カテゴリとして分離。
      </p>
      <table className="w-full min-w-[750px] border-collapse bg-paper" role="table">
        <caption className="py-3 text-left font-bold">{caption}</caption>
        <thead className="bg-ink text-cream">
          <tr>
            <th scope="col" className="p-3 text-left">順位</th>
            <th scope="col" className="p-3 text-left">単語</th>
            <th scope="col" className="p-3 text-left">品詞</th>
            <th scope="col" className="p-3 text-left">CEFRレベル</th>
            <th scope="col" className="p-3 text-right">出現回数</th>
            <th scope="col" className="p-3 text-right">出現率</th>
            <th scope="col" className="p-3 text-left">判定根拠</th>
          </tr>
        </thead>
        <tbody>
          {display.map((row, index) => (
            <tr key={row.word} className="border-b-2 border-ink even:bg-blue/5">
              <td className="p-3">{index + 1}</td>
              <td className="p-3 font-bold font-mono">{row.word}</td>
              <td className="p-3">{row.posJa}</td>
              <td className="p-3">
                <span className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${
                  row.category === 'properNoun' && row.cefrLevel !== 'pre-CEFR'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : cefrColors[row.cefrLevel] ?? cefrColors.unknown
                }`}>
                  {cefrLabel(row.cefrLevel, row.category)}
                </span>
              </td>
              <td className="p-3 text-right tabular-nums">{row.count}</td>
              <td className="p-3 text-right tabular-nums">{row.rate}%</td>
              <td className="p-3 text-xs text-ink/60">
                {methodLabel(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
