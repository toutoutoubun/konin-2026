'use client'

import {
  initialJapaneseFilters,
  type JapaneseFilters
} from '@/lib/japaneseScoreCalculator'

type Props = {
  value: JapaneseFilters
  onChange: (value: JapaneseFilters) => void
  availableTopics: string[]
  availableFormats: string[]
  resultCount: number
}

export default function JapaneseFilterPanel({
  value,
  onChange,
  availableTopics,
  availableFormats,
  resultCount
}: Props) {
  const setValue = (key: keyof JapaneseFilters, nextValue: string) =>
    onChange({ ...value, [key]: nextValue })
  const reset = () => onChange(initialJapaneseFilters)

  const isDefault =
    value.topic === 'all' &&
    value.format === 'all' &&
    value.sessionRange === 'all'

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="japanese-filter-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">FILTER</p>
        <h2 id="japanese-filter-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
          フィルタ
        </h2>
        <p id="japanese-filter-help" className="mt-3 max-w-3xl">
          分野、出題形式、試験回範囲で表示条件を変えます。即時反映し、解除ボタンで初期状態に戻せます。
        </p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-4"
        role="search"
        aria-describedby="japanese-filter-help japanese-filter-status"
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

      <div id="japanese-filter-status" className="mt-5 border-2 border-ink bg-cream p-4" aria-live="polite">
        {isDefault
          ? `フィルタ未適用：全件表示。集計対象 ${resultCount}件。`
          : `表示条件を変える：集計対象 ${resultCount}件。`}
      </div>
    </section>
  )
}
