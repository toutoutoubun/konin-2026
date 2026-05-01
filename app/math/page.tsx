'use client'

import { useMemo, useState } from 'react'
import DisplaySettings from '@/components/DisplaySettings'
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

const officialPastExamUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/1421021.htm'

export default function MathAnalysisPage() {
  const [results, setResults] = useState<MathAnalysisResult[]>([])
  const [filters, setFilters] = useState<MathFilters>(initialMathFilters)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  const filteredResults = useMemo(() => filterMathResults(results, filters), [results, filters])
  const summary = useMemo(() => aggregateMathResults(filteredResults), [filteredResults])
  const allSummary = useMemo(() => aggregateMathResults(results), [results])

  // Section A: よく出る単元 (topic_l2) チャートデータ
  const unitChartData = summary.unitRanking.slice(0, 10).map((row) => ({
    name: row.unit,
    count: row.count
  }))

  // Section C: 大問別分布チャートデータ
  const blockChartData = summary.blockDistribution.map((row) => ({
    name: `${row.block}\n${row.topic_l1}`,
    count: row.count
  }))

  // Section D: 年度推移チャートデータ — topic_l1 ごとにセッション別件数
  const trendChartData = useMemo(() => {
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      const sessionRows = summary.trendRows.filter((r) => r.session === session)
      for (const sr of sessionRows) {
        row[sr.unit] = sr.count
      }
      return row
    })
  }, [summary.trendRows])

  // topic_l1 の色マップ
  const l1Colors: Record<string, string> = {
    '数と式': '#1A5CFF',
    '二次関数': '#FF6B35',
    '図形と計量': '#FFD166',
    'データの分析': '#22C55E',
    '場合の数と確率': '#A855F7',
    '整数の性質': '#EC4899'
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>

      <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/95 px-4 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <a
            href="/"
            className="flex items-center gap-3 no-underline"
            aria-label="高認パストップへ"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-yellow font-serifDisplay text-lg">
              KP
            </span>
            <span className="font-bold">高認パス</span>
          </a>
          <nav aria-label="主要ナビゲーション" className="flex flex-wrap gap-5 font-bold">
            <a href="/#tools">ツール一覧</a>
            <a href="#math-upload-title">PDFアップロード</a>
            <a href="#math-ranking-title">集計</a>
            <a href="#math-filter-title">フィルタ</a>
            <a href="/tags/">タグ定義</a>
            <a href="/updates/">更新履歴</a>
          </nav>
          <DisplaySettings />
        </div>
      </header>

      <nav
        className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10"
        aria-label="パンくずリスト"
      >
        <a href="/">トップ</a>
        <span aria-hidden="true">/</span>
        <a href="/#tools">ツール一覧</a>
        <span aria-hidden="true">/</span>
        <span>数学頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        {/* ── ヒーローセクション ── */}
        <section className="py-12 md:py-20" aria-labelledby="math-hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">
            MATH PAST EXAM ANALYZER
          </p>
          <h1
            id="math-hero-title"
            className="mt-4 max-w-5xl font-mincho text-6xl font-bold leading-none tracking-[-.06em] md:text-9xl"
          >
            <ruby>
              数学<rt>すうがく</rt>
            </ruby>
            頻出分析
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed">
            文科省公開の数学過去問PDFをブラウザ上で解析し、大問（第1問〜第6問）ごとの出題単元、頻出トピック、年度推移を可視化します。PDFはサーバーへ送信しません。
          </p>
          <div className="mt-8 flex flex-wrap gap-4" aria-label="主要操作">
            <a
              className="hard-button button-like bg-blue px-5 py-3 text-white no-underline"
              href="#math-upload-title"
            >
              PDFを分析する
            </a>
            <a
              className="hard-button button-like bg-paper px-5 py-3 no-underline"
              href={officialPastExamUrl}
              target="_blank"
              rel="noopener"
            >
              過去問を入手
            </a>
          </div>
        </section>

        {/* ── PDFアップロード ── */}
        <MathPDFUploader
          onComplete={(nextResults) => {
            setResults((prev) => {
              // 重複ファイル除外（同一ファイル名は上書き）
              const existingNames = new Set(nextResults.map((r) => r.fileName))
              const kept = prev.filter((r) => !existingNames.has(r.fileName))
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
            <h2 id="math-error-title" className="font-mincho text-3xl font-bold">
              解析できませんでした
            </h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">
              次の操作：文科省公開の数学過去問PDFを選び直してください。
            </p>
          </section>
        )}

        {/* ── 解析結果サマリー ── */}
        <section
          className="panel mt-8 p-6 md:p-8"
          aria-labelledby="math-status-title"
          aria-live="polite"
        >
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="math-status-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
            解析結果
          </h2>
          {results.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article
                  key={`${result.fileName}-${result.analyzedAt}`}
                  className="border-2 border-ink bg-cream p-4"
                >
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>
                    検出ブロック：{result.questionBlocks.length}件 / ページ数：
                    {result.pageCount}（スキップ：{result.skippedPages}）
                  </p>
                  <p>
                    小問数：
                    {result.questionBlocks.reduce((s, b) => s + b.totalSubQuestions, 0)}件 /
                    数式のみ：{result.formulaOnlyTotal}件
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.questionBlocks.map((block) => (
                      <span
                        key={block.blockNumber}
                        className="border-2 border-ink bg-paper px-2 py-1 text-sm font-bold"
                      >
                        {block.heading}：{block.topic_l1}
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
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="math-ranking-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION A</p>
              <h2
                id="math-ranking-title"
                className="mt-2 font-mincho text-4xl font-bold md:text-6xl"
              >
                よく出る単元ランキング
              </h2>
              <p className="mt-3 max-w-3xl">
                topic_l2（小分類）単位で集計した、出現回数・出現率によるランキングです。
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
            <RankingTable
              rows={summary.unitRanking}
              caption="小分類（topic_l2）ごとの頻出ランキング。順位、単元、出現回数、出現率。"
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
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="math-recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
          <h2 id="math-recent-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
            近年頻出ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            recent_weighted_score = Σ(出現回数 × session_weight)。最新回 1.0、一つ前 0.8、二つ前
            0.6、三つ前 0.4、それ以前 0.2 で算出します。
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
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="math-block-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="math-block-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
            大問別分布
          </h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <FrequencyChart
              data={blockChartData}
              xKey="name"
              yKey="count"
              label="大問別分布の棒グラフ"
              color="#1A5CFF"
            />
            <div className="overflow-x-auto" role="region" aria-label="大問別分布表">
              <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">
                  大問、大分類、件数、構成比。
                </caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">
                      大問
                    </th>
                    <th scope="col" className="p-3 text-left">
                      大分類
                    </th>
                    <th scope="col" className="p-3 text-left">
                      件数
                    </th>
                    <th scope="col" className="p-3 text-left">
                      構成比
                    </th>
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
                        <td className="p-3">{row.count}</td>
                        <td className="p-3">{row.rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3">
                        該当データはない
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section D: 年度推移 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="math-trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="math-trend-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
            年度推移
          </h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <MathTrendChart data={trendChartData} l1Colors={l1Colors} availableL1={summary.availableL1} />
            <div className="overflow-x-auto" role="region" aria-label="年度推移表">
              <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">
                  年度推移グラフと同一データの表。
                </caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">
                      試験回
                    </th>
                    <th scope="col" className="p-3 text-left">
                      大分類
                    </th>
                    <th scope="col" className="p-3 text-left">
                      出現回数
                    </th>
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
                        <td className="p-3">{row.count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-3">
                        該当データはない
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

        {/* ── Section F: 数式のみ除外カウント + 注記 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="math-meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION F</p>
          <h2 id="math-meta-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
            注記とタグ定義
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">解析対象外（数式のみの設問）</h3>
              <p className="mt-2 text-4xl font-bold text-orange">
                {allSummary.formulaOnlyTotal}
                <span className="ml-2 text-lg font-normal text-ink">件</span>
              </p>
              <p className="mt-2">
                数式・図のみで構成される設問はキーワードマッチの対象外とし、トピック分類から除外しています。
              </p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">集計情報</h3>
              <p className="mt-2">全解析ファイル：{allSummary.totalFiles}件</p>
              <p>表示中：{summary.totalFiles}件</p>
              <p>小問合計：{allSummary.totalSubQuestions}件</p>
              <p>
                ルールセット：MATH_STD（{results[0]?.ruleSet.label ?? '数学（標準課程）'}）
              </p>
            </div>
          </div>
          <p className="mt-5">
            公開済みデータを集計しているブラウザ内ツールです。大問番号の検出精度はPDFのテキスト抽出結果に依存します。
          </p>
          <p className="mt-4">
            <a
              className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline"
              href="/tags/"
            >
              タグ定義を見る
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-8 text-cream md:px-10">
        <div className="mx-auto max-w-7xl space-y-2">
          <p>
            <strong>更新日</strong> 2026-05-01
          </p>
          <p>
            <strong>データ範囲</strong>{' '}
            ユーザーがブラウザ上でアップロードした文科省公開PDF。
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

// ── 年度推移用の専用チャートコンポーネント ──

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

function MathTrendChart({
  data,
  l1Colors,
  availableL1
}: {
  data: Record<string, string | number>[]
  l1Colors: Record<string, string>
  availableL1: string[]
}) {
  if (!data.length) {
    return (
      <div className="panel p-6" role="img" aria-label="年度推移グラフ。該当データはない">
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div className="panel h-[380px] p-4" role="img" aria-label="年度推移の積み上げ棒グラフ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
          <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
          <XAxis dataKey="session" interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {availableL1.map((l1) => (
            <Bar
              key={l1}
              dataKey={l1}
              stackId="trend"
              fill={l1Colors[l1] ?? '#999'}
              stroke="#1A1A1A"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
