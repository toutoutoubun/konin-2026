'use client'

import { useEffect, useState } from 'react'

const settings = [
  { key: 'ruby', label: 'ふりがな', className: 'ruby-on' },
  { key: 'textSize', label: '文字サイズ 大', className: 'text-large' },
  { key: 'udFont', label: 'UDフォント', className: 'ud-font' },
  { key: 'wideLine', label: '行間 ひろびろ', className: 'wide-line' },
  { key: 'wideLetter', label: '文字間隔 ひろびろ', className: 'wide-letter' }
]

export default function DisplaySettings() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loaded: Record<string, boolean> = {}
    settings.forEach((setting) => {
      loaded[setting.key] = window.localStorage.getItem(`koninpass:${setting.key}`) === 'true'
      document.body.classList.toggle(setting.className, loaded[setting.key])
    })
    setActive(loaded)
  }, [])

  const toggle = (key: string, className: string) => {
    const next = !active[key]
    const nextActive = { ...active, [key]: next }
    setActive(nextActive)
    document.body.classList.toggle(className, next)
    window.localStorage.setItem(`koninpass:${key}`, String(next))
  }

  return (
    <div>
      <button
        type="button"
        className="hard-button bg-orange px-4 py-2"
        aria-expanded={open}
        aria-controls="display-settings"
        onClick={() => setOpen((value) => !value)}
      >
        表示設定
      </button>
      {open && (
        <aside id="display-settings" className="absolute left-4 right-4 top-24 z-30 border-2 border-ink bg-paper p-5 shadow-hard md:left-auto md:right-10 md:w-[560px]" aria-labelledby="settings-title">
          <h2 id="settings-title" className="font-mincho text-3xl font-bold">表示設定</h2>
          <p id="settings-help" className="mt-2">読みやすさの設定はこの端末に保存されます。</p>
          <div className="mt-4 flex flex-wrap gap-3" role="group" aria-describedby="settings-help">
            {settings.map((setting) => (
              <button
                key={setting.key}
                type="button"
                className={`hard-button px-4 py-2 ${active[setting.key] ? 'bg-blue text-white' : 'bg-cream'}`}
                aria-pressed={Boolean(active[setting.key])}
                onClick={() => toggle(setting.key, setting.className)}
              >
                {setting.label}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}
