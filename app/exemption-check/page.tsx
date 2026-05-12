import ExemptionCheck from '@/components/ExemptionCheck/ExemptionCheck'
import Header from '@/components/Header'
import {
  officialApplicationFlowUrl,
  officialCreditCertificateUrl,
  officialExemptionRequirementsUrl,
  officialHighSchoolCreditExemptionUrl,
  officialSkillExemptionUrl,
} from '@/data/subjects'
import { getToolPage, toolPages } from '@/data/toolPages'

const tool = getToolPage('exemption-check')!

const navItems = [
  { label: 'トップ', href: '/' },
  { label: '出願Todo', href: '/application-todo/' },
  { label: 'ルート比較', href: '/route-compare/' },
  { label: '分析科目', href: '/analysis/' },
]

export default function ExemptionCheckPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={navItems} showSubjectDropdown={true} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>{tool.title}</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-10 md:py-16" aria-labelledby="exemption-check-page-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">{tool.label}</p>
          <h1 id="exemption-check-page-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl">
            {tool.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:text-xl">{tool.description}</p>
        </section>

        <section className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="exemption-guide-title">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">OFFICIAL CHECK</p>
              <h2 id="exemption-guide-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl">免除申請で見る書類</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                免除は「単位を修得したから自動で反映される」ものではなく、出願時に申請し、証明書類を提出して確認されます。入学時期、修得した高校科目、必要単位数、技能審査の対象級がずれると判定が変わるため、公式PDFと証明書類を並べて確認します。
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>高校単位で申請する場合は、入学時期A〜Eごとの表を確認します。</li>
                <li>単位修得証明書で修得単位が確認できない場合、単位による免除申請はできません。</li>
                <li>技能審査は、英検、全商英検、国連英検、数検、歴検、ITパスポートなど、公式一覧にあるものだけを確認します。</li>
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialExemptionRequirementsUrl} target="_blank" rel="noopener">免除要件</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialHighSchoolCreditExemptionUrl} target="_blank" rel="noopener">高校単位免除要件</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialSkillExemptionUrl} target="_blank" rel="noopener">技能審査一覧</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialCreditCertificateUrl} target="_blank" rel="noopener">証明書様式</a>
                <a className="hard-button button-like bg-paper px-4 py-2 no-underline" href={officialApplicationFlowUrl} target="_blank" rel="noopener">出願書類</a>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <section className="panel p-5 sm:p-6" aria-labelledby="exemption-support-title">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">WHAT THIS HELPS</p>
            <h2 id="exemption-support-title" className="mt-2 font-mincho text-2xl font-bold sm:text-3xl">このページの使いどころ</h2>
            <div className="mt-4 space-y-3">
              {tool.highlights.map((item) => (
                <p key={item} className="border-2 border-ink bg-cream p-3 text-sm font-bold">{item}</p>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              表示結果は下書きです。願書に書く免除科目は、文部科学省の受験案内と証明書類で必ず確認してください。
            </p>
          </section>

          <ExemptionCheck />
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
