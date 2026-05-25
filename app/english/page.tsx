'use client'

import { useMemo, useState } from 'react'
import CEFRDistributionChart from '@/components/CEFRDistributionChart'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import FilterPanel, { initialFilters, type EnglishFilters } from '@/components/FilterPanel'
import FrequencyChart from '@/components/FrequencyChart'
import GrammarVocabCrossTable from '@/components/GrammarVocabCrossTable'
import PDFUploader from '@/components/PDFUploader'
import RankingTable from '@/components/RankingTable'
import VocabRankingTable from '@/components/VocabRankingTable'
import { aggregateResults } from '@/lib/scoreCalculator'
import type { AnalysisResult } from '@/lib/tagMapper'
import type { CefrLevel } from '@/lib/vocabAnalyzer'

const officialPastExamUrl = 'https://www.mext.go.jp/a_menu/koutou/shiken/1421021.htm'

const cefrGuideRows = [
  { level: 'A1', label: '基礎', description: '短い日常表現や基本語が中心。' },
  { level: 'A2', label: '日常', description: '身近な話題の説明ややり取りで使う語が中心。' },
  { level: 'B1', label: '標準', description: 'まとまった文章の理解に出やすい、やや抽象的な語を含む。' },
  { level: 'B2', label: '発展', description: '論説・説明文で使われる専門寄り、抽象寄りの語を含む。' },
  { level: '試験語彙', label: 'CEFR外', description: '月名、曜日、国名形容詞、設問指示語など高認で頻出する専用語。' },
  { level: '未分類', label: 'リスト外', description: '辞書照合では判定できなかった語。固有名詞は別扱いで除外。' }
]

function filterResults(results: AnalysisResult[], filters: EnglishFilters): AnalysisResult[] {
  let next = [...results].sort((a, b) => (b.examYear ?? 0) - (a.examYear ?? 0) || b.examSession.localeCompare(a.examSession))

  if (filters.ruleSet !== 'all') {
    next = next.filter((result) => result.ruleSet.code === filters.ruleSet)
  }

  if (filters.sessionRange === 'recent4') next = next.slice(0, 4)
  if (filters.sessionRange === 'recent2') next = next.slice(0, 2)
  if (filters.sessionRange === 'older') next = next.slice(4)

  if (filters.format !== 'all') {
    next = next.filter((result) => (result.formatCounts[filters.format] ?? 0) > 0)
  }

  if (filters.grammar !== 'all') {
    next = next.filter((result) => result.grammarTags.some((tag) => tag.name === filters.grammar))
  }

  return next
}

export default function EnglishAnalysisPage() {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [filters, setFilters] = useState<EnglishFilters>(initialFilters)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [cefrViewMode, setCefrViewMode] = useState<'table' | 'chart'>('chart')

  const filteredResults = useMemo(() => filterResults(results, filters), [results, filters])
  const summary = useMemo(() => aggregateResults(filteredResults), [filteredResults])
  const allSummary = useMemo(() => aggregateResults(results), [results])

  const availableFormats = useMemo(() => Array.from(new Set(results.flatMap((result) => Object.keys(result.formatCounts)))), [results])
  const availableGrammar = useMemo(() => Array.from(new Set(results.flatMap((result) => result.grammarTags.map((tag) => tag.name)))), [results])
  const mixedRuleSets = summary.ruleSetCodes.length > 1

  const unitChartData = summary.unitRanking.slice(0, 8).map((row) => ({ name: row.unit, count: row.count }))
  const formatChartData = summary.formatRows.map((row) => ({ name: row.format, count: row.count }))
  const trendChartData = summary.trendRows.slice(0, 24).map((row) => ({ session: `${row.session}\n${row.unit}`, count: row.count }))

  // Derive CEFR / POS / category filter values for vocab section
  const cefrFilter = (filters.cefrLevel ?? 'all') as CefrLevel | 'all'
  const posFilter = filters.pos ?? 'all'
  const categoryFilter = (filters.category ?? 'all') as 'all' | 'content' | 'properNoun'

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header showSubjectDropdown={true} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><a href="/analysis/">公式PDF傾向分析</a><span aria-hidden="true">/</span><span>英語頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-12 md:py-20" aria-labelledby="hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">ENGLISH PAST EXAM ANALYZER</p>
          <h1 id="hero-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            英語頻出分析
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            ユーザーが文科省公式ページから取得した英語PDFを端末内で解析し、よく出る単元、文法項目、問題形式、語彙レベルの傾向を可視化します。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#upload-title">PDFを分析する</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページへ</a>
          </div>
        </section>

        <PDFUploader
          onComplete={(nextResults) => {
            setResults(nextResults)
            setFilters(initialFilters)
            setError('')
          }}
          onError={setError}
        />

        {error && (
          <section className="panel mt-8 border-orange bg-paper p-6" aria-live="polite" aria-labelledby="error-title">
            <h2 id="error-title" className="font-mincho text-3xl font-bold">解析できませんでした</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">次の操作：文科省公式ページから取得した英語PDFを選び直してください。</p>
          </section>
        )}

        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="status-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="status-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">解析結果</h2>
          {results.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article key={`${result.fileName}-${result.analyzedAt}`} className="border-2 border-ink bg-cream p-4">
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>制度区分：{result.ruleSet.code}（{result.ruleSet.label}）</p>
                  <p>検出ブロック：{result.questionBlocks.length}件 / 抽出文字数：{result.rawText.length.toLocaleString()}字</p>
                  <p>内容語数：{(result.totalContentWords ?? 0).toLocaleString()}語 / 固有名詞：{(result.properNounCount ?? 0).toLocaleString()}語</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-2 border-ink bg-cream p-4">該当データはない：PDF解析後に、解析したファイル名・試験回・制度区分を表示します。</p>
          )}
        </section>

        {/* --- SECTION B: よく出る単元ランキング --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="ranking-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
              <h2 id="ranking-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">よく出る単元ランキング</h2>
            </div>
            <div className="flex gap-3" role="group" aria-label="表示形式を切り替える">
              <button className={`hard-button px-4 py-2 ${viewMode === 'table' ? 'bg-blue text-white' : 'bg-paper'}`} type="button" aria-pressed={viewMode === 'table'} onClick={() => setViewMode('table')}>表</button>
              <button className={`hard-button px-4 py-2 ${viewMode === 'chart' ? 'bg-blue text-white' : 'bg-paper'}`} type="button" aria-pressed={viewMode === 'chart'} onClick={() => setViewMode('chart')}>グラフ</button>
            </div>
          </div>
          {viewMode === 'table' ? (
            <RankingTable rows={summary.unitRanking} caption="文法項目を単元として集計した、よく出る単元ランキング。" />
          ) : (
            <FrequencyChart data={unitChartData} xKey="name" yKey="count" label="よく出る単元ランキングの棒グラフ" />
          )}
          <div className="mt-6">
            <RankingTable rows={summary.unitRanking} caption="グラフと同一データの表。順位、単元、出現回数、出現率。" />
          </div>
        </section>

        {/* --- SECTION C: 近年頻出ランキング --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="recent-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">近年頻出ランキング</h2>
          <p className="mt-3 max-w-3xl">recent_weighted_score = Σ(出現回数 × session_weight)。最新回1.0、一つ前0.8、二つ前0.6、三つ前0.4、それ以前0.2で算出します。</p>
          <div className="mt-5">
            <RankingTable rows={[]} kind="recent" recentRows={summary.recentRanking} caption="近年頻出ランキング。重み付きスコアと直近の出現を表示。" />
          </div>
        </section>

        {/* --- SECTION D: 出題形式分布 --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="format-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="format-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">出題形式分布</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <FrequencyChart data={formatChartData} xKey="name" yKey="count" label="出題形式分布の棒グラフ" color="#FF6B35" />
            <div className="overflow-x-auto" role="region" aria-label="出題形式分布表">
              <table className="w-full min-w-[420px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">形式、件数、構成比。</caption>
                <thead className="bg-ink text-cream"><tr><th scope="col" className="p-3 text-left">形式</th><th scope="col" className="p-3 text-left">件数</th><th scope="col" className="p-3 text-left">構成比</th></tr></thead>
                <tbody>{summary.formatRows.map((row) => <tr key={row.format} className="border-b-2 border-ink even:bg-blue/5"><td className="p-3 font-bold">{row.format}</td><td className="p-3">{row.count}</td><td className="p-3">{row.rate}%</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- SECTION E: 年度推移 --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION E</p>
          <h2 id="trend-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">年度推移</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <FrequencyChart data={trendChartData} type="line" xKey="session" yKey="count" label="試験回ごとの出現回数の推移グラフ" color="#1A5CFF" />
            <div className="overflow-x-auto" role="region" aria-label="年度推移表">
              <table className="w-full min-w-[520px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">年度推移グラフと同一データの表。</caption>
                <thead className="bg-ink text-cream"><tr><th scope="col" className="p-3 text-left">試験回</th><th scope="col" className="p-3 text-left">単元</th><th scope="col" className="p-3 text-left">出現回数</th><th scope="col" className="p-3 text-left">制度区分</th></tr></thead>
                <tbody>{summary.trendRows.map((row, index) => <tr key={`${row.session}-${row.unit}-${index}`} className="border-b-2 border-ink even:bg-blue/5"><td className="p-3">{row.session}</td><td className="p-3 font-bold">{row.unit}</td><td className="p-3">{row.count}</td><td className="p-3">{row.ruleSet}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- SECTION F: 頻出語彙ランキング --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="vocab-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION F</p>
            <h2 id="vocab-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">頻出語彙ランキング</h2>
            <p className="mt-3 max-w-3xl">
              wink-NLPで抽出した全英単語をCEFRレベル別に分類し、出現頻度が高い内容語を順に表示します。
              固有名詞はNLPの品詞タグで自動検出し、分離表示します。
              {summary.totalContentWords > 0 && (
                <span className="ml-1">集計対象：内容語 {summary.totalContentWords.toLocaleString()} 語</span>
              )}
              {summary.properNounCount > 0 && (
                <span className="ml-1">/ 固有名詞 {summary.properNounCount.toLocaleString()} 語</span>
              )}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-[1.05fr_.95fr]">
              <div className="border-2 border-ink bg-cream p-4">
                <h3 className="font-bold">CEFRとは</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Common European Framework of Reference for Languagesの略で、外国語の習熟度をA1からC2までの段階で表す共通のものさしです。この画面では高認の問題文に出る内容語を、A1からB2、試験語彙、未分類に分けて傾向を見ます。
                </p>
              </div>
              <div className="border-2 border-ink bg-paper p-4">
                <h3 className="font-bold">レベルの読み方</h3>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {cefrGuideRows.map((row) => (
                    <div key={row.level} className="border border-ink/20 bg-cream p-2">
                      <dt className="font-bold">{row.level}：{row.label}</dt>
                      <dd className="mt-1 text-ink/70">{row.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-mincho text-2xl font-bold">頻出語彙トップ30</h3>
            <div className="mt-4">
              <VocabRankingTable
                rows={summary.vocabRanking}
                caption="頻出語彙トップ30。順位、単語、品詞、CEFRレベル、出現回数、出現率、判定根拠。"
                cefrFilter={cefrFilter}
                posFilter={posFilter}
                categoryFilter={categoryFilter}
                limit={30}
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-mincho text-2xl font-bold">CEFRレベル別語彙分布</h3>
              <div className="flex gap-3" role="group" aria-label="CEFR分布の表示形式を切り替える">
                <button className={`hard-button px-4 py-2 ${cefrViewMode === 'chart' ? 'bg-blue text-white' : 'bg-paper'}`} type="button" aria-pressed={cefrViewMode === 'chart'} onClick={() => setCefrViewMode('chart')}>グラフ</button>
                <button className={`hard-button px-4 py-2 ${cefrViewMode === 'table' ? 'bg-blue text-white' : 'bg-paper'}`} type="button" aria-pressed={cefrViewMode === 'table'} onClick={() => setCefrViewMode('table')}>表のみ</button>
              </div>
            </div>
            <CEFRDistributionChart
              rows={summary.cefrDistribution}
              viewMode={cefrViewMode}
              caption="CEFRレベル別の語彙分布。レベル、語彙数、構成比。"
              properNounCount={summary.properNounCount}
              unknownBreakdown={summary.unknownBreakdown}
            />
          </div>
        </section>

        {/* --- SECTION G: 文法×語彙レベル掛け合わせ分析 --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="cross-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION G</p>
            <h2 id="cross-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">文法×語彙レベル分析</h2>
            <p className="mt-3 max-w-3xl">
              文法タグとCEFRレベルを組み合わせて、どの文法項目がどのレベルの語彙と一緒に出題されているかを可視化します。
              固有名詞はクロス集計から除外しています。
            </p>
          </div>
          <GrammarVocabCrossTable
            rows={summary.grammarVocabCross}
            caption="文法項目×CEFRレベルのクロス集計。数字は語彙数。"
          />
        </section>

        {/* --- FILTER --- */}
        <div className="mt-8">
          <FilterPanel
            value={filters}
            onChange={setFilters}
            availableFormats={availableFormats}
            availableGrammar={availableGrammar}
            resultCount={filteredResults.length}
            mixedRuleSets={mixedRuleSets}
          />
        </div>

        {/* --- META: 注記とタグ定義 --- */}
        <section className="mt-8 panel p-5 sm:p-6 md:p-8" aria-labelledby="meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NOTES</p>
          <h2 id="meta-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">注記とタグ定義</h2>
          <p className="mt-3">端末内で抽出した出題傾向データを集計するツールです。問題文・設問文など著作物の表現は保存・再掲載せず、制度区分をまたいだ結果には注意書きを表示します。</p>
          <p className="mt-2">全解析ファイル：{allSummary.totalCount}件 / 表示中：{summary.totalCount}件</p>
          <div className="mt-4 space-y-3">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="font-bold">CEFRレベル判定について（v3 精密版）</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li><strong>直接照合</strong>：CEFRレベル別語彙リスト（A1〜B2、約2,300語基本形 重複排除済み）との完全一致</li>
                <li><strong>レンマ照合</strong>：wink-NLPの見出し語化（organizations → organization）でリストと照合</li>
                <li><strong>語幹照合</strong>：58種の派生接辞ルールで基本形を復元（environmental → environment = A2）</li>
                <li><strong>接頭辞除去</strong>：un-, re-, dis-, inter-, multi- 等16種の接頭辞を除去して照合</li>
                <li><strong>複合語分割</strong>：ハイフン結合語・長い合成語を分割して各部分を照合（well-known → well + known）</li>
                <li><strong>試験語彙（pre-CEFR）</strong>：国名形容詞（Japanese等）、月名、曜日、試験指示語など、CEFRレベル外だが高認に頻出する71語を専用分類</li>
                <li><strong>固有名詞分離</strong>：wink-NLPのPROPNタグ＋139の固有名詞パターンで自動検出し、CEFR分布から除外</li>
              </ul>
              <p className="mt-2 text-xs text-ink/60">上記すべてで一致しない語が「未分類（リスト外）」として残ります。機能語（冠詞・前置詞・接続詞・代名詞・副詞等 244語）は集計対象外です。</p>
            </div>
          </div>
          <p className="mt-4"><a className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline" href="/tags/">タグ定義を見る</a></p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
