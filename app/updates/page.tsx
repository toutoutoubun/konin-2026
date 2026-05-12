import Header from '@/components/Header'

const updates = [
  ['2026-05-12', '物理基礎', '物理基礎PDFの端末内分析を追加。大問見出し「問1〜問Nに答えよ。」で分割し、頻出分野、年度別推移、大問構成、出題形式を表示。', '物理基礎分析ページ'],
  ['2026-05-02', 'タグ定義', '英語以外の全11科目（国語・数学・歴史・地理・公民・科学と人間生活・物理基礎・化学基礎・生物基礎・地学基礎・情報）の単元タグ・形式タグ定義を追加。', 'タグ定義ページ'],
  ['2026-05-02', 'タグ定義', '科目タブ切り替えで各科目の固有タグ定義を表示可能に。全科目共通タグ（形式・制度区分）セクションを分離。', 'タグ定義ページ'],
  ['2026-05-01', '全体', '高認パスのトップページ、科目別カード、出願Todoリスト、タグ定義、更新履歴を追加。', 'Phase 1 UI構成'],
  ['2026-05-01', '英語', '英語頻出分析を科目詳細ページの一部として統合。公式PDF選択、ランキング、形式分布、年度推移、フィルタを配置。', '英語詳細ページ'],
  ['2026-05-01', '英語', 'rule_set型変換を修正し、Next.js production buildを通過。', 'ビルド安定性'],
  ['2026-05-01', '情報', '準備中表示を追加。令和8年度第1回より追加予定、過去問未公開のため分析機能は非表示。', '科目カード・詳細ページ']
]

export default function UpdatesPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={[
        { label: 'ツール一覧', href: '/#tools' },
        { label: '英語分析', href: '/subjects/english/' },
        { label: 'タグ定義', href: '/tags/' },
        { label: '更新履歴', href: '/updates/' },
      ]} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>更新履歴</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        <section className="py-12 md:py-20" aria-labelledby="updates-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">CHANGE LOG</p>
          <h1 id="updates-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">更新履歴</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">日付、対象科目、変更内容、影響範囲を記録します。端末内で抽出する出題傾向データの集計条件に関わる変更はここに残します。</p>
        </section>

        <section className="panel p-6 md:p-8" aria-labelledby="updates-table-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">LOG TABLE</p>
          <h2 id="updates-table-title" className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">履歴テーブル</h2>
          <div className="mt-6 overflow-x-auto" role="region" aria-label="更新履歴テーブル">
            <table className="w-full min-w-[780px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">日付、対象科目、変更内容、影響範囲。</caption>
              <thead className="bg-ink text-cream"><tr><th scope="col" className="p-3 text-left">日付</th><th scope="col" className="p-3 text-left">対象科目</th><th scope="col" className="p-3 text-left">変更内容</th><th scope="col" className="p-3 text-left">影響範囲</th></tr></thead>
              <tbody>{updates.map((row) => <tr key={`${row[0]}-${row[1]}-${row[3]}`} className="border-b-2 border-ink even:bg-blue/5">{row.map((cell) => <td key={cell} className="p-3 align-top">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  )
}
