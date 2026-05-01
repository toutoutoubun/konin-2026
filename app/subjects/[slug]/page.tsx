import DisplaySettings from '@/components/DisplaySettings'
import { getSubject, officialPastExamUrl, subjects } from '@/data/subjects'

export function generateStaticParams() {
  return subjects
    .filter((subject) => subject.slug !== 'english')
    .map((subject) => ({ slug: subject.slug }))
}

const formatRows = [
  ['PDFアップロード', '文科省公開の過去問PDFをアップロードすると分析します。ドラッグ&ドロップと複数ファイル選択に対応する構成です。'],
  ['よく出る単元ランキング', '順位・単元・出現回数・出現率を表で表示し、グラフとの切替を用意します。'],
  ['近年頻出ランキング', '重み付きスコアと直近出現回を表示します。'],
  ['出題形式分布', '形式・件数・構成比を表とグラフで併設します。'],
  ['年度推移', '横軸を試験回、縦軸を出現回数として表示し、同一データの表を併設します。'],
  ['フィルタ', '制度区分・試験回範囲・単元大分類・出題形式を即時反映し、解除ボタンで初期状態に戻します。'],
  ['注記とタグ定義', '集計対象、制度区分、タグ定義へのリンクを表示します。']
]

export default function SubjectPage({ params }: { params: { slug: string } }) {
  const subject = getSubject(params.slug)

  if (!subject) return null

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/95 px-4 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 no-underline" aria-label="高認パストップへ">
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-yellow font-serifDisplay text-lg">KP</span>
            <span className="font-bold">高認パス</span>
          </a>
          <nav aria-label="主要ナビゲーション" className="flex flex-wrap gap-5 font-bold">
            <a href="/#tools">ツール一覧</a>
            <a href="/subjects/english/">英語分析</a>
            <a href="/tags/">タグ定義</a>
            <a href="/updates/">更新履歴</a>
          </nav>
          <DisplaySettings />
        </div>
      </header>

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><a href="/#tools">ツール一覧</a><span aria-hidden="true">/</span><span>{subject.name}</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-12 md:py-20" aria-labelledby="subject-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">{subject.label}</p>
          <h1 id="subject-title" className="mt-4 max-w-6xl font-mincho text-6xl font-bold leading-none tracking-[-.06em] md:text-9xl">{subject.name}<br />頻出分析</h1>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed">{subject.description}</p>
          {subject.legacy && <p className="mt-4 max-w-3xl border-2 border-ink bg-paper p-4 font-bold">制度区分：新課程 / {subject.legacy}</p>}
          {subject.status === 'coming-soon' ? (
            <p className="mt-6 border-2 border-ink bg-yellow p-5 text-xl font-bold">令和8年度第1回より追加予定。現在過去問未公開のため分析機能は準備中です。</p>
          ) : (
            <div className="mt-8 flex flex-wrap gap-4" aria-label="主要操作">
              <a className="hard-button button-like bg-blue px-5 py-3 text-white no-underline" href="/subjects/english/">実装済みの英語分析を見る</a>
              <a className="hard-button button-like bg-paper px-5 py-3 no-underline" href={officialPastExamUrl} target="_blank" rel="noopener">文科省の過去問ページ</a>
            </div>
          )}
        </section>

        <section className="panel p-6 md:p-8" aria-labelledby="structure-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">PHASE 1 STRUCTURE</p>
          <h2 id="structure-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">科目詳細ページの構成</h2>
          <p className="mt-3 max-w-3xl">この科目は画面構成を先に配置しています。英語分析と同じレイアウト構造で、PDF解析ロジックを科目別に追加できる状態です。</p>
          <div className="mt-6 overflow-x-auto" role="region" aria-label={`${subject.name}の科目詳細ページ構成表`}>
            <table className="w-full min-w-[640px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">科目詳細ページに配置するセクション。</caption>
              <thead className="bg-ink text-cream"><tr><th scope="col" className="p-3 text-left">セクション</th><th scope="col" className="p-3 text-left">内容</th></tr></thead>
              <tbody>{formatRows.map(([section, detail]) => <tr key={section} className="border-b-2 border-ink even:bg-blue/5"><td className="p-3 font-bold">{section}</td><td className="p-3">{detail}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="nodata-title" aria-live="polite">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">NO DATA</p>
          <h2 id="nodata-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">該当データはない</h2>
          <p className="mt-3">この科目のブラウザ内PDF解析は未実装です。現在はPhase 1のUI構成と導線を確認できます。</p>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-8 text-cream md:px-10">
        <div className="mx-auto max-w-7xl space-y-2">
          <p><strong>更新日</strong> 2026-05-01</p>
          <p><strong>データ範囲</strong> 文部科学省が公開している過去問題PDF。</p>
          <p><strong>注意書き</strong> 高認パスは文部科学省の公式サービスではありません。</p>
          <p><a className="text-yellow" href={officialPastExamUrl} target="_blank" rel="noopener">文部科学省 過去問題ページ</a></p>
        </div>
      </footer>
    </>
  )
}
