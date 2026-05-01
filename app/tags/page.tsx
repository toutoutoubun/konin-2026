import DisplaySettings from '@/components/DisplaySettings'
import englishTags from '@/data/englishTags.json'
import { subjects } from '@/data/subjects'

const tagRows = [
  ['EN-GRAMMAR-TENSE', '時制', '現在・過去・未来・完了形の用法を問う表現。', '助動詞、完了形、時を表す副詞句を含む問題に付与。', '現在完了、過去完了、未来表現'],
  ['EN-GRAMMAR-VOICE', '態', '能動態・受動態の使い分け。', 'be動詞＋過去分詞、by句、受動表現を含む問題に付与。', '受動態、能動態'],
  ['EN-GRAMMAR-CLAUSE', '節', '関係詞・接続詞・仮定法など、文構造を作る要素。', '関係代名詞、関係副詞、if節、接続詞を含む問題に付与。', '関係代名詞、仮定法'],
  ['EN-FORM-CONVERSATION', '会話', '対話文の空所補充や応答選択。', 'A/B形式、会話の流れを問う設問に付与。', 'A: / B: で構成される会話文'],
  ['EN-FORM-READING', '長文読解', '英文パッセージを読んで内容を答える形式。', 'まとまった英文と複数設問を含むブロックに付与。', '内容一致、要旨把握'],
  ['COMMON-PENDING', '判定保留', 'PDF抽出結果だけでは単元を確定しにくい項目。', 'OCR崩れ、問題文欠落、表組み崩れがある場合に補助的に付与。', '文字化けした大問、画像化された表']
]

const formatTags = ['強勢', '会話', '語句整序', 'メッセージ', '語彙', '資料読解', '資料・お知らせ', '長文読解', '文順']

export default function TagsPage() {
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
            <a href="/tags/" aria-current="page">タグ定義</a>
            <a href="/updates/">更新履歴</a>
          </nav>
          <DisplaySettings />
        </div>
      </header>

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>タグ定義</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-12 md:py-20" aria-labelledby="tags-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">TAG DICTIONARY</p>
          <h1 id="tags-title" className="mt-4 max-w-6xl font-mincho text-6xl font-bold leading-none tracking-[-.06em] md:text-9xl">タグ定義</h1>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed">コード、タグ名、定義、付与ルール、具体例を並べます。科目ごとの分析結果を読むための補助ページです。</p>
        </section>

        <section className="panel p-6 md:p-8" aria-labelledby="subject-tabs-title">
          <h2 id="subject-tabs-title" className="font-mincho text-3xl font-bold">科目タブ</h2>
          <div className="mt-4 flex flex-wrap gap-3" role="tablist" aria-label="科目カテゴリ">
            {['国語', '数学', '英語', '歴史', '地理', '公民', '科学と人間生活', '理科', '情報'].map((name) => (
              <button key={name} type="button" role="tab" aria-selected={name === '英語'} className={`hard-button px-4 py-2 ${name === '英語' ? 'bg-blue text-white' : 'bg-paper'}`}>{name}</button>
            ))}
          </div>
          <p className="mt-4">現在、詳細定義は英語を中心に配置しています。他科目は同じ表形式で追加します。</p>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="definition-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">DEFINITIONS</p>
          <h2 id="definition-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">タグ定義表</h2>
          <div className="mt-6 overflow-x-auto" role="region" aria-label="タグ定義表">
            <table className="w-full min-w-[860px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">コード、タグ名、定義、付与ルール、具体例。</caption>
              <thead className="bg-ink text-cream"><tr><th scope="col" className="p-3 text-left">コード</th><th scope="col" className="p-3 text-left">タグ名</th><th scope="col" className="p-3 text-left">定義</th><th scope="col" className="p-3 text-left">付与ルール</th><th scope="col" className="p-3 text-left">具体例</th></tr></thead>
              <tbody>{tagRows.map((row) => <tr key={row[0]} className="border-b-2 border-ink even:bg-blue/5">{row.map((cell) => <td key={cell} className="p-3 align-top">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="panel p-6" aria-labelledby="format-tags-title">
            <h2 id="format-tags-title" className="font-mincho text-3xl font-bold">形式タグ一覧</h2>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {formatTags.map((tag) => <li key={tag} className="border-2 border-ink bg-cream p-3 font-bold">{tag}</li>)}
            </ul>
          </article>
          <article className="panel p-6" aria-labelledby="pending-title">
            <h2 id="pending-title" className="font-mincho text-3xl font-bold">判定保留タグ</h2>
            <p className="mt-4">PDFの文字抽出結果だけでは単元を確定しにくい場合に使用します。原因は表組み、画像化、OCR崩れ、問題文の欠落などです。</p>
            <p className="mt-3">判定保留は不合格リスクを示すものではなく、集計対象の品質を示す補助情報です。</p>
          </article>
        </section>

        <section className="panel mt-8 p-6" aria-labelledby="rulesets-title">
          <h2 id="rulesets-title" className="font-mincho text-3xl font-bold">英語 rule_set</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {englishTags.rule_sets.map((rule) => <li key={rule.code} className="border-2 border-ink bg-cream p-3"><strong>{rule.code}</strong><br />{rule.label}<br />全{rule.total_questions}問</li>)}
          </ul>
        </section>
      </main>
    </>
  )
}
