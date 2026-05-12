'use client'

import {
  type ExemptionInput as InputType,
  type CommonQualificationLevel,
  type EikenLevel,
  type HistoryExamLevel,
  type UnitedNationsEnglishLevel,
  type ZenshoEnglishLevel,
  eikenLevels,
  exemptionSubjects,
  historyExamLevels,
  sukenLevels,
  unitedNationsEnglishLevels,
  zenshoEnglishLevels,
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
    (input.eiken ?? 'なし') !== 'なし' ||
    (input.suken ?? 'なし') !== 'なし' ||
    (input.rekikenWorld ?? 'なし') !== 'なし' ||
    (input.rekikenJapan ?? 'なし') !== 'なし' ||
    (input.zenshoEnglish ?? 'なし') !== 'なし' ||
    (input.unEnglish ?? 'なし') !== 'なし' ||
    Boolean(input.itPassport)

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
        取得済みの単位・技能審査を入力（すべて任意）
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
          <p className="mt-0.5 text-xs text-ink/60">文部科学省様式の単位修得証明書で確認します。入学時期によって、複数科目の合計や「両方必要」の条件があります。</p>
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
        <p className="text-sm font-bold">取得済みの技能審査（資格・検定）</p>
        <p className="mt-0.5 text-xs text-ink/60">文部科学省の免除対象にある技能審査だけを表示しています。</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="exemption-eiken" className="block text-xs font-bold">
              英検
            </label>
            <select
              id="exemption-eiken"
              value={input.eiken ?? 'なし'}
              onChange={(e) => onChange({ ...input, eiken: e.target.value as EikenLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {eikenLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exemption-zensho-english" className="block text-xs font-bold">
              全商英検
            </label>
            <select
              id="exemption-zensho-english"
              value={input.zenshoEnglish ?? 'なし'}
              onChange={(e) => onChange({ ...input, zenshoEnglish: e.target.value as ZenshoEnglishLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {zenshoEnglishLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exemption-un-english" className="block text-xs font-bold">
              国連英検
            </label>
            <select
              id="exemption-un-english"
              value={input.unEnglish ?? 'なし'}
              onChange={(e) => onChange({ ...input, unEnglish: e.target.value as UnitedNationsEnglishLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {unitedNationsEnglishLevels.map((level) => (
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
              value={input.suken ?? 'なし'}
              onChange={(e) => onChange({ ...input, suken: e.target.value as CommonQualificationLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {sukenLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exemption-rekiken-world" className="block text-xs font-bold">
              歴検（世界史）
            </label>
            <select
              id="exemption-rekiken-world"
              value={input.rekikenWorld ?? 'なし'}
              onChange={(e) => onChange({ ...input, rekikenWorld: e.target.value as HistoryExamLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {historyExamLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exemption-rekiken-japan" className="block text-xs font-bold">
              歴検（日本史）
            </label>
            <select
              id="exemption-rekiken-japan"
              value={input.rekikenJapan ?? 'なし'}
              onChange={(e) => onChange({ ...input, rekikenJapan: e.target.value as HistoryExamLevel })}
              className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-1.5 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
            >
              {historyExamLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <label className="flex min-h-[44px] items-center gap-2 border-2 border-ink bg-paper px-2 py-1.5 text-sm font-bold">
            <input
              type="checkbox"
              checked={Boolean(input.itPassport)}
              onChange={(e) => onChange({ ...input, itPassport: e.target.checked })}
              className="h-5 w-5 shrink-0 accent-blue"
            />
            ITパスポート試験に合格
          </label>
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
