'use client'

import {
  type ExemptionInput as InputType,
  type AdmissionPeriod,
  type CommonQualificationLevel,
  type EikenLevel,
  type HistoryExamLevel,
  type UnitedNationsEnglishLevel,
  type ZenshoEnglishLevel,
  admissionPeriodOptions,
  eikenLevels,
  formatRequirementGroup,
  getCreditRequirementGroups,
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
  const credits = input.credits ?? {}
  const creditGroups = getCreditRequirementGroups(input.admissionPeriod ?? '')
  const hasInput =
    Boolean(input.admissionPeriod) ||
    Object.values(credits).some((v) => v > 0) ||
    (input.eiken ?? 'なし') !== 'なし' ||
    (input.suken ?? 'なし') !== 'なし' ||
    (input.rekikenWorld ?? 'なし') !== 'なし' ||
    (input.rekikenJapan ?? 'なし') !== 'なし' ||
    (input.zenshoEnglish ?? 'なし') !== 'なし' ||
    (input.unEnglish ?? 'なし') !== 'なし' ||
    Boolean(input.itPassport)

  const updateCredit = (slug: string, value: string) => {
    const num = parseInt(value, 10)
    const next = { ...credits }
    if (isNaN(num) || num <= 0) {
      delete next[slug]
    } else {
      next[slug] = num
    }
    onChange({ ...input, credits: next })
  }

  const updateAdmissionPeriod = (value: AdmissionPeriod) => {
    onChange({ ...input, enrolled: Boolean(value), admissionPeriod: value, credits: {} })
  }

  return (
    <fieldset className="border-2 border-ink bg-cream p-3 sm:p-4">
      <legend className="border-2 border-ink bg-yellow px-2 py-0.5 text-xs font-bold">
        ① 入学時期 → ② 単位 → ③ 取得資格
      </legend>

      <div className="mt-2 border-2 border-ink bg-paper p-3">
        <label htmlFor="admission-period" className="block text-sm font-bold">
          ① 学校種別・入学時期を入力
        </label>
        <select
          id="admission-period"
          value={input.admissionPeriod ?? ''}
          onChange={(e) => updateAdmissionPeriod(e.target.value as AdmissionPeriod)}
          className="mt-1 w-full min-h-[44px] border-2 border-ink bg-cream px-3 py-2 text-sm focus-visible:outline-4 focus-visible:outline-blue"
        >
          {admissionPeriodOptions.map((option) => (
            <option key={option.value || 'blank'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-relaxed text-ink/60">
          {admissionPeriodOptions.find((option) => option.value === (input.admissionPeriod ?? ''))?.description}
        </p>
      </div>

      {input.admissionPeriod ? (
        <div className="mt-3 border-2 border-ink bg-paper p-3">
          <p className="text-sm font-bold">② 入学時期に合わせた単位フォーム</p>
          <p className="mt-0.5 text-xs text-ink/60">
            単位修得証明書の科目名と単位数を見ながら入力します。高専の場合は「高等専門学校の科目」欄にある各分野の修得単位で確認します。
          </p>
          <div className="mt-3 space-y-3">
            {creditGroups.map((group) => (
              <section key={`${group.subjectSlug}-${group.label}`} className="border-2 border-ink bg-cream p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold">{group.label}</h4>
                    <p className="mt-1 text-xs text-ink/70">{formatRequirementGroup(group)}</p>
                  </div>
                  <span className="border border-ink/20 bg-paper px-2 py-0.5 text-xs font-bold">
                    {group.mode === 'all' ? 'すべて必要' : group.mode === 'sum' ? '合計判定' : 'いずれか'}
                  </span>
                </div>
                {group.note && <p className="mt-1 text-xs text-ink/60">{group.note}</p>}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {group.courses.map((course) => (
                    <div key={course.key}>
                      <label htmlFor={`credit-${course.key}`} className="block text-xs font-bold leading-tight">
                        {course.name}
                        {course.requiredCredits != null && (
                          <span className="ml-0.5 font-normal text-ink/50">({course.requiredCredits}単位〜)</span>
                        )}
                      </label>
                      <input
                        id={`credit-${course.key}`}
                        type="number"
                        min="0"
                        max="30"
                        value={credits[course.key] ?? ''}
                        onChange={(e) => updateCredit(course.key, e.target.value)}
                        placeholder="0"
                        className="mt-0.5 w-full min-h-[44px] border-2 border-ink bg-paper px-2 py-1.5 text-sm focus-visible:outline-4 focus-visible:outline-blue"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 border-2 border-ink/30 bg-paper p-3 text-sm text-ink/70">
          ② 単位フォームは、①で学校種別・入学時期を選ぶと表示されます。
        </div>
      )}

      {/* 資格・検定 */}
      <div className="mt-3 border-2 border-ink bg-paper p-3">
        <p className="text-sm font-bold">③ 取得資格を入力</p>
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
