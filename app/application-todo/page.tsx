import ApplicationTodo from '@/components/ApplicationTodo'
import ApplicationDocumentsChart from '@/components/ApplicationDocumentsChart'
import Header from '@/components/Header'
import { officialApplicationFlowUrl, officialExamGuideUrl, officialPastExamUrl, officialSpecialAccommodationUrl } from '@/data/subjects'
import { getToolPage, toolPages } from '@/data/toolPages'

const tool = getToolPage('application-todo')!

const navItems = [
  { label: 'トップ', href: '/' },
  { label: '免除確認', href: '/exemption-check/' },
  { label: '分析科目', href: '/analysis/' },
  { label: '更新履歴', href: '/updates/' },
]

export default function ApplicationTodoPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={navItems} showSubjectDropdown={true} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>{tool.title}</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-10 md:py-16" aria-labelledby="application-todo-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">{tool.label}</p>
          <h1 id="application-todo-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl">
            {tool.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:text-xl">{tool.description}</p>
        </section>

        <section className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="todo-guide-title">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">BEFORE YOU START</p>
              <h2 id="todo-guide-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl">出願準備の見取り図</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                このTodoは、公式情報の確認、受験科目の整理、免除申請書類の準備、願書郵送、受験票確認までをひと続きの作業として扱います。特に免除申請は、単位修得証明書や技能審査の証明書類を願書と一緒に出す必要があるため、科目選びより前に確認しておくと後戻りが少なくなります。
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>文部科学省の受験案内で日程、出願期間、必要書類を確認します。</li>
                <li>既取得単位がある場合は、入学時期に合う単位修得証明書の様式を確認します。</li>
                <li>英検・数検・歴検・ITパスポートなどで申請する場合は、技能審査の対象級と証明書類を確認します。</li>
                <li>身体上の障害等により受験上の特別措置を希望する場合は、通常書類に追加する申請書類を確認します。</li>
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">試験概要</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialApplicationFlowUrl} target="_blank" rel="noopener">出願書類フローチャート</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialSpecialAccommodationUrl} target="_blank" rel="noopener">特別措置</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">公式PDF</a>
              </div>
            </div>
          </div>
        </section>

        <ApplicationDocumentsChart />

        <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <section className="panel p-5 sm:p-6" aria-labelledby="todo-support-title">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">WHAT THIS HELPS</p>
            <h2 id="todo-support-title" className="mt-2 font-mincho text-2xl font-bold sm:text-3xl">このページで整理すること</h2>
            <div className="mt-4 grid gap-4">
              {tool.highlights.map((item) => (
                <div key={item} className="border-2 border-ink bg-cream p-3">
                  <p className="text-sm font-bold">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              チェックはこの端末に保存されます。公的な提出状況を記録するものではないため、最終確認は願書、受験案内、文部科学省ページで行ってください。
            </p>
          </section>

          <ApplicationTodo />
        </div>

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
