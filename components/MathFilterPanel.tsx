'use client'

import { type MathFilters, initialMathFilters } from '@/lib/mathScoreCalculator'

type Props = {
  value: MathFilters
  onChange: (value: MathFilters) => void
  availableBlocks: string[]
  availableL1: string[]
  availableL2: string[]
  resultCount: number
}

export default function MathFilterPanel({
  value,
  onChange,
  availableBlocks,
  availableL1,
  availableL2,
  resultCount
}: Props) {
  const setValue = (key: keyof MathFilters, nextValue: string) =>
    onChange({ ...value, [key]: nextValue })
  const reset = () => onChange(initialMathFilters)
  const isFiltered =
    value.sessionRange !== 'all' ||
    value.block !== 'all' ||
    value.topicL1 !== 'all' ||
    value.topicL2 !== 'all'

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="math-filter-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION E</p>
        <h2 id="math-filter-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
          フィルタ
        </h2>
        <p id="math-filter-help" className="mt-3 max-w-3xl">
          試験回範囲・大問・大分類（topic_l1）・小分類（topic_l2）で表示条件を変更できます。即時反映し、解除ボタンで初期状態に戻せます。
        </p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-5"
        role="search"
        aria-describedby="math-filter-help math-filter-status"
        onSubmit={(event) => event.preventDefault()}
      >
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

        <label className="font-bold">
          大問
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.block}
            onChange={(event) => setValue('block', event.target.value)}
          >
            <option value="all">全件</option>
            {availableBlocks.map((block) => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          大分類
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.topicL1}
            onChange={(event) => setValue('topicL1', event.target.value)}
          >
            <option value="all">全件</option>
            {availableL1.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          小分類
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.topicL2}
            onChange={(event) => setValue('topicL2', event.target.value)}
          >
            <option value="all">全件</option>
            {availableL2.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="hard-button self-end bg-paper px-4 py-2"
          onClick={reset}
          aria-label="フィルタをすべて解除"
        >
          解除
        </button>
      </form>

      <div
        id="math-filter-status"
        className="mt-5 border-2 border-ink bg-cream p-4"
        aria-live="polite"
      >
        {isFiltered
          ? `フィルタ適用中：集計対象 ${resultCount}件。`
          : `フィルタ未適用：全件表示。集計対象 ${resultCount}件。`}
      </div>
    </section>
  )
}
