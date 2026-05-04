'use client'

import {
  type ExemptionInput as InputType,
  type QualificationLevel,
  exemptionSubjects,
  qualificationLevels,
} from '@/data/exemptions'

type Props = {
  input: InputType
  onChange: (input: InputType) => void
  onClear: () => void
}

export default function ExemptionInputForm({ input, onChange, onClear }: Props) {
  const hasInput =
    input.enrolled ||
    Object.values(input.credits).some((v) => v > 0) ||
    input.eiken !== 'なし' ||
    input.suken !== 'なし' ||
    input.kanken !== 'なし' ||
    input.otherQualification !== ''

  const updateCredit = (slug: string, value: string) => {
    const num = parseInt(value, 10)
    const next = { ...input.credits }
    if (isNaN(num) || num <= 0) {
      delete next[slug]
    } else {
      next[slug] = num
    }
    onChange({ ...input, credits: next })
  }

  return (
    <fieldset className="border-2 border-ink bg-cream p-3 sm:p-4">
      <legend className="border-2 border-ink bg-yellow px-2 py-0.5 text-xs font-bold">
        取得済みの単位・資格を入力（すべて任意）
      </legend>

      {/* 高校在籍チェック */}
      <div className="mt-2">
        <label className="flex min-h-[44px] items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={input.enrolled}
            onChange={(e) => onChange({ ...input, enrolled: e.target.checked })}
            className="h-5 w-5 shrink-0 accent-blue"
          />
          高校に在籍したことがある（または在籍中）
        </label>
      </div>

      {/* 単位入力 */}
      {input.enrolled && (
        <div className="mt-3">
          <p className="text-sm font-bold">科目ごとの取得単位数</p>
          <p className="mt-0.5 text-xs text-ink/60">在籍校の成績証明書で確認できます。不明な場合は空欄のまま。</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {exemptionSubjects.map((subject) => (
              <div key={subject.slug}>
                <label htmlFor={`credit-${subject.slug}`} className="block text-xs font-bold leading-tight">
                  {subject.name}
                  {subject.creditThreshold && (
                    <span className="ml-0.5 font-normal text-ink/50">({subject.creditThreshold}単位〜)</span>
                  )}
                </label>
                <input
                  id={`credit-${subject.slug}`}
                  type="number"
                  min="0"
                  max="30"
                  value={input.credits[subject.slug] ?? ''}
                  onChange={(e) => updateCredit(subject.slug, e.target.value)}
                  placeholder="0"
                  className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-2 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 資格・検定 */}
      <div className="mt-3">
        <p className="text-sm font-bold">取得済みの資格・検定</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="exemption-eiken" className="block text-xs font-bold">
              英検
            </label>
            <select
              id="exemption-eiken"
              value={input.eiken}
              onChange={(e) => onChange({ ...input, eiken: e.target.value as QualificationLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {qualificationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exemption-suken" className="block text-xs font-bold">
              数検
            </label>
            <select
              id="exemption-suken"
              value={input.suken}
              onChange={(e) => onChange({ ...input, suken: e.target.value as QualificationLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {qualificationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exemption-kanken" className="block text-xs font-bold">
              漢検
            </label>
            <select
              id="exemption-kanken"
              value={input.kanken}
              onChange={(e) => onChange({ ...input, kanken: e.target.value as QualificationLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {qualificationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2">
          <label htmlFor="exemption-other" className="block text-xs font-bold">
            その他の資格（自由記入）
          </label>
          <input
            id="exemption-other"
            type="text"
            value={input.otherQualification}
            onChange={(e) => onChange({ ...input, otherQualification: e.target.value })}
            placeholder="例：簿記2級、情報処理技術者"
            className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-2 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
          />
        </div>
      </div>

      {hasInput && (
        <div className="mt-3">
          <button
            type="button"
            className="hard-button bg-paper px-3 py-1.5 text-sm"
            onClick={onClear}
          >
            入力をクリアする
          </button>
        </div>
      )}
    </fieldset>
  )
}
