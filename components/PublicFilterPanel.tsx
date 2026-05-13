'use client'

import {
  initialPublicFilters,
  type PublicFilters
} from '@/lib/publicScoreCalculator'

type Props = {
  value: PublicFilters
  onChange: (value: PublicFilters) => void
  availableTopics: string[]
  availableFormats: string[]
  availableRuleSets: Array<{ code: string; label: string }>
  resultCount: number
}

export default function PublicFilterPanel({
  value,
  onChange,
  availableTopics,
  availableFormats,
  availableRuleSets,
  resultCount
}: Props) {
  const setValue = (key: keyof PublicFilters, nextValue: string) =>
    onChange({ ...value, [key]: nextValue })
  const reset = () => onChange(initialPublicFilters)

  const isDefault =
    value.topic === 'all' &&
    value.format === 'all' &&
    value.ruleSet === 'all' &&
    value.sessionRange === 'all'

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="public-filter-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">FILTER</p>
        <h2 id="public-filter-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
          フィルタ
        </h2>
        <p id="public-filter-help" className="mt-3 max-w-3xl">
          頻出分野・出題形式・制度区分・試験回範囲で表示条件を変える。公共PDFを主軸に、旧課程PDFは参考区分として切り分けられます。
        </p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-5"
        role="search"
        aria-describedby="public-filter-help public-filter-status"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="font-bold">
          分野
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.topic}
            onChange={(event) => setValue('topic', event.target.value)}
          >
            <option value="all">全件</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          出題形式
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.format}
            onChange={(event) => setValue('format', event.target.value)}
          >
            <option value="all">全件</option>
            {availableFormats.map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          制度区分
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.ruleSet}
            onChange={(event) => setValue('ruleSet', event.target.value)}
          >
            <option value="all">全件</option>
            {availableRuleSets.map((rule) => (
              <option key={rule.code} value={rule.code}>{rule.label}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          試験回範囲
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.sessionRange}
            onChange={(event) => setValue('sessionRange', event.target.value)}
          >
            <option value="all">全件</option>
            <option value="recent4">直近4回</option>
            <option value="recent2">直近2回</option>
            <option value="older">それ以前</option>
          </select>
        </label>

        <button
          type="button"
          className="hard-button self-end bg-paper px-4 py-2"
          onClick={reset}
        >
          解除
        </button>
      </form>

      <div id="public-filter-status" className="mt-5 border-2 border-ink bg-cream p-4" aria-live="polite">
        {isDefault
          ? `フィルタ未適用：全件表示。集計対象 ${resultCount}件。`
          : `表示条件を変える：集計対象 ${resultCount}件。`}
      </div>
    </section>
  )
}
