'use client'

import { useState, useEffect, useRef } from 'react'
import DisplaySettings from '@/components/DisplaySettings'
import SubjectDropdown from '@/components/SubjectNav/SubjectDropdown'

type NavItem = {
  label: string
  href: string
}

type HeaderProps = {
  navItems: NavItem[]
  showSubjectDropdown?: boolean
}

export default function Header({ navItems, showSubjectDropdown = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/95 px-4 py-3 backdrop-blur md:px-10 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2 no-underline md:gap-3" aria-label="高認パストップへ">
          <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-yellow font-serifDisplay text-base md:h-12 md:w-12 md:text-lg">KP</span>
          <span className="font-bold">高認パス</span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="主要ナビゲーション" className="hidden items-center gap-4 font-bold md:flex lg:gap-5">
          {showSubjectDropdown && <SubjectDropdown />}
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
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
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex min-h-[48px] items-center border-2 border-ink bg-paper px-4 py-3 font-bold no-underline transition-colors hover:bg-yellow/40"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t-2 border-ink pt-4">
            <DisplaySettings />
          </div>
        </nav>
      </div>
    </header>
  )
}
