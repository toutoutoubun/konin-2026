'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import FrequencyChart from '@/components/FrequencyChart'
import HistoryFilterPanel from '@/components/HistoryFilterPanel'
import HistoryPDFUploader from '@/components/HistoryPDFUploader'
import RankingTable from '@/components/RankingTable'
import {
  aggregateHistoryResults,
  filterHistoryResults,
  initialHistoryFilters,
  type HistoryFilters
} from '@/lib/historyScoreCalculator'
import type { HistoryAnalysisResult } from '@/lib/historyTagMapper'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const officialPastExamUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/1421021.htm'

const TOPIC_COLORS: Record<string, string> = {
  '古代文明': '#8B4513',
  '中世ヨーロッパ': '#4169E1',
  'イスラーム世界': '#2E8B57',
  '近世ヨーロッパ': '#DAA520',
  '産業革命・市民革命': '#FF6B35',
  '帝国主義・植民地': '#DC143C',
  '第一次世界大戦': '#708090',
  '戦間期': '#9370DB',
  '第二次世界大戦': '#2F4F4F',
  '冷戦': '#1A5CFF',
  '現代国際社会': '#20B2AA',
  'アジア近現代史': '#FF8C00',
  '環境・資源・人口': '#32CD32',
  '文化・宗教・交流': '#FFD166',
  '戦後日本': '#E91E63',
  '国民国家・市民革命': '#FF6B35',
  '近代化・産業革命': '#FF9800',
  '第一次世界大戦・民族運動': '#607D8B',
  '戦間期・第二次世界大戦': '#795548',
  '現代的課題（環境・人権・経済）': '#009688',
  '日本近現代史': '#F44336'
}

const ERA_COLORS: Record<string, string> = {
  '古代': '#8B4513',
  '中世': '#4169E1',
  '近世': '#DAA520',
  '近代': '#FF6B35',
  '現代': '#1A5CFF'
}

const REGION_COLORS: Record<string, string> = {
  'ヨーロッパ': '#1A5CFF',
  'アジア': '#FF6B35',
  'アフリカ': '#2E8B57',
  'アメリカ': '#9370DB',
  '中東': '#DAA520',
  '日本': '#E91E63'
}

export default function HistoryAnalysisPage() {
  const [results, setResults] = useState<HistoryAnalysisResult[]>([])
  const [filters, setFilters] = useState<HistoryFilters>(initialHistoryFilters)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  const filteredResults = useMemo(
    () => filterHistoryResults(results, filters),
    [results, filters]
  )
  const summary = useMemo(
    () => aggregateHistoryResults(filteredResults),
    [filteredResults]
  )
  const allSummary = useMemo(
    () => aggregateHistoryResults(results),
    [results]
  )

  const hasResults = results.length > 0
  const mixedRuleSets = summary.ruleSetCodes.length > 1

  /* ── チャートデータ ── */

  const unitChartData = summary.unitRanking
    .slice(0, 12)
    .map((row) => ({ name: row.unit, count: row.count }))

  const eraChartData = summary.eraRows.map((row) => ({
    name: row.era,
    count: row.count
  }))

  const regionChartData = summary.regionRows.map((row) => ({
    name: row.region,
    count: row.count
  }))

  const formatChartData = summary.formatRows.map((row) => ({
    name: row.format,
    count: row.count
  }))

  // 年度推移: 積み上げ棒グラフ用データ
  const trendChartData = useMemo(() => {
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      const sessionRows = summary.trendRows.filter((r) => r.session === session)
      for (const sr of sessionRows) {
        row[sr.unit] = (row[sr.unit] as number ?? 0) + sr.count
      }
      return row
    })
  }, [summary.trendRows])

  // 年度推移: 折れ線グラフ用データ
  const trendLineData = useMemo(() => {
    if (summary.trendRows.length === 0) return []
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      for (const l1 of summary.availableTopicL1) {
        const match = summary.trendRows.find(
          (r) => r.session === session && r.unit === l1
        )
        row[l1] = match?.count ?? 0
      }
      return row
    })
  }, [summary.trendRows, summary.availableTopicL1])

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>

      {/* ── ヘッダー ── */}
      <Header showSubjectDropdown={true} />

      {/* ── パンくずリスト ── */}
      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 lg:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a>
        <span aria-hidden="true">/</span>
        <a href="/analysis/">公式過去問PDF傾向分析</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">歴史頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 lg:px-10" tabIndex={-1}>
        {/* ── ヒーロー ── */}
        <section className="py-12 md:py-20" aria-labelledby="history-hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">HISTORY PAST EXAM ANALYZER</p>
          <h1 id="history-hero-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            <ruby>歴史<rt>れきし</rt></ruby>頻出分析
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            ユーザーが文科省公式ページから取得した歴史・世界史AのPDFを端末内で解析し、テーマ別・時代別・地域別・出題形式別の頻出傾向を可視化します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
          </p>
          <p className="mt-3 max-w-3xl">
            kuromoji.jsによる形態素解析とキーワード照合で、大テーマ（topic_l1）・小テーマ（topic_l2）・時代・地域・出題形式のタグを自動付与します。2024年度以降の新課程「歴史」と旧課程「世界史A」の両方に対応しています。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#history-upload-title">PDFを分析する</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式過去問PDFページへ</a>
          </div>
        </section>

        {/* ── PDF選択 ── */}
        <HistoryPDFUploader
          onComplete={(nextResults) => {
            setResults((prev) => {
              const existingNames = new Set(nextResults.map((r) => r.fileName))
              const kept = prev.filter((r) => !existingNames.has(r.fileName))
              return [...kept, ...nextResults]
            })
            setError('')
          }}
          onError={setError}
        />

        {/* ── エラー表示 ── */}
        {error && (
          <section className="panel mt-8 border-orange bg-paper p-6" aria-live="polite" aria-labelledby="history-error-title">
            <h2 id="history-error-title" className="font-mincho text-3xl font-bold">解析できませんでした</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">文科省公式ページから取得した歴史・世界史AのPDFを選び直してください。</p>
          </section>
        )}

        {/* ── 解析結果サマリー ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-status-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="history-status-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">解析結果</h2>
          {hasResults ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article key={`${result.fileName}-${result.analyzedAt}`} className="border-2 border-ink bg-cream p-4">
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>制度区分：{result.ruleSet.code}（{result.ruleSet.label}）</p>
                  <p>検出ブロック：{result.detectedBlocks.length > 0 ? result.detectedBlocks.join('、') : '自動検出'}</p>
                  <p>推定問題数：{result.questionCount}問</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.topicHits.slice(0, 6).map((hit) => (
                      <span key={hit.topic_l1} className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold">
                        {hit.topic_l1}
                        <span className="ml-1 text-xs font-normal text-ink/60">({hit.count})</span>
                      </span>
                    ))}
                  </div>
                  {result.formatTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.formatTags.map((tag) => (
                        <span key={tag} className="border-2 border-ink bg-blue/10 px-2 py-1 text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-2 border-ink bg-cream p-4">
              該当データはない：PDF解析後に、解析したファイル名・試験回・制度区分・テーマを表示します。
            </p>
          )}
          {mixedRuleSets && (
            <p className="mt-4 border-2 border-orange bg-paper p-4 font-bold">
              旧課程と新課程が混在しています。集計基準が異なるため単純比較に注意してください。
            </p>
          )}
        </section>

        {/* ── Section A: よく出るテーマランキング ── */}
        {hasResults && (
        <div className="mt-8">
          <HistoryFilterPanel
            value={filters}
            onChange={setFilters}
            availableTopicL1={allSummary.availableTopicL1}
            availableEras={allSummary.availableEras}
            availableRegions={allSummary.availableRegions}
            availableFormats={allSummary.availableFormats}
            resultCount={filteredResults.length}
            mixedRuleSets={mixedRuleSets}
          />
        </div>
        )}

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-ranking-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION A</p>
              <h2 id="history-ranking-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
                よく出るテーマランキング
              </h2>
              <p className="mt-3 max-w-3xl">
                大テーマ（topic_l1）単位で集計した、出現回数・出現率によるランキングです。
              </p>
            </div>
            <div className="flex gap-3" role="group" aria-label="表示形式を切り替える">
              <button
                className={`hard-button px-4 py-2 ${viewMode === 'table' ? 'bg-blue text-white' : 'bg-paper'}`}
                type="button"
                aria-pressed={viewMode === 'table'}
                onClick={() => setViewMode('table')}
              >
                表
              </button>
              <button
                className={`hard-button px-4 py-2 ${viewMode === 'chart' ? 'bg-blue text-white' : 'bg-paper'}`}
                type="button"
                aria-pressed={viewMode === 'chart'}
                onClick={() => setViewMode('chart')}
              >
                グラフ
              </button>
            </div>
          </div>
          {viewMode === 'table' ? (
            <RankingTable rows={summary.unitRanking} caption="大テーマ（topic_l1）ごとの頻出ランキング。順位、単元、出現回数、出現率。" />
          ) : (
            <FrequencyChart data={unitChartData} xKey="name" yKey="count" label="よく出るテーマランキングの棒グラフ" color="#1A5CFF" />
          )}
          {viewMode === 'chart' && summary.unitRanking.length > 0 && (
            <div className="mt-6">
              <RankingTable rows={summary.unitRanking} caption="グラフと同一データの表。順位、単元、出現回数、出現率。" />
            </div>
          )}
        </section>

        {/* ── Section B: 近年頻出ランキング ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
          <h2 id="history-recent-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            近年頻出ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            recent_weighted_score = &Sigma;(出現回数 &times; session_weight)。最新回 1.0、一つ前 0.8、二つ前 0.6、三つ前 0.4、それ以前 0.2 で算出します。
          </p>
          <div className="mt-5">
            <RankingTable rows={[]} kind="recent" recentRows={summary.recentRanking} caption="近年頻出ランキング。重み付きスコアと直近の出現を表示。" />
          </div>
        </section>

        {/* ── Section C: 時代別出題分布 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-era-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="history-era-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            時代別出題分布
          </h2>
          <p className="mt-3 max-w-3xl">古代・中世・近世・近代・現代の各時代でどれだけ出題されているかを表示します。</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <div className="panel h-[320px] p-4" role="img" aria-label="時代別出題分布の棒グラフ">
              {eraChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eraChartData} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
                    <XAxis dataKey="name" interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" stroke="#1A1A1A" strokeWidth={2}>
                      {eraChartData.map((entry) => (
                        <rect key={entry.name} fill={ERA_COLORS[entry.name] ?? '#999'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">該当データはない：PDF解析後にグラフを表示します。</div>
              )}
            </div>
            <div className="overflow-x-auto" role="region" aria-label="時代別出題分布表" tabIndex={0}>
              <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">時代、出現回数、構成比。</caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">時代</th>
                    <th scope="col" className="p-3 text-right">出現回数</th>
                    <th scope="col" className="p-3 text-right">構成比</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.eraRows.length > 0 ? (
                    summary.eraRows.map((row) => (
                      <tr key={row.era} className="border-b-2 border-ink even:bg-blue/5">
                        <td className="p-3 font-bold">{row.era}</td>
                        <td className="p-3 text-right">{row.count}</td>
                        <td className="p-3 text-right">{row.rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="p-3">該当データはない</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section D: 地域別出題分布 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-region-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="history-region-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            地域別出題分布
          </h2>
          <p className="mt-3 max-w-3xl">ヨーロッパ・アジア・アフリカ・アメリカ・中東・日本の各地域での出題分布を表示します。</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <div className="panel h-[320px] p-4" role="img" aria-label="地域別出題分布の棒グラフ">
              {regionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionChartData} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
                    <XAxis dataKey="name" interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" stroke="#1A1A1A" strokeWidth={2}>
                      {regionChartData.map((entry) => (
                        <rect key={entry.name} fill={REGION_COLORS[entry.name] ?? '#999'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">該当データはない：PDF解析後にグラフを表示します。</div>
              )}
            </div>
            <div className="overflow-x-auto" role="region" aria-label="地域別出題分布表" tabIndex={0}>
              <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">地域、出現回数、構成比。</caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">地域</th>
                    <th scope="col" className="p-3 text-right">出現回数</th>
                    <th scope="col" className="p-3 text-right">構成比</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.regionRows.length > 0 ? (
                    summary.regionRows.map((row) => (
                      <tr key={row.region} className="border-b-2 border-ink even:bg-blue/5">
                        <td className="p-3 font-bold">{row.region}</td>
                        <td className="p-3 text-right">{row.count}</td>
                        <td className="p-3 text-right">{row.rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="p-3">該当データはない</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section E: 出題形式分布 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-format-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION E</p>
          <h2 id="history-format-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            出題形式分布
          </h2>
          <p className="mt-3 max-w-3xl">空欄補充、正誤判定、年代順並び替え、資料読解、会話文読解、探究活動型など、出題形式ごとの分布を表示します。</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <FrequencyChart data={formatChartData} xKey="name" yKey="count" label="出題形式分布の棒グラフ" color="#FF6B35" />
            <div className="overflow-x-auto" role="region" aria-label="出題形式分布表" tabIndex={0}>
              <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">出題形式、件数、構成比。</caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">出題形式</th>
                    <th scope="col" className="p-3 text-right">件数</th>
                    <th scope="col" className="p-3 text-right">構成比</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.formatRows.length > 0 ? (
                    summary.formatRows.map((row) => (
                      <tr key={row.format} className="border-b-2 border-ink even:bg-blue/5">
                        <td className="p-3 font-bold">{row.format}</td>
                        <td className="p-3 text-right">{row.count}</td>
                        <td className="p-3 text-right">{row.rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="p-3">該当データはない</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section F: 年度推移 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION F</p>
          <h2 id="history-trend-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            年度推移
          </h2>
          <p className="mt-3 max-w-3xl">各試験回ごとの出題テーマ数を時系列で表示します。積み上げ棒グラフと折れ線グラフで傾向を確認できます。</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* 積み上げ棒グラフ */}
            <TrendStackedBar data={trendChartData} availableL1={summary.availableTopicL1} />
            {/* 折れ線グラフ */}
            <TrendLineChart data={trendLineData} availableL1={summary.availableTopicL1} />
          </div>
          {/* 年度推移テーブル（アクセシビリティ用） */}
          <div className="mt-6 overflow-x-auto" role="region" aria-label="年度推移表" tabIndex={0}>
            <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">年度推移グラフと同一データの表。</caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">試験回</th>
                  <th scope="col" className="p-3 text-left">テーマ</th>
                  <th scope="col" className="p-3 text-right">出現回数</th>
                  <th scope="col" className="p-3 text-left">制度区分</th>
                </tr>
              </thead>
              <tbody>
                {summary.trendRows.length > 0 ? (
                  summary.trendRows.map((row, index) => (
                    <tr key={`${row.session}-${row.unit}-${index}`} className="border-b-2 border-ink even:bg-blue/5">
                      <td className="p-3">{row.session}</td>
                      <td className="p-3 font-bold">{row.unit}</td>
                      <td className="p-3 text-right">{row.count}</td>
                      <td className="p-3 text-sm">{row.ruleSet}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-3">該当データはない</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section G: フィルタ ── */}
        {/* ── 注記とタグ定義 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="history-meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NOTES</p>
          <h2 id="history-meta-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            注記とタグ定義
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">集計情報</h3>
              <p className="mt-3">全解析ファイル：{allSummary.totalCount}件</p>
              <p>表示中：{summary.totalCount}件</p>
              <p>検出テーマ：{allSummary.availableTopicL1.length}種類</p>
              <p>制度区分：{allSummary.ruleSetCodes.join('、') || '未解析'}</p>
              <p className="mt-3 text-sm">
                端末内で抽出した出題傾向データを集計するツールです。問題文・設問文など著作物の表現は保存・再掲載せず、テーマの検出精度はPDFのテキスト抽出結果とキーワード辞書に依存します。
              </p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">制度区分について</h3>
              <p className="mt-3">
                <span className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold">HIST_OLD</span>
                <span className="ml-2">旧課程：世界史A（2014〜2023年度）</span>
              </p>
              <p className="mt-2">
                <span className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold">HIST_NEW</span>
                <span className="ml-2">新課程：歴史（2024年度〜）</span>
              </p>
              <p className="mt-3 text-sm">
                2024年度（令和6年度）第1回より科目名・構成が変更されています。制度区分をまたいだ単純比較にはご注意ください。
              </p>
            </div>
          </div>
          <p className="mt-5">
            <a className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline" href="/tags/">タグ定義を見る</a>
          </p>
        </section>
      </main>

      {/* ── フッター ── */}
      <SiteFooter />
    </>
  )
}

/* ── 年度推移チャート: 積み上げ棒グラフ ── */

function TrendStackedBar({ data, availableL1 }: { data: Record<string, string | number>[]; availableL1: string[] }) {
  if (!data.length) {
    return (
      <div className="border-2 border-ink bg-cream p-6" role="img" aria-label="年度推移の積み上げ棒グラフ。該当データはない">
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-paper p-4" style={{ height: 400 }} role="img" aria-label="年度推移の積み上げ棒グラフ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
          <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
          <XAxis dataKey="session" interval={0} angle={-18} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {availableL1.slice(0, 10).map((l1) => (
            <Bar key={l1} dataKey={l1} stackId="trend" fill={TOPIC_COLORS[l1] ?? '#999'} stroke="#1A1A1A" strokeWidth={1} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── 年度推移チャート: 折れ線グラフ ── */

function TrendLineChart({ data, availableL1 }: { data: Record<string, string | number>[]; availableL1: string[] }) {
  if (!data.length) {
    return (
      <div className="border-2 border-ink bg-cream p-6" role="img" aria-label="年度推移の折れ線グラフ。該当データはない">
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-paper p-4" style={{ height: 400 }} role="img" aria-label="年度推移の折れ線グラフ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
          <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
          <XAxis dataKey="session" interval={0} angle={-18} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {availableL1.slice(0, 8).map((l1) => (
            <Line key={l1} type="monotone" dataKey={l1} stroke={TOPIC_COLORS[l1] ?? '#999'} strokeWidth={2} dot={{ r: 3, fill: TOPIC_COLORS[l1] ?? '#999' }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
