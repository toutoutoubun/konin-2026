'use client'

import {
  type RouteCompareInput as InputType,
  gradeOptions,
  absenceOptions,
  graduationOptions,
  timingOptions,
} from '@/data/routes'

type Props = {
  input: InputType
  onChange: (input: InputType) => void
  onClear: () => void
}

type SelectFieldProps = {
  id: string
  label: string
  value: string | undefined
  options: readonly string[]
  onChange: (value: string) => void
}

function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full min-h-[44px] border-2 border-ink bg-cream px-3 py-2 text-sm focus-visible:outline-4 focus-visible:outline-blue"
      >
        <option value="">選択しない</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

export default function RouteCompareInputForm({ input, onChange, onClear }: Props) {
  const hasInput = Object.values(input).some((v) => v !== undefined)

  return (
    <fieldset className="border-2 border-ink bg-cream p-3 sm:p-4">
      <legend className="border-2 border-ink bg-yellow px-2 py-0.5 text-xs font-bold">
        あなたの状況を入力（すべて任意）
      </legend>
      <div className="mt-2 grid gap-3 grid-cols-2">
        <SelectField
          id="route-grade"
          label="現在の学年"
          value={input.current_grade}
          options={gradeOptions}
          onChange={(v) => onChange({ ...input, current_grade: v as InputType['current_grade'] || undefined })}
        />
        <SelectField
          id="route-absence"
          label="欠席期間"
          value={input.absence_duration}
          options={absenceOptions}
          onChange={(v) => onChange({ ...input, absence_duration: v as InputType['absence_duration'] || undefined })}
        />
        <SelectField
          id="route-graduation"
          label="卒業への意向"
          value={input.graduation_intention}
          options={graduationOptions}
          onChange={(v) => onChange({ ...input, graduation_intention: v as InputType['graduation_intention'] || undefined })}
        />
        <SelectField
          id="route-timing"
          label="希望時期"
          value={input.target_timing}
          options={timingOptions}
          onChange={(v) => onChange({ ...input, target_timing: v as InputType['target_timing'] || undefined })}
        />
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
