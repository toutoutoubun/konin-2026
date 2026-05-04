'use client'

import { useEffect, useState } from 'react'
import { officialExamGuideUrl, officialPastExamUrl } from '@/data/subjects'

type TodoItem = {
  id: string
  label: string
  href?: string
}

type TodoStep = {
  title: string
  items: TodoItem[]
}

const steps: TodoStep[] = [
  {
    title: 'STEP 1：試験を知る',
    items: [
      { id: 'guide', label: '高卒認定試験の概要確認', href: officialExamGuideUrl },
      { id: 'eligibility', label: '受験資格の確認' },
      { id: 'requirements', label: '科目と合格要件の確認' },
      { id: 'schedule', label: '試験日程の確認' },
      { id: 'exemption', label: '既取得単位による科目免除の確認' }
    ]
  },
  {
    title: 'STEP 2：科目を選ぶ',
    items: [
      { id: 'subjects', label: '受験科目を決める' },
      { id: 'exemption-subjects', label: '免除申請できる科目を確認する' },
      { id: 'download-pdfs', label: '過去問を文科省サイトからダウンロードする', href: officialPastExamUrl },
      { id: 'analysis', label: '頻出分析ツールで出題傾向を確認する', href: '#tools' }
    ]
  },
  {
    title: 'STEP 3：出願する',
    items: [
      { id: 'form', label: '願書を入手する' },
      { id: 'period', label: '出願期間を確認する' },
      { id: 'documents', label: '必要書類を揃える（住民票・証明写真・検定料など）' },
      { id: 'fee', label: '検定料を確認・納付する（収入印紙）' },
      { id: 'mail', label: '願書を郵送する（簡易書留）' },
      { id: 'ticket', label: '受験票の到着を確認する' }
    ]
  },
  {
    title: 'STEP 4：試験当日',
    items: [
      { id: 'venue', label: '試験会場と時間を確認する' },
      { id: 'belongings', label: '持ち物を確認する（受験票・鉛筆・消しゴム・時計など）' }
    ]
  },
  {
    title: 'STEP 5：合格後',
    items: [
      { id: 'certificate', label: '合格証書の受け取りを確認する' },
      { id: 'partial', label: '一部科目合格の場合、次回の受験科目を確認する' }
    ]
  }
]

export default function ApplicationTodo() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({ 'STEP 1：試験を知る': true })

  useEffect(() => {
    const saved = window.localStorage.getItem('koninpass:applicationTodo')
    setChecked(saved ? JSON.parse(saved) : {})
  }, [])

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    window.localStorage.setItem('koninpass:applicationTodo', JSON.stringify(next))
  }

  const toggleStep = (title: string) => {
    setOpenSteps((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const stepDone = (step: TodoStep) => step.items.filter((item) => checked[item.id]).length

  return (
    <section className="panel flex flex-col p-4 sm:p-5" aria-labelledby="todo-title">
      {/* Header */}
      <div>
        <p className="font-serifDisplay text-xs uppercase tracking-[.18em]">APPLICATION MAP</p>
        <h2 id="todo-title" className="mt-1 font-mincho text-2xl font-bold leading-tight sm:text-3xl">
          <ruby>出願<rp>(</rp><rt>しゅつがん</rt><rp>)</rp></ruby>
          Todoリスト
        </h2>
      </div>

      <p className="mt-3 text-xs text-ink/60">チェック状態はこの端末に保存されます。</p>

      {/* Accordion steps */}
      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto" role="group" aria-label="出願Todoチェックリスト">
        {steps.map((step) => {
          const isOpen = openSteps[step.title] ?? false
          const sDone = stepDone(step)
          const sTotal = step.items.length
          const allDone = sDone === sTotal

          return (
            <section key={step.title} aria-labelledby={`todo-heading-${step.title}`}>
              <button
                type="button"
                id={`todo-heading-${step.title}`}
                className={`flex w-full min-h-[44px] items-center gap-2 border-2 border-ink px-3 py-2 text-left text-sm font-bold transition-colors ${allDone ? 'bg-blue/10' : 'bg-cream'}`}
                aria-expanded={isOpen}
                onClick={() => toggleStep(step.title)}
              >
                <svg
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="flex-1">{step.title}</span>
                <span className={`shrink-0 border border-ink px-1.5 py-0.5 text-xs tabular-nums ${allDone ? 'bg-blue text-white' : 'bg-paper'}`}>
                  {sDone}/{sTotal}
                </span>
              </button>
              {isOpen && (
                <ul className="border-x-2 border-b-2 border-ink">
                  {step.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2.5 border-b border-ink/10 px-3 py-2 last:border-0">
                      <input
                        id={`todo-${item.id}`}
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-blue"
                        checked={Boolean(checked[item.id])}
                        onChange={() => toggle(item.id)}
                      />
                      <label htmlFor={`todo-${item.id}`} className="flex-1 text-sm leading-snug">
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener' : undefined}
                          >
                            {item.label}
                          </a>
                        ) : (
                          item.label
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}
