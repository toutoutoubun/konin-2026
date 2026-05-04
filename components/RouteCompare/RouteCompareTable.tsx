'use client'

import { useState } from 'react'
import { routes, type RouteCompareInput, conditionalNotes } from '@/data/routes'

type Props = {
  input: RouteCompareInput
}

const accentMap: Record<string, string> = {
  kounin: 'bg-blue text-white',
  tsushinsei: 'bg-orange',
  zaiseki: 'bg-yellow',
}

export default function RouteCompareTable({ input }: Props) {
  const [openRoute, setOpenRoute] = useState<string>('kounin')
  const hasInput = Object.values(input).some((v) => v !== undefined)
  const activeNotes = hasInput
    ? conditionalNotes.filter((note) => note.condition(input))
    : []

  return (
    <div className="space-y-1.5" role="list" aria-label="ルート比較">
      {routes.map((route) => {
        const isOpen = openRoute === route.slug
        const routeNotes = activeNotes.filter((n) => !n.route || n.route === route.slug)

        return (
          <article key={route.slug} role="listitem" aria-labelledby={`route-${route.slug}`}>
            <button
              type="button"
              id={`route-${route.slug}`}
              className={`flex w-full min-h-[44px] items-center gap-2 border-2 border-ink px-3 py-2 text-left text-sm font-bold transition-colors ${isOpen ? accentMap[route.slug] ?? 'bg-cream' : 'bg-cream'}`}
              aria-expanded={isOpen}
              onClick={() => setOpenRoute(isOpen ? '' : route.slug)}
            >
              <svg
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="flex-1 font-mincho text-base">{route.name}</span>
            </button>

            {isOpen && (
              <div className="border-x-2 border-b-2 border-ink bg-paper">
                <p className="border-b border-ink/10 px-3 py-2 text-sm">{route.description}</p>
                <dl>
                  {route.points.map((point) => (
                    <div key={point.label} className="flex gap-2 border-b border-ink/10 px-3 py-2 last:border-0">
                      <dt className="w-20 shrink-0 text-sm font-bold">{point.label}</dt>
                      <dd className="flex-1 text-sm">{point.value}</dd>
                    </div>
                  ))}
                </dl>
                {routeNotes.length > 0 && (
                  <div className="space-y-1.5 border-t border-ink/10 px-3 py-2" aria-live="polite">
                    {routeNotes.map((note, i) => (
                      <p
                        key={i}
                        className="border border-blue/30 bg-blue/5 p-2 text-sm"
                      >
                        <span className="mr-1 inline-block border border-ink bg-yellow px-1 py-0.5 text-xs font-bold" aria-hidden="true">
                          参考
                        </span>
                        {note.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
