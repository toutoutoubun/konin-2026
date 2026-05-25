'use client'

import { useState, useEffect, useRef } from 'react'
import { subjects } from '@/data/subjects'
import { subjectHref } from '@/lib/subjectHref'

const analysisSlugs = subjects
  .filter((s) => s.status === 'active' || s.status === 'coming-soon')
  .map((s) => ({
    slug: s.slug,
    name: s.name,
    label: s.label,
    href: subjectHref(s.slug),
  }))

export default function SubjectDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="hard-button flex items-center gap-1.5 bg-paper px-4 py-2 text-sm"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="subject-dropdown-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span>公式過去問PDF傾向分析</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          id="subject-dropdown-menu"
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 w-64 border-2 border-ink bg-paper shadow-hard"
        >
          {analysisSlugs.map((item) => (
            <li key={item.slug} role="none">
              <a
                href={item.href}
                role="menuitem"
                className="flex min-h-[44px] items-center gap-2 border-b border-ink/10 px-4 py-3 text-sm font-bold no-underline transition-colors hover:bg-yellow/30 last:border-0"
                onClick={() => setOpen(false)}
              >
                <span className="font-serifDisplay text-xs uppercase tracking-wider text-ink/50">{item.label}</span>
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
