'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import FrequencyChart from '@/components/FrequencyChart'
import BiologyPDFUploader from '@/components/BiologyPDFUploader'
import BiologyFilterPanel from '@/components/BiologyFilterPanel'
import {
  aggregateBiologyResults,
  filterBiologyResults,
  initialBiologyFilters,
  type BiologyFilters
} from '@/lib/biologyScoreCalculator'
import type { BiologyAnalysisResult } from '@/lib/biologyTagMapper'
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
  '生物の特徴': '#2E8B57',
  '遺伝子とその働き': '#1A5CFF',
  '神経系と内分泌系による調節': '#FF6B35',
  '免疫': '#E11D48',
  '植生と遷移': '#9370DB',
  '生態系とその保全': '#6B7280',
  '判定保留': '#999999'
}

export default function BiologyPage() {
  const [results, setResults] = useState<BiologyAnalysisResult[]>([])
  const [filters, setFilters] = useState<BiologyFilters>(initialBiologyFilters)
  const [error, setError] = useState('')

  const filteredResults = useMemo(
    () => filterBiologyResults(results, filters),
    [results, filters]
  )
  const summary = useMemo(
    () => aggregateBiologyResults(filteredResults),
    [filteredResults]
  )
  const allSummary = useMemo(
    () => aggregateBiologyResults(results),
    [results]
  )
  const hasResults = results.length > 0

  const trendChartData = useMemo(() => {
    if (summary.trendRows.length === 0) return []
    const sessions = Array.from(new Set(summary.trendRows.map((row) => row.session))).sort()
    return sessions.map((session) => {
      const row: Record<string, string | number> = { session }
      for (const trend of summary.trendRows.filter((item) => item.session === session)) {
        row[trend.topic] = ((row[trend.topic] as number) ?? 0) + trend.count
      }
      return row
    })
  }, [summary.trendRows])

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>

      <Header showSubjectDropdown={true} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 lg:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a>
        <span aria-hidden="true">/</span>
        <a href="/analysis/">公式過去問PDF傾向分析</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">生物基礎頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 lg:px-10" tabIndex={-1}>
        <section className="py-12 md:py-20" aria-labelledby="biology-hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">BIOLOGY PAST EXAM ANALYZER</p>
          <h1 id="biology-hero-title" className="mt-4 max-w-5xl font-mincho text-[48px] font-bold leading-none tracking-normal">
            <ruby>生物<rt>せいぶつ</rt></ruby><ruby>基礎<rt>きそ</rt></ruby><ruby>頻出<rt>ひんしゅつ</rt></ruby><ruby>分析<rt>ぶんせき</rt></ruby>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            ユーザーが文科省公式ページから取得した生物基礎PDFを端末内で解析し、頻出分野・年度別推移・大問構成を可視化します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
          </p>
          <p className="mt-3 max-w-3xl">
            生物基礎は解答番号1〜20を6ブロック程度に分けて出題されます。「生物の特徴」「遺伝子とその働き」などの大問見出しと、本文内の用語を組み合わせて分野と出題形式を判定します。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#biology-upload-title">PDFを分析する</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式過去問PDFページへ</a>
          </div>
        </section>

        <BiologyPDFUploader
          onComplete={(nextResults) => {
            setResults((prev) => {
              const existingNames = new Set(nextResults.map((result) => result.fileName))
              const kept = prev.filter((result) => !existingNames.has(result.fileName))
              return [...kept, ...nextResults]
            })
            setFilters(initialBiologyFilters)
            setError('')
          }}
          onError={setError}
        />

        {error && (
          <section className="panel mt-8 border-orange bg-paper p-6" aria-live="polite" aria-labelledby="biology-error-title">
            <h2 id="biology-error-title" className="font-mincho text-3xl font-bold">解析できませんでした</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">文科省公式ページから取得した生物基礎PDFを選び直してください。</p>
          </section>
        )}

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-status-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="biology-status-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">解析結果</h2>
          {hasResults ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article key={`${result.fileName}-${result.analyzedAt}`} className="border-2 border-ink bg-cream p-4">
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>制度区分：{result.ruleSet.code}（{result.ruleSet.label}）</p>
                  <p>解答番号数：{result.questionCount || '未検出'}</p>
                  <p>検出大問：{result.detectedBlocks.length > 0 ? result.detectedBlocks.join('、') : '自動検出'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.blockHits.map((hit) => (
                      <span
                        key={`${hit.block}-${hit.topic_l1}-${hit.answerRange?.start ?? 'x'}`}
                        className="border-2 border-ink bg-paper px-2 py-1 text-sm"
                      >
                        <span className="font-bold">{hit.block}</span>
                        <span className="ml-1">{hit.topic_l1}</span>
                        <span className="ml-1 text-xs text-ink/60">
                          問{hit.answerRange ? `${hit.answerRange.start}〜${hit.answerRange.end}` : hit.smallQuestionCount}
                        </span>
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
              該当データはない：PDF解析後に、解析したファイル名・試験回・大問別の検出分野を表示します。
            </p>
          )}
          {summary.hasLowConfidence && hasResults && (
            <p className="mt-4 border-2 border-orange bg-paper p-4">
              一部の大問で分野の特定に不確かさがあります。結果を参考程度にご確認ください。
            </p>
          )}
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-ranking-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION A</p>
          <h2 id="biology-ranking-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>頻出<rt>ひんしゅつ</rt></ruby><ruby>分野<rt>ぶんや</rt></ruby>ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            大問ごとに最も強く出た分野を集計します。体内環境の問題は、神経・内分泌系と免疫を別分野として扱います。
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <FrequencyChart
              data={summary.topicRanking.map((row) => ({ name: row.topic, count: row.count }))}
              xKey="name"
              yKey="count"
              label="頻出分野の出現回数"
              color="#2E8B57"
            />
            <RankingTable rows={summary.topicRanking} />
          </div>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
          <h2 id="biology-recent-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>近年<rt>きんねん</rt></ruby><ruby>頻出<rt>ひんしゅつ</rt></ruby>ランキング
          </h2>
          <p className="mt-3 max-w-3xl">
            recent_weighted_score = &Sigma;(出現回数 &times; session_weight)。最新回 1.0、一つ前 0.8、二つ前 0.6、三つ前 0.4、それ以前 0.2 で算出します。
          </p>
          <div className="mt-5 overflow-x-auto" role="region" aria-label="生物基礎の近年頻出ランキング表" tabIndex={0}>
            <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">近年頻出ランキング。重み付きスコアと直近の出現。</caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">順位</th>
                  <th scope="col" className="p-3 text-left">分野</th>
                  <th scope="col" className="p-3 text-right">スコア</th>
                  <th scope="col" className="p-3 text-left">直近出現</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentRanking.length > 0 ? (
                  summary.recentRanking.map((row, index) => (
                    <tr key={row.topic} className="border-b-2 border-ink even:bg-blue/5">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-bold">{row.topic}</td>
                      <td className="p-3 text-right">{row.score}</td>
                      <td className="p-3">{row.latestSession}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-3">該当データはない：PDF解析後にデータを表示します。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-block-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="biology-block-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>大問<rt>だいもん</rt></ruby><ruby>構成<rt>こうせい</rt></ruby>
          </h2>
          <p className="mt-3 max-w-3xl">
            各PDFの大問ごとに、小問数、解答番号範囲、判定分野、出題形式を整理します。
          </p>
          <div className="mt-5 overflow-x-auto" role="region" aria-label="生物基礎の大問構成表" tabIndex={0}>
            <table className="w-full min-w-[980px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">試験回別の大問構成。</caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">試験回</th>
                  <th scope="col" className="p-3 text-left">大問</th>
                  <th scope="col" className="p-3 text-left">見出し</th>
                  <th scope="col" className="p-3 text-right">小問数</th>
                  <th scope="col" className="p-3 text-left">解答番号</th>
                  <th scope="col" className="p-3 text-left">分野</th>
                  <th scope="col" className="p-3 text-left">形式</th>
                  <th scope="col" className="p-3 text-left">根拠キーワード</th>
                </tr>
              </thead>
              <tbody>
                {summary.blockRows.length > 0 ? (
                  summary.blockRows.map((row, index) => (
                    <tr key={`${row.session}-${row.block}-${index}`} className="border-b-2 border-ink even:bg-blue/5">
                      <td className="p-3">{row.session}</td>
                      <td className="p-3 font-bold">{row.block}</td>
                      <td className="p-3">{row.heading}</td>
                      <td className="p-3 text-right">{row.smallQuestionCount || '未検出'}</td>
                      <td className="p-3">{row.answerRange}</td>
                      <td className="p-3 font-bold">{row.topic}{row.confidence === 'low' ? '?' : ''}</td>
                      <td className="p-3">{row.formats}</td>
                      <td className="p-3">{row.matchedKeywords}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="p-3">該当データはない：PDF解析後にデータを表示します。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="biology-trend-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>年度別<rt>ねんどべつ</rt></ruby><ruby>推移<rt>すいい</rt></ruby>
          </h2>
          <p className="mt-3 max-w-3xl">
            横軸を試験回、縦軸を大問出現回数として、分野ごとの推移を表示します。
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <TrendStackedBar data={trendChartData} availableTopics={summary.availableTopics} />
            <TrendLineChart data={trendChartData} availableTopics={summary.availableTopics} />
          </div>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-format-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">FORMAT DISTRIBUTION</p>
          <h2 id="biology-format-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            <ruby>出題<rt>しゅつだい</rt></ruby><ruby>形式<rt>けいしき</rt></ruby><ruby>分布<rt>ぶんぷ</rt></ruby>
          </h2>
          <p className="mt-3 max-w-3xl">
            各大問で検出された出題形式の出現回数と割合です。
          </p>
          <div className="mt-5">
            {summary.formatRows.length > 0 ? (
              <>
                <FrequencyChart
                  data={summary.formatRows.map((row) => ({ name: row.format, count: row.count }))}
                  xKey="name"
                  yKey="count"
                  label="出題形式の出現回数"
                  color="#FFD166"
                />
                <FormatTable rows={summary.formatRows} />
              </>
            ) : (
              <p className="border-2 border-ink bg-cream p-4">該当データはない：PDF解析後に出題形式を表示します。</p>
            )}
          </div>
        </section>

        <div className="mt-8">
          <BiologyFilterPanel
            value={filters}
            onChange={setFilters}
            availableTopics={allSummary.availableTopics}
            availableFormats={allSummary.availableFormats}
            resultCount={filteredResults.length}
          />
        </div>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="biology-meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NOTES</p>
          <h2 id="biology-meta-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
            注記
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">集計情報</h3>
              <p className="mt-3">全解析ファイル：{allSummary.totalCount}件</p>
              <p>表示中：{summary.totalCount}件</p>
              <p>検出大問：{summary.totalBlocks}件</p>
              <p>検出分野：{allSummary.availableTopics.join('、') || '未解析'}</p>
              <p className="mt-3 text-sm">
                端末内で抽出した出題傾向データを集計するツールです。問題文・設問文など著作物の表現は保存・再掲載せず、分野の検出精度はPDFのテキスト抽出結果とキーワード辞書に依存します。
              </p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="text-xl font-bold">生物基礎の解析方法</h3>
              <p className="mt-3">
                公式過去問PDFの見出しで大問を分割し、各大問の解答番号範囲と小問数を推定します。
              </p>
              <p className="mt-2 text-sm">
                分野は、生物の特徴、遺伝子とその働き、神経系と内分泌系による調節、免疫、植生と遷移、生態系とその保全のキーワードスコアで分類します。
              </p>
            </div>
          </div>
          <p className="mt-5">
            <a className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline" href="/tags/">タグ定義を見る</a>
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function RankingTable({ rows }: { rows: Array<{ topic: string; count: number; rate: number }> }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label="生物基礎の頻出分野ランキング表" tabIndex={0}>
      <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
        <caption className="py-3 text-left font-bold">頻出分野ランキング。順位、分野、出現回数、割合。</caption>
        <thead className="bg-ink text-cream">
          <tr>
            <th scope="col" className="p-3 text-left">順位</th>
            <th scope="col" className="p-3 text-left">分野</th>
            <th scope="col" className="p-3 text-right">出現回数</th>
            <th scope="col" className="p-3 text-right">割合</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={row.topic} className="border-b-2 border-ink even:bg-blue/5">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-bold">{row.topic}</td>
                <td className="p-3 text-right">{row.count}</td>
                <td className="p-3 text-right">{row.rate}%</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className="p-3">該当データはない：PDF解析後にデータを表示します。</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function FormatTable({ rows }: { rows: Array<{ format: string; count: number; rate: number }> }) {
  return (
    <div className="mt-5 overflow-x-auto" role="region" aria-label="生物基礎の出題形式分布表" tabIndex={0}>
      <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
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
          {rows.map((row, index) => (
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
  )
}

function TrendStackedBar({
  data,
  availableTopics
}: {
  data: Record<string, string | number>[]
  availableTopics: string[]
}) {
  if (!data.length) {
    return (
      <div className="border-2 border-ink bg-cream p-6" role="img" aria-label="年度別推移の積み上げ棒グラフ。該当データはない">
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-paper p-4" style={{ height: 400 }} role="img" aria-label="年度別推移の積み上げ棒グラフ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
          <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
          <XAxis dataKey="session" interval={0} angle={-18} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {availableTopics.slice(0, 8).map((topic) => (
            <Bar
              key={topic}
              dataKey={topic}
              stackId="trend"
              fill={TOPIC_COLORS[topic] ?? '#999999'}
              stroke="#1A1A1A"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendLineChart({
  data,
  availableTopics
}: {
  data: Record<string, string | number>[]
  availableTopics: string[]
}) {
  if (!data.length) {
    return (
      <div className="border-2 border-ink bg-cream p-6" role="img" aria-label="年度別推移の折れ線グラフ。該当データはない">
        該当データはない：PDF解析後にグラフを表示します。
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-paper p-4" style={{ height: 400 }} role="img" aria-label="年度別推移の折れ線グラフ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
          <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" opacity={0.22} />
          <XAxis dataKey="session" interval={0} angle={-18} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {availableTopics.slice(0, 8).map((topic) => (
            <Line
              key={topic}
              type="monotone"
              dataKey={topic}
              stroke={TOPIC_COLORS[topic] ?? '#999999'}
              strokeWidth={2}
              dot={{ r: 3, fill: TOPIC_COLORS[topic] ?? '#999999' }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
