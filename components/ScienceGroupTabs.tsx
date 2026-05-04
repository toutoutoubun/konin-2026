'use client'

import { useState } from 'react'
import type { RankingRow, RecentRankingRow } from '@/lib/scienceScoreCalculator'
import type { SciGroupName } from '@/lib/scienceTagMapper'
import FrequencyChart from './FrequencyChart'

const GROUP_TABS: { key: SciGroupName; label: string; en: string }[] = [
  { key: '物理系', label: '物理系', en: 'Physics' },
  { key: '化学系', label: '化学系', en: 'Chemistry' },
  { key: '生物系', label: '生物系', en: 'Biology' },
  { key: '地学系', label: '地学系', en: 'Earth Sci.' }
]

const GROUP_COLORS: Record<SciGroupName, string> = {
  '物理系': '#1A5CFF',
  '化学系': '#FF6B35',
  '生物系': '#2E8B57',
  '地学系': '#9370DB'
}

type Props = {
  mode: 'ranking' | 'recent'
  groupRankings: Record<SciGroupName, RankingRow[]>
  groupRecentRankings?: Record<SciGroupName, RecentRankingRow[]>
  caption: string
  idPrefix?: string
}

export default function ScienceGroupTabs({
  mode,
  groupRankings,
  groupRecentRankings,
  caption,
  idPrefix = 'sci'
}: Props) {
  const [activeGroup, setActiveGroup] = useState<SciGroupName>('物理系')

  const currentRows = groupRankings[activeGroup] ?? []
  const currentRecentRows = groupRecentRankings?.[activeGroup] ?? []
  const chartData = currentRows.map((r) => ({ name: r.unit, count: r.count }))

  return (
    <div>
      {/* タブ切替 */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="分野切替">
        {GROUP_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeGroup === tab.key}
            aria-controls={`${idPrefix}-tab-panel-${tab.key}`}
            id={`${idPrefix}-tab-${tab.key}`}
            className={`hard-button px-4 py-2 text-sm sm:px-5 sm:text-base ${
              activeGroup === tab.key
                ? 'bg-blue text-white'
                : 'bg-paper'
            }`}
            onClick={() => setActiveGroup(tab.key)}
          >
            <span className="font-serifDisplay text-xs tracking-wider">{tab.en}</span>
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブパネル */}
      <div
        id={`${idPrefix}-tab-panel-${activeGroup}`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${activeGroup}`}
        className="mt-5"
      >
        <p className="mb-4 border-2 border-ink bg-cream p-3 text-sm">
          各分野から1題を選択する試験です。分野ごとに分離して集計しています。
        </p>

        {mode === 'ranking' ? (
          <>
            {/* グラフ */}
            {chartData.length > 0 && (
              <FrequencyChart
                data={chartData}
                xKey="name"
                yKey="count"
                label={`${activeGroup}の頻出単元グラフ`}
                color={GROUP_COLORS[activeGroup]}
              />
            )}

            {/* 表 */}
            <div className="mt-5 overflow-x-auto" role="region" aria-label={`${activeGroup}${caption}`} tabIndex={0}>
              <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">
                  {activeGroup}：{caption}
                </caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">順位</th>
                    <th scope="col" className="p-3 text-left">単元</th>
                    <th scope="col" className="p-3 text-right">出現回数</th>
                    <th scope="col" className="p-3 text-right">出現率</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((row, index) => (
                      <tr key={row.unit} className="border-b-2 border-ink even:bg-blue/5">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-bold">{row.unit}</td>
                        <td className="p-3 text-right">{row.count}</td>
                        <td className="p-3 text-right">{row.rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3">該当データはない：PDF解析後に表示します。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* 近年頻出モード */
          <div className="overflow-x-auto" role="region" aria-label={`${activeGroup}の近年頻出ランキング`} tabIndex={0}>
            <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">
                {activeGroup}：近年頻出ランキング。重み付きスコアと直近の出現。
              </caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">順位</th>
                  <th scope="col" className="p-3 text-left">単元</th>
                  <th scope="col" className="p-3 text-right">重み付きスコア</th>
                  <th scope="col" className="p-3 text-left">直近の出現</th>
                </tr>
              </thead>
              <tbody>
                {currentRecentRows.length > 0 ? (
                  currentRecentRows.map((row, index) => (
                    <tr key={row.unit} className="border-b-2 border-ink even:bg-blue/5">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-bold">{row.unit}</td>
                      <td className="p-3 text-right">{row.score}</td>
                      <td className="p-3">{row.latestSession}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3">該当データはない：PDF解析後に表示します。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
