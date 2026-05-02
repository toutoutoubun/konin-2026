'use client'

import {
  initialGeoFilters,
  type GeoFilters
} from '@/lib/geographyScoreCalculator'

type Props = {
  value: GeoFilters
  onChange: (value: GeoFilters) => void
  availableTopicL1: string[]
  availableRegions: string[]
  availableFormats: string[]
  detectedSubjects: string[]
  resultCount: number
  mixedRuleSets: boolean
  mixedSubjects: boolean
}

export default function GeographyFilterPanel({
  value,
  onChange,
  availableTopicL1,
  availableRegions,
  availableFormats,
  detectedSubjects,
  resultCount,
  mixedRuleSets,
  mixedSubjects
}: Props) {
  const setValue = (key: keyof GeoFilters, nextValue: string) =>
    onChange({ ...value, [key]: nextValue })
  const reset = () => onChange(initialGeoFilters)

  const isDefault =
    value.ruleSet === 'all' &&
    value.subject === 'all' &&
    value.sessionRange === 'all' &&
    value.topicL1 === 'all' &&
    value.regionTag === 'all' &&
    value.formatTag === 'all'

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="geo-filter-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SECTION F</p>
        <h2 id="geo-filter-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
          フィルタ
        </h2>
        <p id="geo-filter-help" className="mt-3 max-w-3xl">
          制度区分（GEO_OLD / GEO_NEW）・科目（地理A・地理B・地理）・試験回範囲・topic_l1・region_tag・format_tagで表示条件を変える。即時反映し、解除ボタンで初期状態に戻せます。
        </p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-3 xl:grid-cols-7"
        role="search"
        aria-describedby="geo-filter-help geo-filter-status"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="font-bold">
          制度区分
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.ruleSet}
            onChange={(e) => setValue('ruleSet', e.target.value)}
          >
            <option value="all">全件</option>
            <option value="GEO_OLD">GEO_OLD：旧課程 地理A・B</option>
            <option value="GEO_NEW">GEO_NEW：新課程 地理</option>
          </select>
        </label>

        <label className="font-bold">
          科目
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.subject}
            onChange={(e) => setValue('subject', e.target.value)}
          >
            <option value="all">全件</option>
            {detectedSubjects.includes('地理A') && <option value="地理A">地理A</option>}
            {detectedSubjects.includes('地理B') && <option value="地理B">地理B</option>}
            {detectedSubjects.includes('地理') && <option value="地理">地理</option>}
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

        <label className="font-bold">
          テーマ (topic_l1)
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.topicL1}
            onChange={(e) => setValue('topicL1', e.target.value)}
          >
            <option value="all">全件</option>
            {availableTopicL1.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          地域 (region_tag)
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.regionTag}
            onChange={(e) => setValue('regionTag', e.target.value)}
          >
            <option value="all">全件</option>
            {availableRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          出題形式 (format_tag)
          <select
            className="mt-2 min-h-11 w-full border-2 border-ink bg-paper p-2"
            value={value.formatTag}
            onChange={(e) => setValue('formatTag', e.target.value)}
          >
            <option value="all">全件</option>
            {availableFormats.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
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

      <div id="geo-filter-status" className="mt-5 border-2 border-ink bg-cream p-4" aria-live="polite">
        {isDefault
          ? `フィルタ未適用：全件表示。集計対象 ${resultCount}件。`
          : `表示条件を変える：集計対象 ${resultCount}件。`}
        {mixedRuleSets && (
          <p className="mt-2 font-bold">
            旧課程と新課程が混在しています。集計基準が異なるため単純比較に注意してください。
          </p>
        )}
        {mixedSubjects && (
          <p className="mt-2 font-bold">
            地理Aと地理Bが混在しています。科目フィルタで分離して確認することを推奨します。
          </p>
        )}
      </div>
    </section>
  )
}
