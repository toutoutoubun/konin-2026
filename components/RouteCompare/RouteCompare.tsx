'use client'

import { useEffect, useState } from 'react'
import { type RouteCompareInput } from '@/data/routes'
import RouteCompareInputForm from './RouteCompareInput'
import RouteCompareTable from './RouteCompareTable'
import RouteCompareNote from './RouteCompareNote'

const STORAGE_KEY = 'koninpass:routeCompare'

export default function RouteCompare() {
  const [input, setInput] = useState<RouteCompareInput>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setInput(JSON.parse(saved))
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  const handleChange = (next: RouteCompareInput) => {
    setInput(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch { /* ignore */ }
  }

  const handleClear = () => {
    setInput({})
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  }

  return (
    <section className="panel flex flex-col p-4 sm:p-5" aria-labelledby="route-compare-title">
      <div>
        <p className="font-serifDisplay text-xs uppercase tracking-[.18em]">ROUTE COMPARE</p>
        <h2 id="route-compare-title" className="mt-1 font-mincho text-2xl font-bold leading-tight sm:text-3xl">
          <ruby>
            ルート<rp>(</rp><rt>るーと</rt><rp>)</rp>
          </ruby>
          <ruby>
            比較<rp>(</rp><rt>ひかく</rt><rp>)</rp>
          </ruby>
        </h2>
        <p className="mt-2 text-sm">
          高認取得・通信制高校転籍・在籍継続の三つの選択肢を事実ベースで整理します。
        </p>
      </div>

      {loaded && (
        <div className="mt-4 flex-1 space-y-4">
          <RouteCompareInputForm input={input} onChange={handleChange} onClear={handleClear} />
          <div aria-live="polite" aria-atomic="true">
            <RouteCompareTable input={input} />
          </div>
          <RouteCompareNote />
        </div>
      )}
    </section>
  )
}
