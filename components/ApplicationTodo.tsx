'use client'

import { useEffect, useMemo, useState } from 'react'
import { officialExamGuideUrl, officialPastExamUrl, nextExam } from '@/data/subjects'

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

function calcDaysUntil(dateString: string) {
  const now = new Date()
  const target = new Date(`${dateString}T00:00:00+09:00`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export default function ApplicationTodo() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [days, setDays] = useState<{ exam: number; deadline: number } | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('koninpass:applicationTodo')
    setChecked(saved ? JSON.parse(saved) : {})
    setDays({ exam: calcDaysUntil(nextExam.date), deadline: calcDaysUntil(nextExam.applicationDeadline) })
  }, [])

  const total = useMemo(() => steps.reduce((sum, step) => sum + step.items.length, 0), [])
  const done = Object.values(checked).filter(Boolean).length

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    window.localStorage.setItem('koninpass:applicationTodo', JSON.stringify(next))
  }

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="todo-title">
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">APPLICATION MAP</p>
          <h2 id="todo-title" className="mt-2 font-mincho text-[48px] font-bold leading-none">出願Todoリスト</h2>
          <p className="mt-4 max-w-xl">チェック状態はこの端末に保存されます。</p>
          <dl className="mt-5 grid gap-3 text-lg" aria-live="polite">
            <div className="border-2 border-ink bg-cream p-4">
              <dt className="font-bold">進行状況</dt>
              <dd>{done} / {total} 件</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-5" role="group" aria-label="出願Todoチェックリスト">
          {steps.map((step) => (
            <section key={step.title} aria-labelledby={`todo-${step.title}`}>
              <h3 id={`todo-${step.title}`} className="font-mincho text-2xl font-bold">{step.title}</h3>
              <ul className="mt-3 space-y-2">
                {step.items.map((item) => (
                  <li key={item.id} className="flex gap-3 border-2 border-ink bg-cream p-3">
                    <input
                      id={`todo-${item.id}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 accent-blue"
                      checked={Boolean(checked[item.id])}
                      onChange={() => toggle(item.id)}
                    />
                    <label htmlFor={`todo-${item.id}`} className="flex-1">
                      {item.href ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener' : undefined}>{item.label}</a> : item.label}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
