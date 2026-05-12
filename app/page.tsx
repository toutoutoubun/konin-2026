import Header from '@/components/Header'
import { officialExamGuideUrl, officialPastExamUrl } from '@/data/subjects'
import { toolPages } from '@/data/toolPages'

const accentClass: Record<string, string> = {
  blue: 'bg-blue text-white',
  orange: 'bg-orange',
  yellow: 'bg-yellow',
}

const navItems = [
  { label: '公式PDF', href: '#past-exams' },
  { label: 'ツール', href: '#tools' },
  { label: '分析科目', href: '/analysis/' },
  { label: 'タグ定義', href: '/tags/' },
  { label: '更新履歴', href: '/updates/' },
]

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={navItems} showSubjectDropdown={true} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-10 md:py-20" aria-labelledby="home-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">KONIN PASS</p>
          <h1 id="home-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            高認パス
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            高等学校卒業程度認定試験の準備を、出願、進路比較、免除確認、公式PDF傾向分析に分けて整理する非公式Webツールです。トップページは全体の入口として使い、各機能は専用ページで落ち着いて操作できます。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#tools">ツールを選ぶ</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページへ</a>
          </div>
        </section>

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
                高認パスは、受験準備で散らばりやすい情報を「行動に移しやすい単位」に分けるための作業場です。公式情報そのものの代わりではなく、文部科学省ページや在籍校で確認する前後に、必要事項を整理するために使います。
              </p>
              <p>
                公式PDF傾向分析では、ユーザーが正当に取得したPDFを端末内で解析します。問題文や設問文などの著作物を保存・再掲載せず、学習計画に使う集計データだけを表示します。
              </p>
            </div>
          </div>
        </section>

        <section id="past-exams" className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="past-exams-title">
          <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">OFFICIAL SOURCE</p>
              <h2 id="past-exams-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-[48px] md:leading-none">公式情報の確認</h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg">
              <p>
                高認の制度、出願日程、受験案内、過去問題PDFは文部科学省の公式ページで確認します。高認パスの各ツールは、公式情報を見ながら自分の状況を整理するための補助として作っています。
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページ</a>
                <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">試験概要を確認</a>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="mt-8" aria-labelledby="tools-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">TOOLS</p>
            <h2 id="tools-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-6xl md:leading-none">ツールを選ぶ</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed sm:text-lg">
              4つのツールはそれぞれ別ページに分けました。出願準備、進路比較、免除確認、過去問分析のどこから始めたいかを選んでください。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {toolPages.map((tool, index) => (
              <article key={tool.slug} className="border-2 border-ink bg-paper p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serifDisplay text-xs uppercase tracking-[.18em] text-ink/60">{tool.label}</p>
                    <h3 className="mt-1 font-mincho text-2xl font-bold sm:text-3xl">{tool.title}</h3>
                  </div>
                  <span className={`grid h-9 w-9 place-items-center border-2 border-ink font-bold tabular-nums ${accentClass[tool.accent]}`}>
                    {index + 1}
                  </span>
                </div>
                <p className="mt-3 text-base leading-relaxed">{tool.summary}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{tool.description}</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-bold">できること</h4>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed">
                      {tool.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">向いている場面</h4>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed">
                      {tool.bestFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-5">
                  <a className="hard-button button-like inline-flex bg-cream px-4 py-2 no-underline" href={tool.href}>
                    {tool.cta}
                  </a>
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 md:px-10">
        <div className="mx-auto max-w-7xl space-y-2 text-sm sm:text-base">
          <p><strong>更新日</strong> 2026-05-13</p>
          <p><strong>データ範囲</strong> ユーザーが正当に取得し、端末内で選択した文部科学省公式PDF。問題文・設問文の配布や再掲載は行いません。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}
