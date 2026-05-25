'use client'

import { useEffect, useRef, useState } from 'react'

// Boolean toggles (single body class each).
type ToggleSetting = {
  kind: 'toggle'
  key: string
  label: string
  className: string
  description?: string
}

// 3-way size/spacing settings stored as 'small' | 'medium' | 'large'
// (medium = default; medium adds no class).
type ScaleSetting = {
  kind: 'scale'
  key: string
  label: string
  options: { value: 'small' | 'medium' | 'large'; label: string; className: string | null }[]
}

type Setting = ToggleSetting | ScaleSetting

const settings: Setting[] = [
  // Review C-1: ON/OFF toggle for furigana (ruby).
  {
    kind: 'toggle',
    key: 'ruby',
    label: 'ふりがな',
    className: 'ruby-on',
    description: '漢字に括弧でふりがなを表示します。',
  },
  // Review C-2: 3-step text size.
  {
    kind: 'scale',
    key: 'textSize',
    label: '文字サイズ',
    options: [
      { value: 'small', label: '小', className: 'text-small' },
      { value: 'medium', label: '中', className: null },
      { value: 'large', label: '大', className: 'text-large' },
    ],
  },
  // Review C-2: 3-step line height.
  {
    kind: 'scale',
    key: 'lineHeight',
    label: '行間',
    options: [
      { value: 'small', label: '標準', className: null },
      { value: 'medium', label: 'ひろめ', className: 'wide-line' },
      { value: 'large', label: 'ひろびろ', className: 'wider-line' },
    ],
  },
  {
    kind: 'toggle',
    key: 'wideLetter',
    label: '文字間隔ひろびろ',
    className: 'wide-letter',
  },
  {
    kind: 'toggle',
    key: 'udFont',
    label: 'UDフォント',
    className: 'ud-font',
    description: 'BIZ UD明朝で表示します。',
  },
  // Review C-2: dark mode.
  {
    kind: 'toggle',
    key: 'darkMode',
    label: 'ダークモード',
    className: 'dark-mode',
  },
  // Review C-2: high contrast mode (WCAG AAA target).
  {
    kind: 'toggle',
    key: 'highContrast',
    label: '高コントラスト',
    className: 'high-contrast',
  },
]

function storageKey(key: string) {
  return `koninpass:${key}`
}

export default function DisplaySettings() {
  const [open, setOpen] = useState(false)
  const [activeToggle, setActiveToggle] = useState<Record<string, boolean>>({})
  const [activeScale, setActiveScale] = useState<Record<string, string>>({})
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const toggles: Record<string, boolean> = {}
    const scales: Record<string, string> = {}
    settings.forEach((s) => {
      if (s.kind === 'toggle') {
        const on = window.localStorage.getItem(storageKey(s.key)) === 'true'
        toggles[s.key] = on
        document.body.classList.toggle(s.className, on)
      } else {
        const saved = window.localStorage.getItem(storageKey(s.key)) || 'medium'
        scales[s.key] = saved
        s.options.forEach((opt) => {
          if (opt.className) document.body.classList.remove(opt.className)
        })
        const chosen = s.options.find((o) => o.value === saved)
        if (chosen?.className) document.body.classList.add(chosen.className)
      }
    })
    setActiveToggle(toggles)
    setActiveScale(scales)
  }, [])

  // Close panel on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = (key: string, className: string) => {
    const next = !activeToggle[key]
    setActiveToggle((prev) => ({ ...prev, [key]: next }))
    document.body.classList.toggle(className, next)
    window.localStorage.setItem(storageKey(key), String(next))
  }

  const setScale = (setting: ScaleSetting, value: 'small' | 'medium' | 'large') => {
    setActiveScale((prev) => ({ ...prev, [setting.key]: value }))
    setting.options.forEach((opt) => {
      if (opt.className) document.body.classList.remove(opt.className)
    })
    const chosen = setting.options.find((o) => o.value === value)
    if (chosen?.className) document.body.classList.add(chosen.className)
    window.localStorage.setItem(storageKey(setting.key), value)
  }

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        // Review A-2: 表示設定 is a supporting (in-site, but non-primary) action.
        // We use the paper/white style instead of orange so the orange palette
        // is reserved for external/official-source links.
        className="hard-button bg-paper px-4 py-2"
        aria-expanded={open}
        aria-controls="display-settings"
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        表示設定
      </button>
      {open && (
        <aside
          ref={panelRef}
          id="display-settings"
          role="dialog"
          aria-labelledby="settings-title"
          className="absolute left-4 right-4 top-20 z-30 max-h-[80vh] overflow-y-auto border-2 border-ink bg-paper p-5 shadow-hard md:left-auto md:right-10 md:top-24 md:w-[560px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="settings-title" className="font-mincho text-2xl font-bold sm:text-3xl">表示設定</h2>
              <p id="settings-help" className="mt-1 text-sm leading-relaxed">
                読みやすさの設定はお使いのブラウザに保存されます（LocalStorage）。ブラウザの履歴・サイトデータを消去すると、設定は初期状態に戻ります。
              </p>
            </div>
            <button
              type="button"
              className="hard-button bg-cream px-3 py-1 text-sm"
              onClick={() => setOpen(false)}
              aria-label="表示設定を閉じる"
            >
              閉じる
            </button>
          </div>

          <div className="mt-4 space-y-5" aria-describedby="settings-help">
            {settings.map((s) => (
              <div key={s.key}>
                <p className="text-sm font-bold">{s.label}</p>
                {s.kind === 'toggle' ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className={`hard-button px-4 py-2 ${activeToggle[s.key] ? 'bg-blue text-white' : 'bg-cream'}`}
                      aria-pressed={Boolean(activeToggle[s.key])}
                      onClick={() => toggle(s.key, s.className)}
                    >
                      {activeToggle[s.key] ? 'ON' : 'OFF'}
                    </button>
                    {s.description && (
                      <span className="text-xs text-ink/70">{s.description}</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={s.label}>
                    {s.options.map((opt) => {
                      const selected = (activeScale[s.key] || 'medium') === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          className={`hard-button px-4 py-2 ${selected ? 'bg-blue text-white' : 'bg-cream'}`}
                          onClick={() => setScale(s, opt.value)}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-ink/60">
            アニメーションを抑えたい場合は、OSの「視差効果を減らす／動きを減らす」設定が自動で反映されます。
          </p>
        </aside>
      )}
    </div>
  )
}
