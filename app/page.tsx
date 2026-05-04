import ApplicationTodo from '@/components/ApplicationTodo'
import RouteCompare from '@/components/RouteCompare/RouteCompare'
import ExemptionCheck from '@/components/ExemptionCheck/ExemptionCheck'
import Header from '@/components/Header'
import { officialExamGuideUrl, officialPastExamUrl } from '@/data/subjects'

const navItems = [
  { label: '過去問', href: '#past-exams' },
  { label: 'ツール', href: '#tools' },
  { label: 'タグ定義', href: '/tags/' },
  { label: '更新履歴', href: '/updates/' },
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
            高等学校卒業程度認定試験の情報整理ツールです。ルート比較・免除科目確認・過去問分析の三つの機能で、受験準備を支援します。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#tools">ツールを見る</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">過去問を入手</a>
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
                高認パスは、高等学校卒業程度認定試験（高認）の受験準備を支援する非公式Webツールです。ルート比較・免除科目確認・過去問頻出分析の三つの機能を提供します。
              </p>
              <p>
                制度・日程・出願書類は必ず公式情報を確認してください。データはサーバーへ送信せず、ブラウザ上で処理します。
              </p>
            </div>
          </div>
        </section>

        {/* 過去問の入手方法 */}
        <section id="past-exams" className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="past-exams-title">
          <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">OFFICIAL SOURCE</p>
              <h2 id="past-exams-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-[48px] md:leading-none">過去問の入手方法</h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg">
              <p>文部科学省が公開している過去問PDFを端末に保存し、各科目の分析ページへアップロードします。科目別の分析ページはヘッダーの「過去問分析ツール」プルダウンから選択できます。</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省の過去問ページ</a>
                <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">試験概要を確認</a>
              </div>
            </div>
          </div>
        </section>

        {/* ツール一覧：3カラム並列配置 */}
        <section id="tools" className="mt-8" aria-labelledby="tools-title">
          <div className="mb-6">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">TOOLS</p>
            <h2 id="tools-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-6xl md:leading-none">ツール一覧</h2>
            <p className="mt-3 max-w-2xl text-sm sm:mt-4 sm:text-base">
              出願準備・ルート比較・免除科目確認の三つのツールを提供します。過去問頻出分析ツールはヘッダーの「過去問分析ツール」プルダウンから科目を選択してください。
            </p>
          </div>

          {/* 3-column grid: 1col mobile, 3col desktop */}
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <ApplicationTodo />
            <RouteCompare />
            <ExemptionCheck />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 md:px-10">
        <div className="mx-auto max-w-7xl space-y-2 text-sm sm:text-base">
          <p><strong>更新日</strong> 2026-05-04</p>
          <p><strong>データ範囲</strong> 文部科学省が公開している過去問題PDF。分析はユーザーがブラウザ上でアップロードしたPDFを対象にします。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}
