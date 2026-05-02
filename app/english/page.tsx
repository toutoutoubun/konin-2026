'use client'

import { useMemo, useState } from 'react'
import CEFRDistributionChart from '@/components/CEFRDistributionChart'
import DisplaySettings from '@/components/DisplaySettings'
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

  // Derive CEFR / POS filter values for vocab section
  const cefrFilter = (filters.cefrLevel ?? 'all') as CefrLevel | 'all'
  const posFilter = filters.pos ?? 'all'

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/95 px-4 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 no-underline" aria-label="高認パストップへ">
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-yellow font-serifDisplay text-lg">KP</span>
            <span className="font-bold">高認パス</span>
          </a>
          <nav aria-label="主要ナビゲーション" className="flex flex-wrap gap-5 font-bold">
            <a href="/#tools">ツール一覧</a>
            <a href="#upload-title">PDFアップロード</a>
            <a href="#ranking-title">集計</a>
            <a href="#vocab-title">語彙分析</a>
            <a href="#filter-title">フィルタ</a>
            <a href="/tags/">タグ定義</a>
            <a href="/updates/">更新履歴</a>
          </nav>
          <DisplaySettings />
        </div>
      </header>

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><a href="/#tools">ツール一覧</a><span aria-hidden="true">/</span><span>英語頻出分析</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-12 md:py-20" aria-labelledby="hero-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">ENGLISH PAST EXAM ANALYZER</p>
          <h1 id="hero-title" className="mt-4 max-w-5xl font-mincho text-6xl font-bold leading-none tracking-[-.06em] md:text-9xl">
            英語頻出分析
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed">
            文科省公開の英語過去問PDFをブラウザ上で解析し、よく出る単元、文法項目、問題形式、語彙レベルの傾向を可視化します。PDFはサーバーへ送信しません。
          </p>
          <div className="mt-8 flex flex-wrap gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-white no-underline" href="#upload-title">PDFを分析する</a>
            <a className="hard-button button-like bg-paper px-5 py-3 no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">過去問を入手</a>
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
            <p className="mt-2">次の操作：文科省公開の英語過去問PDFを選び直してください。</p>
          </section>
        )}

        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="status-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ANALYSIS STATUS</p>
          <h2 id="status-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">解析結果</h2>
          {results.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <article key={`${result.fileName}-${result.analyzedAt}`} className="border-2 border-ink bg-cream p-4">
                  <h3 className="text-xl font-bold">{result.fileName}</h3>
                  <p>検出した試験回：{result.examSession}</p>
                  <p>制度区分：{result.ruleSet.code}（{result.ruleSet.label}）</p>
                  <p>検出ブロック：{result.questionBlocks.length}件 / 抽出文字数：{result.rawText.length.toLocaleString()}字</p>
                  <p>内容語数：{(result.totalContentWords ?? 0).toLocaleString()}語</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-2 border-ink bg-cream p-4">該当データはない：PDF解析後に、解析したファイル名・試験回・制度区分を表示します。</p>
          )}
        </section>

        {/* --- SECTION B: よく出る単元ランキング --- */}
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="ranking-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION B</p>
              <h2 id="ranking-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">よく出る単元ランキング</h2>
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
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="recent-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION C</p>
          <h2 id="recent-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">近年頻出ランキング</h2>
          <p className="mt-3 max-w-3xl">recent_weighted_score = Σ(出現回数 × session_weight)。最新回1.0、一つ前0.8、二つ前0.6、三つ前0.4、それ以前0.2で算出します。</p>
          <div className="mt-5">
            <RankingTable rows={[]} kind="recent" recentRows={summary.recentRanking} caption="近年頻出ランキング。重み付きスコアと直近の出現を表示。" />
          </div>
        </section>

        {/* --- SECTION D: 出題形式分布 --- */}
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="format-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION D</p>
          <h2 id="format-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">出題形式分布</h2>
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
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="trend-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION E</p>
          <h2 id="trend-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">年度推移</h2>
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
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="vocab-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION F</p>
            <h2 id="vocab-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">頻出語彙ランキング</h2>
            <p className="mt-3 max-w-3xl">
              wink-NLPで抽出した全英単語をCEFRレベル別に分類し、出現頻度が高い内容語を順に表示します。
              {summary.totalContentWords > 0 && (
                <span className="ml-1">集計対象：内容語 {summary.totalContentWords.toLocaleString()} 語</span>
              )}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-mincho text-2xl font-bold">頻出語彙トップ20</h3>
            <div className="mt-4">
              <VocabRankingTable
                rows={summary.vocabRanking}
                caption="頻出語彙トップ20。順位、単語、品詞、CEFRレベル、出現回数、出現率。"
                cefrFilter={cefrFilter}
                posFilter={posFilter}
                limit={20}
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
            />
          </div>
        </section>

        {/* --- SECTION G: 文法×語彙レベル掛け合わせ分析 --- */}
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="cross-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION G</p>
            <h2 id="cross-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">文法×語彙レベル分析</h2>
            <p className="mt-3 max-w-3xl">
              文法タグとCEFRレベルを組み合わせて、どの文法項目がどのレベルの語彙と一緒に出題されているかを可視化します。
            </p>
          </div>
          <GrammarVocabCrossTable
            rows={summary.grammarVocabCross}
            caption="文法項目×CEFRレベルのクロス集計。ヒートマップ形式。"
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
        <section className="mt-8 panel p-6 md:p-8" aria-labelledby="meta-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NOTES</p>
          <h2 id="meta-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">注記とタグ定義</h2>
          <p className="mt-3">公開済みデータを集計しているブラウザ内ツールです。制度区分をまたいだ結果には注意書きを表示します。</p>
          <p className="mt-2">全解析ファイル：{allSummary.totalCount}件 / 表示中：{summary.totalCount}件</p>
          <div className="mt-4 border-2 border-ink bg-cream p-4">
            <h3 className="font-bold">CEFRレベル判定について</h3>
            <p className="mt-1 text-sm">CEFRレベルは公開語彙リスト（A1〜B2）との照合により判定しています。リストに含まれない語は「未分類」として件数のみ表示します。機能語（冠詞・前置詞・接続詞・代名詞など）は集計対象外です。</p>
          </div>
          <p className="mt-4"><a className="hard-button button-like inline-flex bg-paper px-4 py-2 no-underline" href="/tags/">タグ定義を見る</a></p>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-8 text-cream md:px-10">
        <div className="mx-auto max-w-7xl space-y-2">
          <p><strong>更新日</strong> 2026-05-02</p>
          <p><strong>データ範囲</strong> ユーザーがブラウザ上でアップロードした文科省公開PDF。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}
