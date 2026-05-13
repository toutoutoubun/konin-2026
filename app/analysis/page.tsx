import Header from '@/components/Header'
import { officialPastExamUrl, subjects } from '@/data/subjects'
import { getToolPage, toolPages } from '@/data/toolPages'
import { subjectHref } from '@/lib/subjectHref'

const tool = getToolPage('analysis')!

const navItems = [
  { label: 'トップ', href: '/' },
  { label: '出願Todo', href: '/application-todo/' },
  { label: '免除確認', href: '/exemption-check/' },
  { label: 'タグ定義', href: '/tags/' },
]

const statusLabel: Record<string, { text: string; style: string }> = {
  active: { text: '実装済み', style: 'border-blue bg-blue/10' },
  placeholder: { text: '準備中', style: 'border-ink/30 bg-cream' },
  'coming-soon': { text: '画面構成', style: 'border-orange bg-orange/10' },
}

export default function AnalysisPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={navItems} showSubjectDropdown={true} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>{tool.title}</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-10 md:py-16" aria-labelledby="analysis-page-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">{tool.label}</p>
          <h1 id="analysis-page-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl">
            {tool.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:text-xl">{tool.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#subjects">科目を選ぶ</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページ</a>
          </div>
        </section>

        <section className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="analysis-guide-title">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">LOCAL ANALYSIS</p>
              <h2 id="analysis-guide-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl">公式PDFをどう扱うか</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                各科目ページでは、文部科学省公式ページからユーザー自身が取得したPDFを選択します。解析はブラウザ内で行い、PDF本文をサーバーへ送信したり、問題文・設問文を保存して再掲載したりしません。
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {tool.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="subjects" className="mt-8" aria-labelledby="subjects-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SUBJECTS</p>
            <h2 id="subjects-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-6xl md:leading-none">分析する科目を選ぶ</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed">
              実装済みの科目はそのままPDF解析へ進めます。準備中の科目は、タグ定義や画面構成を確認できるページとして置いています。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const status = statusLabel[subject.status]
              return (
                <a
                  key={subject.slug}
                  href={subjectHref(subject.slug)}
                  className="group border-2 border-ink bg-paper p-4 no-underline transition-colors hover:bg-yellow/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-serifDisplay text-xs uppercase tracking-wider text-ink/50">{subject.label}</span>
                      <p className="mt-0.5 font-mincho text-lg font-bold sm:text-xl">{subject.name}</p>
                    </div>
                    <span className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${status.style}`}>
                      {status.text}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{subject.description}</p>
                  {subject.legacy && (
                    <p className="mt-1.5 text-xs text-ink/50">{subject.legacy}</p>
                  )}
                </a>
              )
            })}
          </div>
        </section>

        <section className="mt-8 border-2 border-ink bg-paper p-5 sm:p-6" aria-labelledby="other-tools-title">
          <h2 id="other-tools-title" className="font-mincho text-2xl font-bold">ほかのツール</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {toolPages.filter((item) => item.slug !== tool.slug).map((item) => (
              <a key={item.slug} className="border-2 border-ink bg-cream p-3 font-bold no-underline hover:bg-yellow/30" href={item.href}>
                {item.title}
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
