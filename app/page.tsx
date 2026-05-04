import ApplicationTodo from '@/components/ApplicationTodo'
import Header from '@/components/Header'
import { officialExamGuideUrl, officialPastExamUrl, subjects } from '@/data/subjects'

const accentClass = {
  blue: 'bg-blue text-white',
  orange: 'bg-orange text-ink',
  yellow: 'bg-yellow text-ink'
}

const navItems = [
  { label: '過去問', href: '#past-exams' },
  { label: '出願Todo', href: '#todo-title' },
  { label: 'ツール一覧', href: '#tools' },
  { label: 'タグ定義', href: '/tags/' },
  { label: '更新履歴', href: '/updates/' },
]

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={navItems} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-10 md:py-20" aria-labelledby="home-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">KONIN PASS</p>
          <h1 id="home-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">
            高認パス<br /><span className="font-serifDisplay italic">Past Exam Index</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            高等学校卒業程度認定試験の公開済み過去問PDFを科目別に集計するWebツールです。PDFはサーバーへ送信せず、ブラウザ上で処理します。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4" aria-label="主要操作">
            <a className="hard-button button-like bg-blue px-5 py-3 text-center text-white no-underline" href="#tools">科目別ツールを見る</a>
            <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">過去問を入手</a>
          </div>
        </section>

        <section id="past-exams" className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="past-exams-title">
          <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">OFFICIAL SOURCE</p>
              <h2 id="past-exams-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-[48px] md:leading-none">過去問の入手方法</h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg">
              <p>文部科学省が公開している過去問PDFを端末に保存し、各科目詳細ページのアップロード領域へ追加します。</p>
              <p>高認パスは公開済みデータを集計している非公式ツールです。制度・日程・出願書類は必ず公式情報を確認してください。</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <a className="hard-button button-like bg-orange px-5 py-3 text-center no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省の過去問ページ</a>
                <a className="hard-button button-like bg-paper px-5 py-3 text-center no-underline" href={officialExamGuideUrl} target="_blank" rel="noopener">試験概要を確認</a>
              </div>
            </div>
          </div>
        </section>

        <ApplicationTodo />

        <section id="tools" className="mt-8" aria-labelledby="tools-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SUBJECT TOOLS</p>
              <h2 id="tools-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl md:text-6xl md:leading-none">ツール一覧</h2>
            </div>
            <p className="max-w-lg text-sm sm:text-base">科目詳細ページは同じ構造で配置します。英語・数学・歴史・地理は分析機能を実装済み、その他はPhase 1の画面設計として準備しています。</p>
          </div>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <article key={subject.slug} className="panel flex min-h-[220px] flex-col p-4 sm:min-h-[260px] sm:p-5" aria-labelledby={`subject-${subject.slug}`}>
                <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">{subject.label}</p>
                <h3 id={`subject-${subject.slug}`} className="mt-2 font-mincho text-2xl font-bold sm:text-4xl">{subject.name}</h3>
                <p className="mt-2 flex-1 text-sm sm:mt-3 sm:text-base">{subject.description}</p>
                {subject.legacy && <p className="mt-2 border-2 border-ink bg-cream p-2 text-sm font-bold">制度区分：{subject.legacy}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
                  <span className={`border-2 border-ink px-3 py-1 text-sm font-bold ${accentClass[subject.accent]}`}>
                    {subject.status === 'active' ? '実装済み' : subject.status === 'coming-soon' ? '準備中' : '画面構成'}
                  </span>
                  <a className="hard-button button-like bg-paper px-4 py-2 text-sm no-underline" href={subject.slug === 'english' ? '/subjects/english/' : subject.slug === 'math' ? '/math/' : subject.slug === 'history' ? '/history/' : subject.slug === 'geography' ? '/geography/' : `/subjects/${subject.slug}/`}>
                    詳細ページへ
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 md:px-10">
        <div className="mx-auto max-w-7xl space-y-2 text-sm sm:text-base">
          <p><strong>更新日</strong> 2026-05-01</p>
          <p><strong>データ範囲</strong> 文部科学省が公開している過去問題PDF。英語分析はユーザーがブラウザ上でアップロードしたPDFを対象にします。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}
