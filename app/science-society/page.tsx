'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/Header'
import FrequencyChart from '@/components/FrequencyChart'
import SciencePDFUploader from '@/components/SciencePDFUploader'
import ScienceGroupTabs from '@/components/ScienceGroupTabs'
import SelectionBalanceChart from '@/components/SelectionBalanceChart'
import ScienceFilterPanel from '@/components/ScienceFilterPanel'
import {
  aggregateSciResults,
  filterSciResults,
  initialSciFilters,
  type SciFilters,
  type FormatRow
} from '@/lib/scienceScoreCalculator'
import type { SciAnalysisResult, SciGroupName } from '@/lib/scienceTagMapper'
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

const GROUP_COLORS: Record<SciGroupName, string> = {
  '物理系': '#1A5CFF',
  '化学系': '#FF6B35',
  '生物系': '#2E8B57',
  '地学系': '#9370DB'
}

const UNIT_COLORS: Record<string, string> = {
  '光の性質とその利用': '#1A5CFF',
  '熱の性質とその利用': '#4D8BFF',
  '材料とその再利用': '#FF6B35',
  '衣料と食品': '#FFAB8A',
  'ヒトの生命現象': '#2E8B57',
  '微生物とその利用': '#6BC992',
  '自然景観と自然災害': '#9370DB',
  '太陽と地球': '#C4ADEE'
}

export default function ScienceSocietyPage() {
  const [results, setResults] = useState<SciAnalysisResult[]>([])
  const [filters, setFilters] = useState<SciFilters>(initialSciFilters)
  const [error, setError] = useState('')

  const filteredResults = useMemo(
    () => filterSciResults(results, filters),
    [results, filters]
  )
  const summary = useMemo(
    () => aggregateSciResults(filteredResults),
    [filteredResults]
  )
  const allSummary = useMemo(
    () => aggregateSciResults(results),
    [results]
  )

  const hasResults = results.length > 0

  /* ── 年度推移チャートデータ ── */

  const trendChartData = useMemo(() => {
    if (summary.trendRows.length === 0) return []
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      const sessionRows = summary.trendRows.filter((r) => r.session === session)
      for (const sr of sessionRows) {
        row[sr.unit] = ((row[sr.unit] as number) ?? 0) + sr.count
      }
      return row
    })
  }, [summary.trendRows])

  const trendLineData = useMemo(() => {
    if (summary.trendRows.length === 0) return []
    const sessionSet = new Set(summary.trendRows.map((r) => r.session))
    const sessions = Array.from(sessionSet).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      for (const unit of summary.availableUnits) {
        const match = summary.trendRows.find(
          (r) => r.session === session && r.unit === unit
        )
        row[unit] = match?.count ?? 0
      }
      return row
    })
  }, [summary.trendRows, summary.availableUnits])

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>

      {/* ── ヘッダー ── */}
      <Header navItems={[
        { label: 'ツール一覧', href: '/#tools' },
        { label: 'PDF選択', href: '#sci-upload-title' },
        { label: '集計', href: '#sci-ranking-title' },
        { label: 'フィルタ', href: '#sci-filter-title' },
        { label: 'タグ定義', href: '/tags/' },
        { label: '更新履歴', href: '/updates/' },
      ]} />

      {/* ── パンくずリスト ── */}
      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a>
        <span aria-hidden="true">/</span>
        <a href="/#tools">ツール一覧</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page"><ruby>科学<rt>かがく</rt></ruby>と<ruby>人間<rt>にんげん</rt></ruby><ruby>生活<rt>せいかつ</rt></ruby>頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        {/* ── ヒーロー ── */}
        <section className="py-12 md:py-20" aria-labelledby="sci-hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">SCIENCE &amp; SOCIETY PAST EXAM ANALYZER</p>
          <h1 id="sci-hero-title" className="mt-4 max-w-5xl font-mincho text-[48px] font-bold leading-none tracking-[-.04em]">
            <ruby>科学<rt>かがく</rt></ruby>と<ruby>人間<rt>にんげん</rt></ruby><ruby>生活<rt>せいかつ</rt></ruby><ruby>頻出<rt>ひんしゅつ</rt></ruby><ruby>分析<rt>ぶんせき</rt></ruby>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            ユーザーが文科省公式ページから取得した科学と人間生活のPDFを端末内で解析し、分野別・単元別の頻出傾向を可視化します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
          </p>
          <p className="mt-3 max-w-3xl">
            大問番号と固定の選択構造（物理系・化学系・生物系・地学系）から分野・単元を特定し、キーワード照合で信頼度を判定します。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#sci-upload-title">PDFを分析する</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページへ</a>
          </div>
        </section>

        {/* ── PDF選択 ── */}
        <SciencePDFUploader
          onComplete={(nextResults) => {
            setResults((prev) => {
              const existingNames = new Set(nextResults.map((r) => r.fileName))
              const kept = prev.filter((r) => !existingNames.has(r.fileName))
              return [...kept, ...nextResults]
            })
            setFilters(initialSciFilters)
            setError('')
          }}
          onError={setError}
        />

        {/* ── エラー表示 ── */}
        {error && (
          <section className="panel mt-8 border-orange bg-paper p-6" aria-live="polite" aria-labelledby="sci-error-title">
            <h2 id="sci-error-title" className="font-mincho text-3xl font-bold">解析できませんでした</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">文科省公式ページから取得した科学と人間生活のPDFを選び直してください。</p>
          </section>
        )}

        {/* ── 解析結果サマリー ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-status-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="sci-status-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">解析結果</h2>
          {hasResults ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article key={`${result.fileName}-${result.analyzedAt}`} className="border-2 border-ink bg-cream p-4">
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>制度区分：{result.ruleSet.code}（{result.ruleSet.label}）</p>
                  <p>検出ブロック：{result.detectedBlocks.length > 0 ? result.detectedBlocks.join('、') : '自動検出'}</p>
                  <p>検出単元：{result.blockHits.length}件</p>
                  {Object.keys(result.formatCounts).length > 0 && (
                    <p>出題形式：{Object.entries(result.formatCounts).map(([k, v]) => `${k}(${v})`).join('、')}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.blockHits.map((hit) => (
                      <span
                        key={`${hit.block}-${hit.topic_l2}`}
                        className="border-2 border-ink bg-paper px-2 py-1 text-sm"
                      >
                        <span className="font-bold">{hit.block}</span>
                        <span className="ml-1">{hit.group}</span>
                        <span className="ml-1 text-xs text-ink/60">({hit.topic_l2})</span>
                        {hit.confidence === 'low' && (
                          <span className="ml-1 text-xs" aria-label="信頼度が低い">?</span>
                        )}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-2 border-ink bg-cream p-4">
              該当データはない：PDF解析後に、解析したファイル名・試験回・検出単元を表示します。
            </p>
          )}
          {summary.hasLowConfidence && hasResults && (
            <p className="mt-4 border-2 border-orange bg-paper p-4">
              一部の大問で単元の特定に不確かさがあります。結果を参考程度にご確認ください。
            </p>
          )}
        </section>

        {/* ── Section A: 分野別頻出単元ランキング ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-ranking-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION A</p>
          <h2 id="sci-ranking-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>分野別<rt>ぶんやべつ</rt></ruby><ruby>頻出<rt>ひんしゅつ</rt></ruby><ruby>単元<rt>たんげん</rt></ruby>ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            物理系・化学系・生物系・地学系の各分野をタブで切り替えて、単元ごとの出現回数・出現率を確認できます。
          </p>
          <div className="mt-5">
            <ScienceGroupTabs
              mode="ranking"
              groupRankings={summary.groupRankings}
              caption="単元ごとの頻出ランキング。順位、単元、出現回数、出現率。"
              idPrefix="sci-a"
            />
          </div>
        </section>

        {/* ── Section B: 近年頻出ランキング ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
          <h2 id="sci-recent-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>近年<rt>きんねん</rt></ruby><ruby>頻出<rt>ひんしゅつ</rt></ruby>ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            recent_weighted_score = &Sigma;(出現回数 &times; session_weight)。最新回 1.0、一つ前 0.8、二つ前 0.6、三つ前 0.4、それ以前 0.2 で算出します。分野別に集計しています。
          </p>
          <div className="mt-5">
            <ScienceGroupTabs
              mode="recent"
              groupRankings={summary.groupRankings}
              groupRecentRankings={summary.groupRecentRankings}
              caption="近年頻出ランキング。重み付きスコアと直近の出現。"
              idPrefix="sci-b"
            />
          </div>
        </section>

        {/* ── Section C: 分野別出題バランス ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-balance-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="sci-balance-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>分野別<rt>ぶんやべつ</rt></ruby><ruby>出題<rt>しゅつだい</rt></ruby>バランス
          </h2>
          <p className="mt-3 max-w-3xl">
            各分野内の2大問がそれぞれ何回出題されたかを比較します。どちらの大問が近年多く出ているかが一目でわかります。
          </p>
          <div className="mt-5">
            <SelectionBalanceChart balanceRows={summary.balanceRows} />
          </div>
        </section>

        {/* ── Section D: 年度推移 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="sci-trend-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>年度<rt>ねんど</rt></ruby><ruby>推移<rt>すいい</rt></ruby>
          </h2>
          <p className="mt-3 max-w-3xl">
            横軸を試験回、縦軸を出現回数としたグラフです。分野フィルタで絞り込みが可能です。同一データの表を併設しています。
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* 積み上げ棒グラフ */}
            <TrendStackedBar data={trendChartData} availableUnits={summary.availableUnits} />
            {/* 折れ線グラフ */}
            <TrendLineChart data={trendLineData} availableUnits={summary.availableUnits} />
          </div>
          {/* 年度推移テーブル */}
          <div className="mt-6 overflow-x-auto" role="region" aria-label="年度推移表" tabIndex={0}>
            <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">年度推移グラフと同一データの表。</caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">試験回</th>
                  <th scope="col" className="p-3 text-left">分野</th>
                  <th scope="col" className="p-3 text-left">単元</th>
                  <th scope="col" className="p-3 text-right">出現回数</th>
                </tr>
              </thead>
              <tbody>
                {summary.trendRows.length > 0 ? (
                  summary.trendRows.map((row, index) => (
                    <tr key={`${row.session}-${row.unit}-${index}`} className="border-b-2 border-ink even:bg-blue/5">
                      <td className="p-3">{row.session}</td>
                      <td className="p-3">{row.group}</td>
                      <td className="p-3 font-bold">{row.unit}</td>
                      <td className="p-3 text-right">{row.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-3">該当データはない：PDF解析後にデータを表示します。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section E2: 出題形式分布 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-format-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">FORMAT DISTRIBUTION</p>
          <h2 id="sci-format-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>出題<rt>しゅつだい</rt></ruby><ruby>形式<rt>けいしき</rt></ruby><ruby>分布<rt>ぶんぷ</rt></ruby>
          </h2>
          <p className="mt-3 max-w-3xl">
            各大問で検出された出題形式（空欄補充・正誤判定・実験考察・図表読み取り・計算・日常生活との関連）の出現回数と割合です。
          </p>
          <div className="mt-5">
            {summary.formatRows.length > 0 ? (
              <>
                <FrequencyChart
                  data={summary.formatRows.map((r) => ({ name: r.format, count: r.count }))}
                  xKey="name"
                  yKey="count"
                  label="出題形式の出現回数"
                  color="#FFD166"
                />
                <div className="mt-5 overflow-x-auto" role="region" aria-label="出題形式分布表" tabIndex={0}>
                  <table className="w-full min-w-[400px] border-collapse bg-paper" role="table">
                    <caption className="py-3 text-left font-bold">出題形式ごとの出現回数と割合。</caption>
                    <thead className="bg-ink text-cream">
                      <tr>
                        <th scope="col" className="p-3 text-left">順位</th>
                        <th scope="col" className="p-3 text-left">出題形式</th>
                        <th scope="col" className="p-3 text-right">出現回数</th>
                        <th scope="col" className="p-3 text-right">割合</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.formatRows.map((row, index) => (
                        <tr key={row.format} className="border-b-2 border-ink even:bg-blue/5">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-bold">{row.format}</td>
                          <td className="p-3 text-right">{row.count}</td>
                          <td className="p-3 text-right">{row.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="border-2 border-ink bg-cream p-4">該当データはない：PDF解析後に出題形式を表示します。</p>
            )}
          </div>
        </section>

        {/* ── Section E: フィルタ ── */}
        <div className="mt-8">
          <ScienceFilterPanel
            value={filters}
            onChange={setFilters}
            availableGroups={allSummary.availableGroups}
            resultCount={filteredResults.length}
          />
        </div>

        {/* ── 注記 ── */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="sci-meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NOTES</p>
          <h2 id="sci-meta-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            注記
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">集計情報</h3>
              <p className="mt-3">全解析ファイル：{allSummary.totalCount}件</p>
              <p>表示中：{summary.totalCount}件</p>
              <p>検出分野：{allSummary.availableGroups.join('、') || '未解析'}</p>
              <p>検出単元：{allSummary.availableUnits.length}種類</p>
              <p className="mt-3 text-sm">
                端末内で抽出した出題傾向データを集計するツールです。問題文・設問文など著作物の表現は保存・再掲載せず、単元の検出精度はPDFのテキスト抽出結果とキーワード辞書に依存します。
              </p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">選択構造について</h3>
              <p className="mt-3">
                科学と人間生活は4分野（物理系・化学系・生物系・地学系）で構成されています。受験者は2分野を選択し、各分野内の2大問から1大問ずつ選択して解答します。
              </p>
              <p className="mt-2 text-sm">
                第1問・第2問＝物理系、第3問・第4問＝化学系、第5問・第6問＝生物系、第7問・第8問＝地学系の固定構造です。
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
          <p><strong>更新日</strong> 2026-05-04</p>
          <p><strong>データ範囲</strong> ユーザーが正当に取得し、端末内で選択した文部科学省公式PDF。問題文・設問文の配布や再掲載は行いません。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}

/* ── 年度推移チャート: 積み上げ棒グラフ ── */

function TrendStackedBar({
  data,
  availableUnits
}: {
  data: Record<string, string | number>[]
  availableUnits: string[]
}) {
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
          {availableUnits.slice(0, 8).map((unit) => (
            <Bar
              key={unit}
              dataKey={unit}
              stackId="trend"
              fill={UNIT_COLORS[unit] ?? '#999'}
              stroke="#1A1A1A"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── 年度推移チャート: 折れ線グラフ ── */

function TrendLineChart({
  data,
  availableUnits
}: {
  data: Record<string, string | number>[]
  availableUnits: string[]
}) {
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
          {availableUnits.slice(0, 8).map((unit) => (
            <Line
              key={unit}
              type="monotone"
              dataKey={unit}
              stroke={UNIT_COLORS[unit] ?? '#999'}
              strokeWidth={2}
              dot={{ r: 3, fill: UNIT_COLORS[unit] ?? '#999' }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
