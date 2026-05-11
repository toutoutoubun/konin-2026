'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/Header'
import FrequencyChart from '@/components/FrequencyChart'
import MathFilterPanel from '@/components/MathFilterPanel'
import MathPDFUploader from '@/components/MathPDFUploader'
import RankingTable from '@/components/RankingTable'
import {
  aggregateMathResults,
  filterMathResults,
  initialMathFilters,
  type MathFilters
} from '@/lib/mathScoreCalculator'
import type { MathAnalysisResult } from '@/lib/mathTagMapper'
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

const officialPastExamUrl =
  'https://www.mext.go.jp/a_menu/koutou/shiken/1421021.htm'

const L1_COLORS: Record<string, string> = {
  '数と式': '#1A5CFF',
  '方程式・不等式': '#FF6B35',
  '二次関数': '#FFD166',
  '二次関数応用': '#22C55E',
  '図形と計量': '#A855F7',
  'データの分析': '#EC4899'
}

export default function MathAnalysisPage() {
  const [results, setResults] = useState<MathAnalysisResult[]>([])
  const [filters, setFilters] = useState<MathFilters>(initialMathFilters)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  const filteredResults = useMemo(
    () => filterMathResults(results, filters),
    [results, filters]
  )
  const summary = useMemo(
    () => aggregateMathResults(filteredResults),
    [filteredResults]
  )
  const allSummary = useMemo(() => aggregateMathResults(results), [results])

  const hasResults = results.length > 0

  // Section A: よく出る単元 (topic_l1) チャートデータ
  const unitChartData = summary.unitRanking
    .slice(0, 10)
    .map((row) => ({ name: row.unit, count: row.count }))

  // Section C: 大問別分布チャートデータ
  const blockChartData = summary.blockDistribution.map((row) => ({
    name: `${row.block}\n${row.topic_l1}`,
    count: row.count
  }))

  // Section D: 年度推移チャートデータ
  const trendChartData = useMemo(() => {
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      const sessionRows = summary.trendRows.filter(
        (r) => r.session === session
      )
      for (const sr of sessionRows) {
        row[sr.unit] = sr.count
      }
      return row
    })
  }, [summary.trendRows])

  // Section D: ライン用データ（年度×topic_l1 の出現回数）
  const trendLineData = useMemo(() => {
    if (summary.trendRows.length === 0) return []
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      for (const l1 of summary.availableL1) {
        const match = summary.trendRows.find(
          (r) => r.session === session && r.unit === l1
        )
        row[l1] = match?.count ?? 0
      }
      return row
    })
  }, [summary.trendRows, summary.availableL1])

  return (
    <>
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>

      {/* ── ヘッダー ── */}
      <Header navItems={[
        { label: 'ツール一覧', href: '/#tools' },
        { label: 'PDF選択', href: '#math-upload-title' },
        { label: '集計', href: '#math-ranking-title' },
        { label: 'フィルタ', href: '#math-filter-title' },
        { label: 'タグ定義', href: '/tags/' },
        { label: '更新履歴', href: '/updates/' },
      ]} />

      {/* ── パンくずリスト ── */}
      <nav
        className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10"
        aria-label="パンくずリスト"
      >
        <a href="/">トップ</a>
        <span aria-hidden="true">/</span>
        <a href="/#tools">ツール一覧</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">数学頻出分析</span>
      </nav>

      <main
        id="main-content"
        className="mx-auto max-w-7xl px-4 pb-20 md:px-10"
        tabIndex={-1}
      >
        {/* ── ヒーロー ── */}
        <section className="py-12 md:py-20" aria-labelledby="math-hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">
            MATH PAST EXAM ANALYZER
          </p>
          <h1
            id="math-hero-title"
            className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl"
          >
            <ruby>
              数学<rt>すうがく</rt>
            </ruby>
            頻出分析
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            ユーザーが文科省公式ページから取得した数学PDFを端末内で解析し、大問（第1問〜第6問）ごとの出題単元と年度推移を可視化します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
          </p>
          <p className="mt-3 max-w-3xl">
            数学PDFは数式部分がCIDコードとして抽出されるため、数式のテキスト解析は行いません。正常に抽出できるテキストとページ位置で大問単位の集計を行います。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a
              className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline"
              href="#math-upload-title"
            >
              PDFを分析する
            </a>
            <a
              className="hard-button button-like bg-paper px-5 py-3 text-center no-underline"
              href={officialPastExamUrl}
              target="_blank"
              rel="noopener"
            >
              文科省公式PDFページへ
            </a>
          </div>
        </section>

        {/* ── PDF選択 ── */}
        <MathPDFUploader
          onComplete={(nextResults) => {
            setResults((prev) => {
              const existingNames = new Set(
                nextResults.map((r) => r.fileName)
              )
              const kept = prev.filter(
                (r) => !existingNames.has(r.fileName)
              )
              return [...kept, ...nextResults]
            })
            setFilters(initialMathFilters)
            setError('')
          }}
          onError={setError}
        />

        {/* ── エラー表示 ── */}
        {error && (
          <section
            className="panel mt-8 border-orange bg-paper p-6"
            aria-live="polite"
            aria-labelledby="math-error-title"
          >
            <h2
              id="math-error-title"
              className="font-mincho text-3xl font-bold"
            >
              解析できませんでした
            </h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">
              文科省公式ページから取得した数学PDFを選び直してください。
            </p>
          </section>
        )}

        {/* ── 解析結果サマリー ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-status-title"
          aria-live="polite"
        >
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
            ANALYSIS STATUS
          </p>
          <h2
            id="math-status-title"
            className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl"
          >
            解析結果
          </h2>
          {hasResults ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article
                  key={`${result.fileName}-${result.analyzedAt}`}
                  className="border-2 border-ink bg-cream p-4"
                >
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>
                    検出した試験回：{result.examSession}
                  </p>
                  <p>
                    ページ数：{result.pageCount}（問題：
                    {result.questionPages}、スキップ：
                    {result.blankPages + result.coverPages + (result.answerPages ?? 0)}）
                  </p>
                  {result.cidHeavyPages > 0 && (
                    <p>
                      数式のみのページ: {result.cidHeavyPages}ページ（対象外）
                    </p>
                  )}
                  {result.blankPages > 0 && (
                    <p>
                      計算用ページをスキップしました: {result.blankPages}ページ
                    </p>
                  )}
                  <p>
                    検出ブロック：{result.detectedBlocks.length}件
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.detectedBlocks.map((block) => (
                      <span
                        key={block.blockNumber}
                        className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold"
                      >
                        {block.blockLabel}：{block.topic_l1}
                        <span className="ml-1 text-xs font-normal text-ink/60">
                          ({block.method})
                        </span>
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-2 border-ink bg-cream p-4">
              該当データはない：PDF解析後に、解析したファイル名・試験回・大問構造を表示します。
            </p>
          )}
        </section>

        {/* ── Section A: よく出る単元ランキング ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-ranking-title"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
                SECTION A
              </p>
              <h2
                id="math-ranking-title"
                className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl"
              >
                よく出る単元ランキング
              </h2>
              <p className="mt-3 max-w-3xl">
                大分類（topic_l1）単位で集計した、出現回数・出現率によるランキングです。
              </p>
            </div>
            <div
              className="flex gap-3"
              role="group"
              aria-label="表示形式を切り替える"
            >
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
            <RankingTable
              rows={summary.unitRanking}
              caption="大分類（topic_l1）ごとの頻出ランキング。順位、単元、出現回数、出現率。"
            />
          ) : (
            <FrequencyChart
              data={unitChartData}
              xKey="name"
              yKey="count"
              label="よく出る単元ランキングの棒グラフ"
              color="#FF6B35"
            />
          )}
          {/* グラフ表示時にも表を併記（アクセシビリティ：色だけに依存しない） */}
          {viewMode === 'chart' && summary.unitRanking.length > 0 && (
            <div className="mt-6">
              <RankingTable
                rows={summary.unitRanking}
                caption="グラフと同一データの表。順位、単元、出現回数、出現率。"
              />
            </div>
          )}
        </section>

        {/* ── Section B: 近年重み付きランキング ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-recent-title"
        >
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
            SECTION B
          </p>
          <h2
            id="math-recent-title"
            className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl"
          >
            近年頻出ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            recent_weighted_score = &Sigma;(出現回数 &times; session_weight)。最新回
            1.0、一つ前 0.8、二つ前 0.6、三つ前 0.4、それ以前 0.2 で算出します。
          </p>
          <div className="mt-5">
            <RankingTable
              rows={[]}
              kind="recent"
              recentRows={summary.recentRanking}
              caption="近年頻出ランキング。重み付きスコアと直近の出現を表示。"
            />
          </div>
        </section>

        {/* ── Section C: 大問別分布 ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-block-title"
        >
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
            SECTION C
          </p>
          <h2
            id="math-block-title"
            className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl"
          >
            大問別出題分布
          </h2>
          <p className="mt-3 max-w-3xl">
            第1問〜第6問ごとの出現回数と構成比を表示します。
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <FrequencyChart
              data={blockChartData}
              xKey="name"
              yKey="count"
              label="大問別分布の棒グラフ"
              color="#1A5CFF"
            />
            <div
              className="overflow-x-auto"
              role="region"
              aria-label="大問別分布表"
              tabIndex={0}
            >
              <table
                className="w-full min-w-[520px] border-collapse bg-paper"
                role="table"
              >
                <caption className="py-3 text-left font-bold">
                  大問、単元、出現回数、構成比。
                </caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">大問</th>
                    <th scope="col" className="p-3 text-left">単元</th>
                    <th scope="col" className="p-3 text-right">出現回数</th>
                    <th scope="col" className="p-3 text-right">構成比</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.blockDistribution.length > 0 ? (
                    summary.blockDistribution.map((row) => (
                      <tr
                        key={row.block}
                        className="border-b-2 border-ink even:bg-blue/5"
                      >
                        <td className="p-3 font-bold">{row.block}</td>
                        <td className="p-3">{row.topic_l1}</td>
                        <td className="p-3 text-right">{row.count}</td>
                        <td className="p-3 text-right">{row.rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3">該当データはない</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section D: 年度推移 ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-trend-title"
        >
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
            SECTION D
          </p>
          <h2
            id="math-trend-title"
            className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl"
          >
            年度推移
          </h2>
          <p className="mt-3 max-w-3xl">
            各試験回ごとの出題単元数を時系列で表示します。積み上げ棒グラフと折れ線グラフで傾向を確認できます。
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* 積み上げ棒グラフ */}
            <TrendStackedBar
              data={trendChartData}
              availableL1={summary.availableL1}
            />
            {/* 折れ線グラフ */}
            <TrendLineChart
              data={trendLineData}
              availableL1={summary.availableL1}
            />
          </div>
          {/* 年度推移テーブル（アクセシビリティ用） */}
          <div
            className="mt-6 overflow-x-auto"
            role="region"
            aria-label="年度推移表"
            tabIndex={0}
          >
            <table
              className="w-full min-w-[520px] border-collapse bg-paper"
              role="table"
            >
              <caption className="py-3 text-left font-bold">
                年度推移グラフと同一データの表。
              </caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">試験回</th>
                  <th scope="col" className="p-3 text-left">単元</th>
                  <th scope="col" className="p-3 text-right">出現回数</th>
                </tr>
              </thead>
              <tbody>
                {summary.trendRows.length > 0 ? (
                  summary.trendRows.map((row, index) => (
                    <tr
                      key={`${row.session}-${row.unit}-${index}`}
                      className="border-b-2 border-ink even:bg-blue/5"
                    >
                      <td className="p-3">{row.session}</td>
                      <td className="p-3 font-bold">{row.unit}</td>
                      <td className="p-3 text-right">{row.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-3">該当データはない</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section E: フィルタ ── */}
        <div className="mt-8">
          <MathFilterPanel
            value={filters}
            onChange={setFilters}
            availableBlocks={allSummary.availableBlocks}
            availableL1={allSummary.availableL1}
            availableL2={allSummary.availableL2}
            resultCount={filteredResults.length}
          />
        </div>

        {/* ── Section F: 解析対象外件数 + 注記 ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-meta-title"
        >
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
            SECTION F
          </p>
          <h2
            id="math-meta-title"
            className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl"
          >
            注記とタグ定義
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">解析対象外ページ</h3>
              <p className="mt-3">
                <span className="text-3xl font-bold text-orange">
                  {allSummary.totalCidHeavyPages}
                </span>
                <span className="ml-2">
                  ページ — 数式のみのページ（解析対象外）
                </span>
              </p>
              <p className="mt-2">
                <span className="text-3xl font-bold text-blue">
                  {allSummary.totalBlankPages}
                </span>
                <span className="ml-2">
                  ページ — 計算用余白ページ（スキップ）
                </span>
              </p>
              {allSummary.totalAnswerPages > 0 && (
                <p className="mt-2">
                  <span className="text-3xl font-bold text-ink/60">
                    {allSummary.totalAnswerPages}
                  </span>
                  <span className="ml-2">
                    ページ — 解答用紙ページ（スキップ）
                  </span>
                </p>
              )}
              <p className="mt-3 text-sm">
                数式部分はCIDコードとして抽出されるため、テキスト解析の対象外です。正常に抽出できるテキストとページ位置を組み合わせて大問単位の集計を行っています。
              </p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">集計情報</h3>
              <p className="mt-3">全解析ファイル：{allSummary.totalFiles}件</p>
              <p>表示中：{summary.totalFiles}件</p>
              <p>
                ルールセット：MATH_STD（
                {results[0]?.ruleSet.label ?? '標準（年度共通）'}）
              </p>
              <p className="mt-3 text-sm">
                端末内で抽出した出題傾向データを集計するツールです。問題文・設問文など著作物の表現は保存・再掲載せず、大問番号の検出精度はPDFのテキスト抽出結果に依存します。
              </p>
            </div>
          </div>
          <p className="mt-5">
            <a
              className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline"
              href="/tags/"
            >
              タグ定義を見る
            </a>
          </p>
        </section>
      </main>

      {/* ── フッター ── */}
      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 md:px-10">
        <div className="mx-auto max-w-7xl space-y-2">
          <p>
            <strong>更新日</strong> 2026-05-01
          </p>
          <p>
            <strong>データ範囲</strong>{' '}
            ユーザーが正当に取得し、端末内で選択した文部科学省公式PDF。問題文・設問文の配布や再掲載は行いません。
          </p>
          <p>
            <strong>注意書き</strong>{' '}
            高認パスは文部科学省の公式サービスではありません。
          </p>
          <p>
            <a
              className="text-yellow"
              href={officialPastExamUrl}
              target="_blank"
              rel="noopener"
            >
              文部科学省 過去問題ページ
            </a>
          </p>
        </div>
      </footer>
    </>
  )
}

// ── 年度推移チャート: 積み上げ棒グラフ ──

function TrendStackedBar({
  data,
  availableL1
}: {
  data: Record<string, string | number>[]
  availableL1: string[]
}) {
  if (!data.length) {
    return (
      <div
        className="border-2 border-ink bg-cream p-6"
        role="img"
        aria-label="年度推移の積み上げ棒グラフ。該当データはない"
      >
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div
      className="border-2 border-ink bg-paper p-4"
      style={{ height: 380 }}
      role="img"
      aria-label="年度推移の積み上げ棒グラフ"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 20, bottom: 24, left: 0 }}
        >
          <CartesianGrid
            stroke="#1A1A1A"
            strokeDasharray="4 4"
            opacity={0.22}
          />
          <XAxis
            dataKey="session"
            interval={0}
            angle={-18}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {availableL1.map((l1) => (
            <Bar
              key={l1}
              dataKey={l1}
              stackId="trend"
              fill={L1_COLORS[l1] ?? '#999'}
              stroke="#1A1A1A"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── 年度推移チャート: 折れ線グラフ ──

function TrendLineChart({
  data,
  availableL1
}: {
  data: Record<string, string | number>[]
  availableL1: string[]
}) {
  if (!data.length) {
    return (
      <div
        className="border-2 border-ink bg-cream p-6"
        role="img"
        aria-label="年度推移の折れ線グラフ。該当データはない"
      >
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div
      className="border-2 border-ink bg-paper p-4"
      style={{ height: 380 }}
      role="img"
      aria-label="年度推移の折れ線グラフ"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 20, bottom: 24, left: 0 }}
        >
          <CartesianGrid
            stroke="#1A1A1A"
            strokeDasharray="4 4"
            opacity={0.22}
          />
          <XAxis
            dataKey="session"
            interval={0}
            angle={-18}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {availableL1.map((l1) => (
            <Line
              key={l1}
              type="monotone"
              dataKey={l1}
              stroke={L1_COLORS[l1] ?? '#999'}
              strokeWidth={2}
              dot={{ r: 4, fill: L1_COLORS[l1] ?? '#999' }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
