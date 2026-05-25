import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import RouteCompare from '@/components/RouteCompare/RouteCompare'
import { officialExamGuideUrl } from '@/data/subjects'
import { getToolPage, toolPages } from '@/data/toolPages'

const tool = getToolPage('route-compare')!

export default function RouteComparePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header showSubjectDropdown={true} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 lg:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>{tool.title}</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 lg:px-10" tabIndex={-1}>
        <section className="py-10 md:py-16" aria-labelledby="route-compare-page-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">{tool.label}</p>
          <h1 id="route-compare-page-title" className="mt-4 max-w-5xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl">
            {tool.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:text-xl">{tool.description}</p>
        </section>

        <section className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="route-guide-title">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">DECISION FRAME</p>
              <h2 id="route-guide-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl">進路を比べる観点</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                高認取得、通信制高校への転籍、今の高校への在籍継続は、どれが絶対に正しいというより、時期、単位、費用、卒業資格、今の学校との関係で見え方が変わります。このページでは、相談前に「何を比べるべきか」を揃えることを目的にしています。
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>高認は高卒資格ではなく、高卒と同等に進学・資格受験へ進める資格です。</li>
                <li>通信制高校は卒業できれば高卒資格になりますが、学費やスクーリング条件が学校ごとに異なります。</li>
                <li>在籍継続は学校内の支援や単位状況を確認しながら判断します。</li>
              </ul>
              {/* Review A-2: orange = external official source. */}
              <a className="hard-button button-like inline-flex bg-orange px-4 py-2 no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">文部科学省の試験概要</a>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <section className="panel p-5 sm:p-6" aria-labelledby="route-support-title">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">WHAT THIS HELPS</p>
            <h2 id="route-support-title" className="mt-2 font-mincho text-2xl font-bold sm:text-3xl">こんな人のためのツール</h2>
            <div className="mt-4 space-y-3">
              {tool.bestFor.map((item) => (
                <p key={item} className="border-2 border-ink bg-cream p-3 text-sm font-bold">{item}</p>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              入力内容はお使いのブラウザ（端末側）に保存されます。サーバーには送信されません。ブラウザの履歴・サイトデータを消去すると、入力内容も消えます。最終的な判断は、在籍校、保護者、通信制高校、自治体窓口などに確認しながら行ってください。
            </p>
          </section>

          <RouteCompare />
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

      <SiteFooter />
    </>
  )
}
