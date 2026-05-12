'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import englishTags from '@/data/englishTags.json'
import mathTags from '@/data/mathTags.json'
import historyTags from '@/data/historyTags.json'
import geographyTags from '@/data/geographyTags.json'
import japaneseTags from '@/data/japaneseTags.json'
import civicsTags from '@/data/civicsTags.json'
import scienceLifeTags from '@/data/scienceLifeTags.json'
import scienceTags from '@/data/scienceTags.json'
import physicsTags from '@/data/physicsTags.json'
import chemistryTags from '@/data/chemistryTags.json'
import biologyTags from '@/data/biologyTags.json'
import earthScienceTags from '@/data/earthScienceTags.json'
import informaticsTags from '@/data/informaticsTags.json'

/* ─── Types ─── */
type TagRow = [string, string, string, string, string]

type SubjectTab = {
  slug: string
  name: string
  accent: string
  status: 'active' | 'placeholder' | 'coming-soon'
  unitRows: TagRow[]
  formatTags: string[]
  ruleSets: { code: string; label: string; detail?: string }[]
  extraSections?: React.ReactNode
}

/* ─── Helper: build TagRows from rule_set units ─── */
function buildUnitRows(units: { block: string; topic_l1: string; topic_l2: string[]; keywords: string[] }[]): TagRow[] {
  return units.map((u) => [
    u.block,
    u.topic_l1,
    u.topic_l2.join('、'),
    `「${u.topic_l1}」分野のキーワードに該当する場合に付与`,
    u.keywords.slice(0, 6).join('、')
  ])
}

/* ─── Helper: build TagRows from topic_l1 list (history/geography style) ─── */
function buildTopicRows(ruleSet: { code: string; label: string; topic_l1?: string[]; subject_name?: string }): TagRow[] {
  if (!ruleSet.topic_l1) return []
  return ruleSet.topic_l1.map((topic, i) => [
    `${ruleSet.code}-${String(i + 1).padStart(2, '0')}`,
    topic,
    `${ruleSet.subject_name ?? ruleSet.label}における「${topic}」に関する出題`,
    `出題テーマが「${topic}」に該当する場合に付与`,
    '―'
  ])
}

/* ─── Subject Tab Data ─── */
const subjectTabs: SubjectTab[] = [
  {
    slug: 'japanese',
    name: '国語',
    accent: 'blue',
    status: 'placeholder',
    unitRows: buildUnitRows(japaneseTags.rule_sets[0].units),
    formatTags: japaneseTags.format_tags,
    ruleSets: japaneseTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_blocks}大問` })),
  },
  {
    slug: 'math',
    name: '数学',
    accent: 'orange',
    status: 'active',
    unitRows: mathTags.rule_sets[0].units.map((u) => [
      u.block,
      u.topic_l1,
      u.topic_l2.join('、'),
      `ページヒント: p.${u.page_hint}。「${u.topic_l1}」のキーワードに該当する場合に付与`,
      u.keywords.slice(0, 6).join('、')
    ]),
    formatTags: ['空欄補充', '計算', 'グラフ選択', '正誤判定', '図の読み取り'],
    ruleSets: mathTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_blocks}大問` })),
  },
  {
    slug: 'english',
    name: '英語',
    accent: 'yellow',
    status: 'active',
    unitRows: [
      ['EN-GRAMMAR-TENSE', '時制', '現在・過去・未来・完了形の用法を問う表現。', '助動詞、完了形、時を表す副詞句を含む問題に付与。', '現在完了、過去完了、未来表現'],
      ['EN-GRAMMAR-VOICE', '態', '能動態・受動態の使い分け。', 'be動詞＋過去分詞、by句、受動表現を含む問題に付与。', '受動態、能動態'],
      ['EN-GRAMMAR-CLAUSE', '節', '関係詞・接続詞・仮定法など、文構造を作る要素。', '関係代名詞、関係副詞、if節、接続詞を含む問題に付与。', '関係代名詞、仮定法'],
      ['EN-FORM-CONVERSATION', '会話', '対話文の空所補充や応答選択。', 'A/B形式、会話の流れを問う設問に付与。', 'A: / B: で構成される会話文'],
      ['EN-FORM-READING', '長文読解', '英文パッセージを読んで内容を答える形式。', 'まとまった英文と複数設問を含むブロックに付与。', '内容一致、要旨把握'],
      ['COMMON-PENDING', '判定保留', 'PDF抽出結果だけでは単元を確定しにくい項目。', 'OCR崩れ、問題文欠落、表組み崩れがある場合に補助的に付与。', '文字化けした大問、画像化された表']
    ],
    formatTags: ['強勢', '会話', '語句整序', 'メッセージ', '語彙', '資料読解', '資料・お知らせ', '長文読解', '文順'],
    ruleSets: englishTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_questions}問` })),
    extraSections: (
      <div className="mt-6">
        <h4 className="font-mincho text-xl font-bold">文法タグ</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {englishTags.grammar_tags.map((tag) => <span key={tag} className="border-2 border-ink bg-cream px-3 py-1 text-sm font-bold">{tag}</span>)}
        </div>
        <h4 className="mt-4 font-mincho text-xl font-bold">CEFRレベル</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {englishTags.cefr_levels.map((lv) => <span key={lv} className="border-2 border-ink bg-yellow/20 px-3 py-1 text-sm font-bold">{lv}</span>)}
        </div>
      </div>
    ),
  },
  {
    slug: 'history',
    name: '歴史',
    accent: 'blue',
    status: 'active',
    unitRows: [
      ...buildTopicRows(historyTags.rule_sets[0] as any),
      ...buildTopicRows(historyTags.rule_sets[1] as any),
    ],
    formatTags: historyTags.format_tags,
    ruleSets: historyTags.rule_sets.map((r) => ({ code: r.code, label: r.label })),
    extraSections: (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="font-mincho text-xl font-bold">時代タグ</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {historyTags.era_tags.map((tag) => <span key={tag} className="border-2 border-ink bg-cream px-3 py-1 text-sm font-bold">{tag}</span>)}
          </div>
        </div>
        <div>
          <h4 className="font-mincho text-xl font-bold">地域タグ</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {historyTags.region_tags.map((tag) => <span key={tag} className="border-2 border-ink bg-cream px-3 py-1 text-sm font-bold">{tag}</span>)}
          </div>
        </div>
      </div>
    ),
  },
  {
    slug: 'geography',
    name: '地理',
    accent: 'orange',
    status: 'active',
    unitRows: (() => {
      const rows: TagRow[] = []
      const newSet = geographyTags.rule_sets.find((r) => r.code === 'GEO_NEW')
      if (newSet && Array.isArray(newSet.structure)) {
        for (const block of newSet.structure) {
          rows.push([
            block.block,
            block.topic_l1,
            (block.topic_l2 ?? []).join('、'),
            `「${block.topic_l1}」に該当する出題に付与`,
            '―'
          ])
        }
      }
      return rows
    })(),
    formatTags: geographyTags.format_tags,
    ruleSets: geographyTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_questions}問・${r.blocks}大問` })),
    extraSections: (
      <div className="mt-6">
        <h4 className="font-mincho text-xl font-bold">地域タグ</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {geographyTags.region_tags.map((tag) => <span key={tag} className="border-2 border-ink bg-cream px-3 py-1 text-sm font-bold">{tag}</span>)}
        </div>
      </div>
    ),
  },
  {
    slug: 'civics',
    name: '公民',
    accent: 'yellow',
    status: 'placeholder',
    unitRows: civicsTags.rule_sets.flatMap((rs) => buildTopicRows(rs as any)),
    formatTags: civicsTags.format_tags,
    ruleSets: civicsTags.rule_sets.map((r) => ({ code: r.code, label: r.label })),
  },
  {
    slug: 'science-life',
    name: '科学と人間生活',
    accent: 'blue',
    status: 'active',
    unitRows: scienceTags.rule_sets[0].selection_structure.flatMap((group) =>
      group.blocks.map((b) => [
        b.block,
        `${group.group}：${b.topic_l2}`,
        b.keywords.slice(0, 8).join('、'),
        `大問番号から${group.group}を特定し、キーワード照合で確認`,
        `問題範囲：${b.question_range}`
      ] as TagRow)
    ),
    formatTags: (scienceTags as any).format_tags ?? scienceLifeTags.format_tags,
    ruleSets: [{ code: scienceTags.rule_sets[0].code, label: scienceTags.rule_sets[0].label, detail: `全${scienceTags.rule_sets[0].total_blocks}大問・4分野から2分野選択` }],
    extraSections: (
      <div className="mt-6">
        <h4 className="font-mincho text-xl font-bold">選択構造</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {scienceTags.rule_sets[0].selection_structure.map((group) => (
            <div key={group.group} className="border-2 border-ink bg-cream p-4">
              <strong>{group.group}</strong>
              <p className="mt-1 text-sm">{group.instruction}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {group.blocks.map((b) => (
                  <li key={b.block}>{b.block}：{b.topic_l2}(問{b.question_range})</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    slug: 'physics',
    name: '物理基礎',
    accent: 'orange',
    status: 'active',
    unitRows: buildUnitRows(physicsTags.rule_sets[0].units),
    formatTags: physicsTags.format_tags,
    ruleSets: physicsTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_blocks}大問` })),
  },
  {
    slug: 'chemistry',
    name: '化学基礎',
    accent: 'yellow',
    status: 'placeholder',
    unitRows: buildUnitRows(chemistryTags.rule_sets[0].units),
    formatTags: chemistryTags.format_tags,
    ruleSets: chemistryTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_blocks}大問` })),
  },
  {
    slug: 'biology',
    name: '生物基礎',
    accent: 'blue',
    status: 'placeholder',
    unitRows: buildUnitRows(biologyTags.rule_sets[0].units),
    formatTags: biologyTags.format_tags,
    ruleSets: biologyTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_blocks}大問` })),
  },
  {
    slug: 'earth-science',
    name: '地学基礎',
    accent: 'orange',
    status: 'placeholder',
    unitRows: buildUnitRows(earthScienceTags.rule_sets[0].units),
    formatTags: earthScienceTags.format_tags,
    ruleSets: earthScienceTags.rule_sets.map((r) => ({ code: r.code, label: r.label, detail: `全${r.total_blocks}大問` })),
  },
  {
    slug: 'informatics',
    name: '情報',
    accent: 'yellow',
    status: 'coming-soon',
    unitRows: informaticsTags.expected_units.map((u, i) => [
      `INFO-${String(i + 1).padStart(2, '0')}`,
      u.topic_l1,
      u.topic_l2.join('、'),
      `「${u.topic_l1}」分野のキーワードに該当する場合に付与`,
      u.keywords.slice(0, 6).join('、')
    ]),
    formatTags: informaticsTags.format_tags,
    ruleSets: informaticsTags.rule_sets.map((r) => ({ code: r.code, label: r.label })),
  },
]

/* ─── Accent color mapping ─── */
function accentClasses(accent: string, isActive: boolean) {
  if (!isActive) return 'bg-paper text-ink hover:bg-ink/5'
  switch (accent) {
    case 'blue': return 'bg-blue text-white'
    case 'orange': return 'bg-orange text-white'
    case 'yellow': return 'bg-yellow text-ink'
    default: return 'bg-blue text-white'
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'active': return <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">分析可</span>
    case 'coming-soon': return <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">準備中</span>
    default: return <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">定義済</span>
  }
}

/* ─── Page Component ─── */
export default function TagsPage() {
  const [activeSlug, setActiveSlug] = useState('japanese')
  const active = subjectTabs.find((t) => t.slug === activeSlug) ?? subjectTabs[0]

  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header navItems={[
        { label: 'ツール一覧', href: '/#tools' },
        { label: 'タグ定義', href: '/tags/' },
        { label: '更新履歴', href: '/updates/' },
      ]} />

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 px-4 text-sm text-ink/70 md:px-10" aria-label="パンくずリスト">
        <a href="/">トップ</a><span aria-hidden="true">/</span><span>タグ定義</span>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 md:px-10" tabIndex={-1}>
        {/* Hero */}
        <section className="py-12 md:py-20" aria-labelledby="tags-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">TAG DICTIONARY</p>
          <h1 id="tags-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">タグ定義</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">全12科目の単元タグ、形式タグ、制度区分を一覧化しています。科目タブを切り替えて各科目のタグ定義を確認できます。</p>
        </section>

        {/* Subject Tabs */}
        <section className="panel p-6 md:p-8" aria-labelledby="subject-tabs-title">
          <h2 id="subject-tabs-title" className="font-mincho text-3xl font-bold">科目タブ</h2>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="科目カテゴリ">
            {subjectTabs.map((tab) => (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={tab.slug === activeSlug}
                aria-controls={`panel-${tab.slug}`}
                className={`hard-button px-4 py-2 text-sm transition-colors ${accentClasses(tab.accent, tab.slug === activeSlug)}`}
                onClick={() => setActiveSlug(tab.slug)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink/60">
            全12科目のタグ定義を用意しています。科目名をクリックすると詳細を表示します。
          </p>
        </section>

        {/* Active Subject Panel */}
        <section
          id={`panel-${active.slug}`}
          role="tabpanel"
          aria-labelledby={`tab-${active.slug}`}
          className="panel mt-8 p-6 md:p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">UNIT TAGS</p>
            {statusBadge(active.status)}
          </div>
          <h2 className="mt-2 font-mincho text-2xl font-bold sm:text-4xl md:text-6xl">{active.name}の単元タグ</h2>

          {/* Rule Sets */}
          {active.ruleSets.length > 0 && (
            <div className="mt-6">
              <h3 className="font-mincho text-2xl font-bold">ルールセット</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.ruleSets.map((rs) => (
                  <li key={rs.code} className="border-2 border-ink bg-cream p-4">
                    <strong className="font-mono text-sm">{rs.code}</strong>
                    <p className="mt-1 font-bold">{rs.label}</p>
                    {rs.detail && <p className="mt-1 text-sm text-ink/70">{rs.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tag Definition Table */}
          {active.unitRows.length > 0 && (
            <div className="mt-8 overflow-x-auto" role="region" aria-label={`${active.name}の単元タグ定義表`}>
              <table className="w-full min-w-[860px] border-collapse bg-paper" role="table">
                <caption className="py-3 text-left font-bold">{active.name}の単元タグ定義。コード、タグ名、定義、付与ルール、具体例。</caption>
                <thead className="bg-ink text-cream">
                  <tr>
                    <th scope="col" className="p-3 text-left">コード</th>
                    <th scope="col" className="p-3 text-left">タグ名</th>
                    <th scope="col" className="p-3 text-left">定義</th>
                    <th scope="col" className="p-3 text-left">付与ルール</th>
                    <th scope="col" className="p-3 text-left">具体例</th>
                  </tr>
                </thead>
                <tbody>
                  {active.unitRows.map((row, i) => (
                    <tr key={`${row[0]}-${i}`} className="border-b-2 border-ink even:bg-blue/5">
                      {row.map((cell, j) => <td key={j} className="p-3 align-top">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Extra Subject-Specific Sections */}
          {active.extraSections}
        </section>

        {/* Format Tags */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="panel p-6" aria-labelledby="format-tags-title">
            <h2 id="format-tags-title" className="font-mincho text-3xl font-bold">{active.name}の形式タグ</h2>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {active.formatTags.map((tag) => <li key={tag} className="border-2 border-ink bg-cream p-3 font-bold">{tag}</li>)}
            </ul>
          </article>
          <article className="panel p-6" aria-labelledby="pending-title">
            <h2 id="pending-title" className="font-mincho text-3xl font-bold">判定保留タグ</h2>
            <p className="mt-4">PDFの文字抽出結果だけでは単元を確定しにくい場合に使用します。原因は表組み、画像化、OCR崩れ、問題文の欠落などです。</p>
            <p className="mt-3">判定保留は不合格リスクを示すものではなく、集計対象の品質を示す補助情報です。</p>
          </article>
        </section>

        {/* Common Tags */}
        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="common-tags-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">COMMON TAGS</p>
          <h2 id="common-tags-title" className="mt-2 font-mincho text-3xl font-bold">全科目共通タグ</h2>
          <p className="mt-3">以下のタグは全科目で共通して使用します。</p>
          <div className="mt-6 overflow-x-auto" role="region" aria-label="共通タグ定義表">
            <table className="w-full min-w-[700px] border-collapse bg-paper" role="table">
              <caption className="py-3 text-left font-bold">全科目共通のタグ定義。</caption>
              <thead className="bg-ink text-cream">
                <tr>
                  <th scope="col" className="p-3 text-left">コード</th>
                  <th scope="col" className="p-3 text-left">タグ名</th>
                  <th scope="col" className="p-3 text-left">定義</th>
                  <th scope="col" className="p-3 text-left">付与ルール</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['FORM-CHOICE', '選択式', '選択肢から解答を選ぶ形式', '選択肢が明示されている場合に付与'],
                  ['FORM-SOURCE', '資料読解', '資料を読み取って解答する形式', '資料が解答根拠になる場合に付与'],
                  ['FORM-CALC', '計算', '数式や数量処理を要する形式', '計算過程が得点判断に関わる場合に付与'],
                  ['FORM-WRITE', '記述補助', '短答や穴埋めなど記述を伴う形式', '選択式でなく記述が求められる場合に付与'],
                  ['FORM-CHART', '図表読み取り', '表・グラフ・地図を使う形式', '図表が解答根拠になる場合に付与'],
                  ['DIV-NEW', '新課程', '2024年度以降の新課程', '2024年度以降の試験に付与'],
                  ['DIV-OLD', '旧課程', '2023年度以前の旧課程', '2023年度以前の試験に付与'],
                  ['HOLD-REVIEW', '判定保留', '分類を確定できない状態', '年度・資料不足で確定できない場合に付与'],
                ].map((row) => (
                  <tr key={row[0]} className="border-b-2 border-ink even:bg-blue/5">
                    {row.map((cell, j) => <td key={j} className="p-3 align-top">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  )
}
