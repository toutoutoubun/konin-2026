'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/Header'
import FrequencyChart from '@/components/FrequencyChart'
import GeographyFilterPanel from '@/components/GeographyFilterPanel'
import GeographyPDFUploader from '@/components/GeographyPDFUploader'
import RankingTable from '@/components/RankingTable'
import {
  aggregateGeoResults,
  filterGeoResults,
  initialGeoFilters,
  type GeoFilters
} from '@/lib/geographyScoreCalculator'
import type { GeoAnalysisResult } from '@/lib/geographyTagMapper'
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
  '地図・GIS・現代世界': '#1A5CFF',
  '生活文化の多様性': '#FF6B35',
  '生活文化の多様性と国際理解': '#FF6B35',
  '地球的課題': '#2E8B57',
  '地球的課題と国際協力': '#2E8B57',
  '自然環境と防災': '#DAA520',
  '生活圏の地理的課題と地域調査': '#9370DB',
  '生活圏の調査と地域の展望': '#9370DB',
  '地理情報・地図': '#1A5CFF',
  '自然環境・資源・産業': '#20B2AA',
  '人口・都市・生活文化・民族宗教': '#FF8C00',
  '現代世界の諸地域': '#DC143C',
  '現代世界と日本': '#E91E63'
}

const REGION_COLORS: Record<string, string> = {
  '日本': '#E91E63',
  '東アジア': '#FF6B35',
  '東南アジア': '#FF8C00',
  '南アジア': '#DAA520',
  '中東': '#8B4513',
  'ヨーロッパ': '#1A5CFF',
  'アフリカ': '#2E8B57',
  '北アメリカ': '#9370DB',
  '南アメリカ': '#20B2AA',
  'オセアニア': '#4169E1'
}

export default function GeographyAnalysisPage() {
  const [results, setResults] = useState<GeoAnalysisResult[]>([])
  const [filters, setFilters] = useState<GeoFilters>(initialGeoFilters)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  const filteredResults = useMemo(
    () => filterGeoResults(results, filters),
    [results, filters]
  )
  const summary = useMemo(
    () => aggregateGeoResults(filteredResults),
    [filteredResults]
  )
  const allSummary = useMemo(
    () => aggregateGeoResults(results),
    [results]
  )

  const hasResults = results.length > 0
  const mixedRuleSets = summary.ruleSetCodes.length > 1
  const mixedSubjects =
    summary.detectedSubjects.includes('地理A') &&
    summary.detectedSubjects.includes('地理B')

  /* ── チャートデータ ── */

  const unitChartData = summary.unitRanking
    .slice(0, 12)
    .map((row) => ({ name: row.unit, count: row.count }))

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
      <Header navItems={[
        { label: 'ツール一覧', href: '/#tools' },
        { label: 'PDF選択', href: '#geo-upload-title' },
        { label: '集計', href: '#geo-ranking-title' },
        { label: 'フィルタ', href: '#geo-filter-title' },
        { label: 'タグ定義', href: '/tags/' },
        { label: '更新履歴', href: '/updates/' },
      ]} />

      {/* ── パンくずリスト ── */}
      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a>
        <span aria-hidden="true">/</span>
        <a href="/#tools">ツール一覧</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">地理頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        {/* ── ヒーロー ── */}
        <section className="py-12 md:py-20" aria-labelledby="geo-hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">GEOGRAPHY PAST EXAM ANALYZER</p>
          <h1 id="geo-hero-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            <ruby>地理<rt>ちり</rt></ruby>頻出分析
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            ユーザーが文科省公式ページから取得した地理・地理A・地理BのPDFを端末内で解析し、大問別・テーマ別・地域別・出題形式別の頻出傾向を可視化します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
          </p>
          <p className="mt-3 max-w-3xl">
            キーワード照合で大テーマ（topic_l1）・小テーマ（topic_l2）・地域・出題形式のタグを自動付与します。2024年度以降の新課程「地理」と旧課程「地理A」「地理B」の両方に対応しています。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#geo-upload-title">PDFを分析する</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページへ</a>
          </div>
        </section>

        {/* ── PDF選択 ── */}
        <GeographyPDFUploader
          onComplete={(nextResults) => {
            setResults((prev) => {
              const existingNames = new Set(nextResults.map((r) => r.fileName))
              const kept = prev.filter((r) => !existingNames.has(r.fileName))
              return [...kept, ...nextResults]
            })
            setFilters(initialGeoFilters)
            setError('')
          }}
          onError={setError}
        />

        {/* ── エラー表示 ── */}
        {error && (
          <section className="panel mt-8 border-orange bg-paper p-6" aria-live="polite" aria-labelledby="geo-error-title">
            <h2 id="geo-error-title" className="font-mincho text-3xl font-bold">解析できませんでした</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">文科省公式ページから取得した地理・地理A・地理BのPDFを選び直してください。</p>
          </section>
        )}

        {/* ── 解析結果サマリー ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-status-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="geo-status-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">解析結果</h2>
          {hasResults ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article key={`${result.fileName}-${result.analyzedAt}`} className="border-2 border-ink bg-cream p-4">
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>科目名：{result.detectedSubject ?? '未検出'}</p>
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
              該当データはない：PDF解析後に、解析したファイル名・試験回・科目名・制度区分・テーマを表示します。
            </p>
          )}
          {mixedRuleSets && (
            <p className="mt-4 border-2 border-orange bg-paper p-4 font-bold">
              旧課程と新課程が混在しています。集計基準が異なるため単純比較に注意してください。
            </p>
          )}
          {mixedSubjects && (
            <p className="mt-4 border-2 border-orange bg-paper p-4 font-bold">
              地理Aと地理Bが混在しています。科目フィルタで分離して確認することを推奨します。
            </p>
          )}
        </section>

        {/* ── Section A: よく出るテーマランキング ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-ranking-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION A</p>
              <h2 id="geo-ranking-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
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
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
          <h2 id="geo-recent-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            近年頻出ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            recent_weighted_score = &Sigma;(出現回数 &times; session_weight)。最新回 1.0、一つ前 0.8、二つ前 0.6、三つ前 0.4、それ以前 0.2 で算出します。
          </p>
          <div className="mt-5">
            <RankingTable rows={[]} kind="recent" recentRows={summary.recentRanking} caption="近年頻出ランキング。重み付きスコアと直近の出現を表示。" />
          </div>
        </section>

        {/* ── Section C: 地域別出題分布 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-region-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="geo-region-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            地域別出題分布
          </h2>
          <p className="mt-3 max-w-3xl">日本・東アジア・東南アジア・南アジア・中東・ヨーロッパ・アフリカ・北アメリカ・南アメリカ・オセアニアの各地域での出題分布を表示します。</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <div className="panel h-[360px] p-4" role="img" aria-label="地域別出題分布の棒グラフ">
              {regionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionChartData} margin={{ top: 16, right: 20, bottom: 48, left: 0 }}>
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
                    <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
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

        {/* ── Section D: 出題形式分布 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-format-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="geo-format-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            出題形式分布
          </h2>
          <p className="mt-3 max-w-3xl">地図読解、グラフ読解、表の読み取り、会話文型、レポート型、地域調査型、防災判断型、空欄補充、正誤判定、写真・景観読解など、出題形式ごとの分布を表示します。</p>
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

        {/* ── Section E: 年度推移 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION E</p>
          <h2 id="geo-trend-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
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

        {/* ── Section F: フィルタ ── */}
        <div className="mt-8">
          <GeographyFilterPanel
            value={filters}
            onChange={setFilters}
            availableTopicL1={allSummary.availableTopicL1}
            availableRegions={allSummary.availableRegions}
            availableFormats={allSummary.availableFormats}
            detectedSubjects={allSummary.detectedSubjects}
            resultCount={filteredResults.length}
            mixedRuleSets={mixedRuleSets}
            mixedSubjects={mixedSubjects}
          />
        </div>

        {/* ── 注記とタグ定義 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="geo-meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NOTES</p>
          <h2 id="geo-meta-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            注記とタグ定義
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">集計情報</h3>
              <p className="mt-3">全解析ファイル：{allSummary.totalCount}件</p>
              <p>表示中：{summary.totalCount}件</p>
              <p>検出テーマ：{allSummary.availableTopicL1.length}種類</p>
              <p>検出地域：{allSummary.availableRegions.length}地域</p>
              <p>制度区分：{allSummary.ruleSetCodes.join('、') || '未解析'}</p>
              {allSummary.detectedSubjects.length > 0 && (
                <p>検出科目：{allSummary.detectedSubjects.join('、')}</p>
              )}
              <p className="mt-3 text-sm">
                端末内で抽出した出題傾向データを集計するツールです。問題文・設問文など著作物の表現は保存・再掲載せず、テーマの検出精度はPDFのテキスト抽出結果とキーワード辞書に依存します。
              </p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">制度区分について</h3>
              <p className="mt-3">
                <span className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold">GEO_OLD</span>
                <span className="ml-2">旧課程：地理A・地理B（2020〜2023年度）</span>
              </p>
              <p className="mt-2">
                <span className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold">GEO_NEW</span>
                <span className="ml-2">新課程：地理（2024年度〜）</span>
              </p>
              <p className="mt-3 text-sm">
                2024年度（令和6年度）第1回より科目構造が変更されています。旧課程では地理Aと地理Bから1科目選択、新課程では地理総合型に一本化されています。制度区分をまたいだ単純比較にはご注意ください。
              </p>
            </div>
          </div>
          <p className="mt-5">
            <a className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline" href="/tags/">タグ定義を見る</a>
          </p>
        </section>
      </main>

      {/* ── フッター ── */}
      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 md:px-10">
        <div className="mx-auto max-w-7xl space-y-2">
          <p><strong>更新日</strong> 2026-05-02</p>
          <p><strong>データ範囲</strong> ユーザーが正当に取得し、端末内で選択した文部科学省公式PDF。問題文・設問文の配布や再掲載は行いません。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
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
