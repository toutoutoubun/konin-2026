'use client'

import { useState, useEffect, useRef } from 'react'
import DisplaySettings from '@/components/DisplaySettings'
import SubjectDropdown from '@/components/SubjectNav/SubjectDropdown'
import { primaryNavItems, type NavItem } from '@/data/navigation'

type HeaderProps = {
  // Optional override. If omitted, the standard primary nav is used
  // (4 tools + top). This keeps the global nav consistent across pages
  // per design-doc review B-1.
  navItems?: NavItem[]
  showSubjectDropdown?: boolean
}

// Normalise a pathname for comparison ("/foo" and "/foo/" treated equal).
function normalisePath(path: string) {
  if (!path) return '/'
  if (path === '/') return '/'
  return path.replace(/\/$/, '')
}

export default function Header({ navItems, showSubjectDropdown = true }: HeaderProps) {
  const items = navItems ?? primaryNavItems
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>('')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Pick up current path on the client so we can mark the active nav item.
  useEffect(() => {
    setCurrentPath(normalisePath(window.location.pathname))
  }, [])

  // Close menu on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Lock body scroll when menu is open (mobile)
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isCurrent = (href: string) => {
    if (!currentPath) return false
    // Anchor-only links (e.g. "/#tools") never count as current page.
    if (href.startsWith('#')) return false
    const target = normalisePath(href.split('#')[0] || '/')
    return target === currentPath
  }

  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/95 px-4 py-3 backdrop-blur md:px-10 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Logo — wordmark only.
            (Review A-1: dropped the "KP" round badge; the typography itself
            carries the brand, and a round English-initial badge clashed with
            the otherwise calm, Japanese-typography-led tone.) */}
        <a href="/" className="flex shrink-0 items-center gap-2 no-underline md:gap-3" aria-label="高認パストップへ">
          <span className="font-mincho text-lg font-bold tracking-tight sm:text-xl md:text-2xl">高認パス</span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="主要ナビゲーション" className="hidden items-center gap-4 font-bold md:flex lg:gap-5">
          {showSubjectDropdown && <SubjectDropdown />}
          {items.map((item) => {
            const current = isCurrent(item.href)
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={current ? 'underline decoration-2 underline-offset-[6px]' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Desktop display settings */}
        <div className="hidden md:block">
          <DisplaySettings />
        </div>

        {/* Mobile hamburger */}
        <button
          ref={buttonRef}
          type="button"
          className="grid h-11 w-11 place-items-center border-2 border-ink bg-paper md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="flex flex-col gap-[5px]">
            <span className={`block h-[2px] w-5 bg-ink transition-transform duration-200 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-[2px] w-5 bg-ink transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[2px] w-5 bg-ink transition-transform duration-200 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-[calc(theme(spacing.3)*2+2.75rem+2px)] z-30 bg-ink/30 md:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile slide-down menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`absolute left-0 right-0 top-full z-40 border-b-2 border-ink bg-cream transition-all duration-300 md:hidden ${
          menuOpen ? 'max-h-[80vh] overflow-y-auto opacity-100' : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <nav aria-label="モバイルナビゲーション" className="mx-auto max-w-7xl px-4 py-4">
          {showSubjectDropdown && (
            <div className="mb-3">
              <SubjectDropdown />
            </div>
          )}
          <ul className="space-y-1">
            {items.map((item) => {
              const current = isCurrent(item.href)
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    className={`flex min-h-[48px] items-center border-2 border-ink px-4 py-3 font-bold no-underline transition-colors hover:bg-yellow/40 ${
                      current ? 'bg-yellow/30' : 'bg-paper'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 border-t-2 border-ink pt-4">
            <DisplaySettings />
          </div>
        </nav>
      </div>
    </header>
  )
}
