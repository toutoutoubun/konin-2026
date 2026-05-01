'use client'

import englishTags from '@/data/englishTags.json'

export type EnglishFilters = {
  ruleSet: string
  sessionRange: string
  format: string
  grammar: string
}

type Props = {
  value: EnglishFilters
  onChange: (value: EnglishFilters) => void
  availableFormats: string[]
  availableGrammar: string[]
  resultCount: number
  mixedRuleSets: boolean
}

const initialFilters: EnglishFilters = {
  ruleSet: 'all',
  sessionRange: 'all',
  format: 'all',
  grammar: 'all'
}

export { initialFilters }

export default function FilterPanel({ value, onChange, availableFormats, availableGrammar, resultCount, mixedRuleSets }: Props) {
  const setValue = (key: keyof EnglishFilters, nextValue: string) => onChange({ ...value, [key]: nextValue })
  const reset = () => onChange(initialFilters)

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="filter-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION F</p>
        <h2 id="filter-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">フィルタ</h2>
        <p id="filter-help" className="mt-3 max-w-3xl">制度区分、試験回範囲、問題形式、文法項目で表示条件を変える。即時反映し、解除ボタンで初期状態に戻せます。</p>
      </div>
      <form className="grid gap-4 md:grid-cols-5" role="search" aria-describedby="filter-help filter-status" onSubmit={(event) => event.preventDefault()}>
        <label className="font-bold">
          制度区分
          <select className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2" value={value.ruleSet} onChange={(event) => setValue('ruleSet', event.target.value)}>
            <option value="all">全件</option>
            {englishTags.rule_sets.map((rule) => <option key={rule.code} value={rule.code}>{rule.code}：{rule.label}</option>)}
          </select>
        </label>
        <label className="font-bold">
          試験回範囲
          <select className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2" value={value.sessionRange} onChange={(event) => setValue('sessionRange', event.target.value)}>
            <option value="all">全件</option>
            <option value="recent4">直近4回</option>
            <option value="recent2">直近2回</option>
            <option value="older">それ以前</option>
          </select>
        </label>
        <label className="font-bold">
          問題形式
          <select className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2" value={value.format} onChange={(event) => setValue('format', event.target.value)}>
            <option value="all">全件</option>
            {availableFormats.map((format) => <option key={format} value={format}>{format}</option>)}
          </select>
        </label>
        <label className="font-bold">
          文法項目
          <select className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2" value={value.grammar} onChange={(event) => setValue('grammar', event.target.value)}>
            <option value="all">全件</option>
            {availableGrammar.map((grammar) => <option key={grammar} value={grammar}>{grammar}</option>)}
          </select>
        </label>
        <button type="button" className="hard-button self-end bg-paper px-4 py-2" onClick={reset}>解除</button>
      </form>
      <div id="filter-status" className="mt-5 border-2 border-ink bg-cream p-4" aria-live="polite">
        {value.ruleSet === 'all' && value.sessionRange === 'all' && value.format === 'all' && value.grammar === 'all'
          ? `フィルタ未適用：全件表示。集計対象 ${resultCount}件。`
          : `表示条件を変える：集計対象 ${resultCount}件。`}
        {mixedRuleSets && <p className="mt-2 font-bold">集計基準が異なるため単純比較に注意。</p>}
      </div>
    </section>
  )
}
