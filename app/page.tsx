import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { officialExamGuideUrl, officialPastExamUrl } from '@/data/subjects'
import { toolPages } from '@/data/toolPages'

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header showSubjectDropdown={true} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-10 md:py-20" aria-labelledby="home-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">KONIN PASS</p>
          <h1 id="home-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            高認パス
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            高等学校卒業程度認定試験の準備を、出願、進路比較、免除確認、公式PDF傾向分析に分けて整理する非公式Webツールです。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            {/* Color semantics (review A-2):
                  blue   = primary in-site action (stay inside the site)
                  orange = external / official source link
                  white  = secondary / supporting action */}
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#tools">ツールを選ぶ</a>
            <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページへ</a>
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
                {/* Review A-2: orange for external official sources. */}
                <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省公式PDFページ</a>
                <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">試験概要を確認</a>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="mt-8" aria-labelledby="tools-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">TOOLS</p>
            <h2 id="tools-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-6xl md:leading-none">ツールを選ぶ</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed sm:text-lg">
              出願準備、進路比較、免除確認、過去問分析のどこから始めたいかを選んでください。
            </p>
            {/* Review A-3: explicit note so the four tools don't look like
                a sequential 1→2→3→4 process. They are independent. */}
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
              この4つは独立したツールです。順番に進める必要はなく、どれからでも、どれだけでも使えます。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {toolPages.map((tool) => (
              <article key={tool.slug} className="border-2 border-ink bg-paper p-5 sm:p-6">
                {/* Review A-3: removed numeric (1/2/3/4) badges from the
                    top-right corner; we keep only the English slug to avoid
                    suggesting a forced ordering. */}
                <div>
                  <p className="font-serifDisplay text-xs uppercase tracking-[.18em] text-ink/60">{tool.label}</p>
                  <h3 className="mt-1 font-mincho text-2xl font-bold sm:text-3xl">{tool.title}</h3>
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
                  {/* Review A-2: in-site primary action = blue. */}
                  <a className="hard-button button-like inline-flex bg-blue px-4 py-2 text-white no-underline" href={tool.href}>
                    {tool.cta}
                  </a>
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter updateDate="2026-05-25" />
    </>
  )
}
