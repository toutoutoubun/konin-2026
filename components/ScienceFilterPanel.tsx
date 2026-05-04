'use client'

import {
  initialSciFilters,
  type SciFilters
} from '@/lib/scienceScoreCalculator'

type Props = {
  value: SciFilters
  onChange: (value: SciFilters) => void
  availableGroups: string[]
  resultCount: number
}

export default function ScienceFilterPanel({
  value,
  onChange,
  availableGroups,
  resultCount
}: Props) {
  const setValue = (key: keyof SciFilters, nextValue: string) =>
    onChange({ ...value, [key]: nextValue })
  const reset = () => onChange(initialSciFilters)

  const isDefault =
    value.group === 'all' &&
    value.sessionRange === 'all'

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="sci-filter-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION E</p>
        <h2 id="sci-filter-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">
          フィルタ
        </h2>
        <p id="sci-filter-help" className="mt-3 max-w-3xl">
          <ruby>分野<rt>ぶんや</rt></ruby>（<ruby>物理系<rt>ぶつりけい</rt></ruby>・<ruby>化学系<rt>かがくけい</rt></ruby>・<ruby>生物系<rt>せいぶつけい</rt></ruby>・<ruby>地学系<rt>ちがくけい</rt></ruby>）・<ruby>試験回<rt>しけんかい</rt></ruby><ruby>範囲<rt>はんい</rt></ruby>で表示条件を変える。即時反映し、解除ボタンで初期状態に戻せます。
        </p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-3"
        role="search"
        aria-describedby="sci-filter-help sci-filter-status"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="font-bold">
          分野
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.group}
            onChange={(e) => setValue('group', e.target.value)}
          >
            <option value="all">全件</option>
            {availableGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          試験回範囲
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.sessionRange}
            onChange={(e) => setValue('sessionRange', e.target.value)}
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

      <div id="sci-filter-status" className="mt-5 border-2 border-ink bg-cream p-4" aria-live="polite">
        {isDefault
          ? `フィルタ未適用：全件表示。集計対象 ${resultCount}件。`
          : `表示条件を変える：集計対象 ${resultCount}件。`}
      </div>
    </section>
  )
}
