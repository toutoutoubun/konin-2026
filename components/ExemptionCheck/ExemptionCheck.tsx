'use client'

import { useEffect, useState } from 'react'
import { type ExemptionInput, defaultExemptionInput } from '@/data/exemptions'
import ExemptionInputForm from './ExemptionInput'
import ExemptionResult from './ExemptionResult'
import ExemptionNote from './ExemptionNote'

const STORAGE_KEY = 'koninpass:exemptionCheck'

export default function ExemptionCheck() {
  const [input, setInput] = useState<ExemptionInput>(defaultExemptionInput)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ExemptionInput>
        setInput({ ...defaultExemptionInput, ...parsed, credits: parsed.credits ?? {} })
      }
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  const handleChange = (next: ExemptionInput) => {
    setInput(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch { /* ignore */ }
  }

  const handleClear = () => {
    setInput(defaultExemptionInput)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  }

  return (
    <section className="panel flex flex-col p-4 sm:p-5" aria-labelledby="exemption-check-title">
      <div>
        <p className="font-serifDisplay text-xs uppercase tracking-[.18em]">EXEMPTION CHECK</p>
        <h2 id="exemption-check-title" className="mt-1 font-mincho text-2xl font-bold leading-tight sm:text-3xl">
          <ruby>
            免除<rp>(</rp><rt>めんじょ</rt><rp>)</rp>
          </ruby>
          ・
          <ruby>
            必要<rp>(</rp><rt>ひつよう</rt><rp>)</rp>
          </ruby>
          <ruby>
            科目<rp>(</rp><rt>かもく</rt><rp>)</rp>
          </ruby>
          <ruby>
            確認<rp>(</rp><rt>かくにん</rt><rp>)</rp>
          </ruby>
        </h2>
        <p className="mt-2 text-sm">
          取得済みの単位・技能審査から、免除できる可能性がある科目と受験が必要な可能性がある科目を整理します。単位による免除は学校種別と入学時期ごとに対象科目と必要単位数が変わるため、文部科学省様式の単位修得証明書で確認します。
        </p>
      </div>

      {loaded && (
        <div className="mt-4 flex-1 space-y-4">
          <ExemptionInputForm input={input} onChange={handleChange} onClear={handleClear} />
          <ExemptionResult input={input} />
          <ExemptionNote />
        </div>
      )}
    </section>
  )
}
