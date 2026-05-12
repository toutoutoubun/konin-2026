import ApplicationTodo from '@/components/ApplicationTodo'
import RouteCompare from '@/components/RouteCompare/RouteCompare'
import ExemptionCheck from '@/components/ExemptionCheck/ExemptionCheck'
import Header from '@/components/Header'
import { officialExamGuideUrl, officialPastExamUrl, subjects } from '@/data/subjects'

const accentClass: Record<string, string> = {
  blue: 'bg-blue text-white',
  orange: 'bg-orange',
  yellow: 'bg-yellow',
}

const statusLabel: Record<string, { text: string; style: string }> = {
  active:       { text: '実装済み', style: 'border-blue bg-blue/10' },
  placeholder:  { text: '準備中',   style: 'border-ink/30 bg-cream' },
  'coming-soon': { text: '画面構成', style: 'border-orange bg-orange/10' },
}

function subjectHref(slug: string) {
  if (slug === 'english') return '/subjects/english/'
  if (slug === 'math') return '/math/'
  if (slug === 'history') return '/history/'
  if (slug === 'geography') return '/geography/'
  if (slug === 'science-life') return '/science-society/'
  if (slug === 'physics') return '/physics/'
  return `/subjects/${slug}/`
}

const navItems = [
  { label: '公式PDF', href: '#past-exams' },
  { label: 'ツール', href: '#tools' },
  { label: 'タグ定義', href: '/tags/' },
  { label: '更新履歴', href: '/updates/' },
]

const toolToc = [
  { id: 'tool-todo',      label: '出願Todoリスト' },
  { id: 'tool-route',     label: 'ルート比較' },
  { id: 'tool-exemption', label: '免除・必要科目確認' },
  { id: 'tool-analysis',  label: '公式PDF傾向分析' },
]

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={navItems} showSubjectDropdown={true} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        {/* Hero */}
        <section className="py-10 md:py-20" aria-labelledby="home-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">KONIN PASS</p>
          <h1 id="home-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            高認パス
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            高等学校卒業程度認定試験の情報整理ツールです。ルート比較・免除科目確認・公式PDFの傾向分析で、受験準備を支援します。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#tools">ツールを見る</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページへ</a>
          </div>
        </section>

        {/* 高認パスとは */}
        <section className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="about-title">
          <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">ABOUT</p>
              <h2 id="about-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-[48px] md:leading-none">
                <ruby>高認<rp>(</rp><rt>こうにん</rt><rp>)</rp></ruby>パスとは
              </h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg">
              <p>
                高認パスは、高等学校卒業程度認定試験（高認）の受験準備を支援する非公式Webツールです。ルート比較・免除科目確認・公式PDFの傾向分析の三つの機能を提供します。
              </p>
              <p>
                高認パスは過去問そのものを提供しません。ユーザーが正当に取得した公式PDFを端末内で解析し、問題文などの著作物の表現ではなく、出題傾向データを可視化します。
              </p>
            </div>
          </div>
        </section>

        {/* 過去問の入手方法 */}
        <section id="past-exams" className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="past-exams-title">
          <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">OFFICIAL SOURCE</p>
              <h2 id="past-exams-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-[48px] md:leading-none">公式PDFの確認方法</h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg">
              <p>文部科学省の公式ページで公開されているPDFをユーザー自身で取得し、各科目の分析ページで端末内解析に使います。高認パス上で過去問本文や設問を配布・再掲載するものではありません。</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページ</a>
                <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">試験概要を確認</a>
              </div>
            </div>
          </div>
        </section>

        {/* ツール一覧 */}
        <section id="tools" className="mt-8" aria-labelledby="tools-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">TOOLS</p>
            <h2 id="tools-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-6xl md:leading-none">ツール一覧</h2>
          </div>

          {/* ── 目次 ── */}
          <nav className="mb-8 border-2 border-ink bg-paper p-4 sm:p-5" aria-label="ツール目次">
            <p className="text-sm font-bold">このページのツール</p>
            <ol className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {toolToc.map((t, i) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="flex min-h-[44px] items-center gap-2 border-2 border-ink bg-cream px-3 py-2 text-sm font-bold no-underline transition-colors hover:bg-yellow/30"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center border border-ink bg-yellow text-xs font-bold tabular-nums" aria-hidden="true">
                      {i + 1}
                    </span>
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── 3カラム：Todo / ルート比較 / 免除確認 ── */}
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div id="tool-todo"><ApplicationTodo /></div>
            <div id="tool-route"><RouteCompare /></div>
            <div id="tool-exemption"><ExemptionCheck /></div>
          </div>

          {/* ── 公式PDF傾向分析ツール ── */}
          <div id="tool-analysis" className="mt-10">
            <div className="mb-5">
              <p className="font-serifDisplay text-xs uppercase tracking-[.18em]">PAST EXAM ANALYSIS</p>
              <h3 className="mt-1 font-mincho text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                <ruby>公式<rp>(</rp><rt>こうしき</rt><rp>)</rp></ruby>PDF
                <ruby>頻出<rp>(</rp><rt>ひんしゅつ</rt><rp>)</rp></ruby>
                <ruby>分析<rp>(</rp><rt>ぶんせき</rt><rp>)</rp></ruby>
                ツール
              </h3>
              <p className="mt-2 max-w-2xl text-sm sm:text-base">
                ユーザーが取得した公式PDFをサーバーへ送信せず端末内で解析し、科目ごとの出題傾向・頻出トピックを可視化します。各カードから科目別ページへ移動してください。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => {
                const st = statusLabel[s.status]
                return (
                  <a
                    key={s.slug}
                    href={subjectHref(s.slug)}
                    className="group border-2 border-ink bg-paper p-4 no-underline transition-colors hover:bg-yellow/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-serifDisplay text-xs uppercase tracking-wider text-ink/50">{s.label}</span>
                        <p className="mt-0.5 font-mincho text-lg font-bold sm:text-xl">{s.name}</p>
                      </div>
                      <span className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${st.style}`}>
                        {st.text}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{s.description}</p>
                    {s.legacy && (
                      <p className="mt-1.5 text-xs text-ink/50">{s.legacy}</p>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 md:px-10">
        <div className="mx-auto max-w-7xl space-y-2 text-sm sm:text-base">
          <p><strong>更新日</strong> 2026-05-04</p>
          <p><strong>データ範囲</strong> ユーザーが正当に取得し、端末内で選択した文部科学省公式PDF。問題文・設問文の配布や再掲載は行いません。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}
