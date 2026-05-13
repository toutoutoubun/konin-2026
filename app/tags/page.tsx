'use client'

import { useState, type ReactNode } from 'react'
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

type TagRow = {
  code: string
  tag: string
  definition: string
  rule: string
  examples: string
}

type SubjectTab = {
  slug: string
  name: string
  accent: string
  status: 'active' | 'placeholder' | 'coming-soon'
  summary: string
  unitRows: TagRow[]
  subtopicRows?: TagRow[]
  formatTags: string[]
  formatNote?: string
  ruleSets: { code: string; label: string; detail?: string }[]
  extraSections?: ReactNode
}

type UnitLike = {
  block: string
  page_hint?: number
  question_range?: string
  topic_l1: string
  topic_l2?: string[]
  keywords?: string[]
}

type RuleSetLike = {
  code: string
  label: string
  period?: string
  subject_name?: string
  subjects?: string[]
  topic_l1?: string[]
  topic_l1_A?: string[]
  topic_l1_B?: string[]
  structure?: unknown
  total_blocks?: number
  total_questions?: number
  blocks?: number
  note?: string
}

type KeywordConfig = {
  keywords?: string[]
  parent?: string
  era?: string
  region?: string
  regions?: string[]
}

function pad(index: number): string {
  return String(index).padStart(2, '0')
}

function listText(values: string[] | undefined, limit = 10, fallback = 'なし'): string {
  if (!values?.length) return fallback
  const clipped = values.slice(0, limit)
  const suffix = values.length > limit ? ' ほか' : ''
  return `${clipped.join('、')}${suffix}`
}

function keywordText(values: string[] | undefined, limit = 8): string {
  return listText(values, limit, 'キーワード未設定')
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function topicListForRuleSet(ruleSet: RuleSetLike): string[] {
  if (Array.isArray(ruleSet.topic_l1)) return ruleSet.topic_l1
  return unique([...(ruleSet.topic_l1_A ?? []), ...(ruleSet.topic_l1_B ?? [])])
}

function ruleDetail(rule: RuleSetLike): string | undefined {
  const details = [
    rule.period,
    rule.subject_name,
    rule.subjects?.join('・'),
    rule.total_questions ? `全${rule.total_questions}問` : undefined,
    rule.total_blocks ? `全${rule.total_blocks}大問` : undefined,
    rule.blocks ? `${rule.blocks}大問` : undefined,
  ].filter(Boolean)
  return details.length ? details.join(' / ') : undefined
}

function buildRuleSets(ruleSets: RuleSetLike[]): SubjectTab['ruleSets'] {
  return ruleSets.map((rule) => ({
    code: rule.code,
    label: rule.label,
    detail: ruleDetail(rule),
  }))
}

function buildFixedUnitRows(ruleCode: string, units: UnitLike[], mode: 'fixed' | 'keyword' = 'fixed'): TagRow[] {
  return units.map((unit, index) => {
    const blockLabel = unit.block && unit.block !== '分野' ? `${unit.block}：` : ''
    const rangeLabel = unit.question_range ? `解答番号 ${unit.question_range}。` : ''
    const pageLabel = unit.page_hint ? `ページ目安 p.${unit.page_hint}。` : ''
    const ruleLead = mode === 'fixed'
      ? `${blockLabel}${rangeLabel}${pageLabel}大問構造を優先し、本文キーワードで小テーマを補強。`
      : '大問本文をキーワード照合し、最も強く一致した分野を付与。'

    return {
      code: `${ruleCode}-${pad(index + 1)}`,
      tag: unit.topic_l1,
      definition: `topic_l1。小テーマは ${listText(unit.topic_l2)}。`,
      rule: ruleLead,
      examples: keywordText(unit.keywords),
    }
  })
}

function buildSubtopicRowsFromUnits(ruleCode: string, units: UnitLike[]): TagRow[] {
  let index = 0
  return units.flatMap((unit) =>
    (unit.topic_l2 ?? []).map((topic) => {
      index += 1
      return {
        code: `${ruleCode}-L2-${pad(index)}`,
        tag: topic,
        definition: `親タグ：${unit.topic_l1}`,
        rule: `親分野「${unit.topic_l1}」の本文内で、該当語や近い表現が出た場合に補助的に付与。`,
        examples: keywordText([topic, ...(unit.keywords ?? [])], 7),
      }
    })
  )
}

function buildTopicRowsFromRuleSets(
  ruleSets: RuleSetLike[],
  keywordMap: Record<string, KeywordConfig> = {}
): TagRow[] {
  return ruleSets.flatMap((ruleSet) =>
    topicListForRuleSet(ruleSet).map((topic, index) => {
      const config = keywordMap[topic]
      const meta = [
        ruleSet.subject_name ?? ruleSet.subjects?.join('・') ?? ruleSet.label,
        config?.era ? `時代：${config.era}` : undefined,
        config?.regions?.length ? `地域：${config.regions.join('・')}` : undefined,
      ].filter(Boolean).join(' / ')

      return {
        code: `${ruleSet.code}-${pad(index + 1)}`,
        tag: topic,
        definition: `topic_l1。${meta}`,
        rule: 'PDF本文から抽出した語と全文を keyword_map.topic_l1 の語群に照合して付与。',
        examples: keywordText(config?.keywords),
      }
    })
  )
}

function buildSubtopicRowsFromKeywordMap(
  ruleCode: string,
  keywordMap: Record<string, KeywordConfig> = {}
): TagRow[] {
  return Object.entries(keywordMap).map(([topic, config], index) => {
    const meta = [
      config.parent ? `親タグ：${config.parent}` : undefined,
      config.era ? `時代：${config.era}` : undefined,
      config.region ? `地域：${config.region}` : undefined,
      config.regions?.length ? `地域：${config.regions.join('・')}` : undefined,
    ].filter(Boolean).join(' / ')

    return {
      code: `${ruleCode}-L2-${pad(index + 1)}`,
      tag: topic,
      definition: meta || 'topic_l2',
      rule: 'PDF本文から抽出した語と全文を keyword_map.topic_l2 の語群に照合して付与。',
      examples: keywordText(config.keywords),
    }
  })
}

function buildGeographyUnitRows(): TagRow[] {
  const rows: TagRow[] = []
  for (const ruleSet of geographyTags.rule_sets as RuleSetLike[]) {
    const structure = ruleSet.structure
    const keywordMap = geographyTags.keyword_map.topic_l1 as Record<string, KeywordConfig>

    if (Array.isArray(structure)) {
      structure.forEach((block: UnitLike, index) => {
        const config = keywordMap[block.topic_l1]
        rows.push({
          code: `${ruleSet.code}-${pad(index + 1)}`,
          tag: block.topic_l1,
          definition: `${block.block} / 解答番号 ${block.question_range ?? '未設定'}。小テーマは ${listText(block.topic_l2)}。`,
          rule: '新課程の大問構成を参照し、本文キーワードで topic_l1 / topic_l2 を補強。',
          examples: keywordText(config?.keywords),
        })
      })
      continue
    }

    if (structure && typeof structure === 'object') {
      for (const [subject, blocks] of Object.entries(structure as Record<string, Array<{ block: string; topic_l1: string }>>)) {
        blocks.forEach((block, index) => {
          const config = keywordMap[block.topic_l1]
          rows.push({
            code: `${ruleSet.code}-${subject}-${pad(index + 1)}`,
            tag: `${subject}：${block.topic_l1}`,
            definition: `${subject}の${block.block}に対応する topic_l1。`,
            rule: '旧課程は地理A・地理Bを判定し、科目別の大問構成とキーワード照合で付与。',
            examples: keywordText(config?.keywords),
          })
        })
      }
    }
  }
  return rows
}

function buildScienceRows(): TagRow[] {
  return scienceTags.rule_sets[0].selection_structure.flatMap((group) =>
    group.blocks.map((block) => ({
      code: `${scienceTags.rule_sets[0].code}-${block.block}`,
      tag: `${group.group}：${block.topic_l2}`,
      definition: `${block.block} / 解答番号 ${block.question_range}。${group.instruction}。`,
      rule: '大問番号で分野・単元を対応付け、本文キーワード数で信頼度を補強。',
      examples: keywordText(block.keywords),
    }))
  )
}

const englishGrammarExamples: Record<string, string> = {
  現在: '現在形、be動詞、一般動詞',
  過去: '過去形、was / were、過去時制',
  未来: 'will、be going to',
  現在完了: 'have / has + 過去分詞',
  過去完了: 'had + 過去分詞',
  能動: '主語が動作を行う文',
  受動: 'be + 過去分詞、by句',
  仮定法: 'if、would、could、were',
  関係代名詞: 'who、which、that、whom、whose',
  関係副詞: 'where、when、why',
  不定詞: 'to + 動詞の原形',
  動名詞: '動詞 + ing',
  分詞: '現在分詞、過去分詞',
  原級: 'as ... as',
  比較級: '-er than、more ... than',
  最上級: 'the -est、the most ...',
  接続詞: 'and、but、because、although、if',
  前置詞: 'in、on、at、by、for、with',
}

function buildEnglishGrammarRows(): TagRow[] {
  return englishTags.grammar_tags.map((tag, index) => ({
    code: `EN-GRAMMAR-${pad(index + 1)}`,
    tag,
    definition: '英語分析の単元ランキングで使う文法タグ。',
    rule: '英文テキストを正規表現で走査し、該当する文法表現が見つかった場合に付与。',
    examples: englishGrammarExamples[tag] ?? tag,
  }))
}

const englishFormatTags = unique(englishTags.rule_sets.flatMap((rule) => rule.formats))

const subjectTabs: SubjectTab[] = [
  {
    slug: 'japanese',
    name: '国語',
    accent: 'blue',
    status: 'active',
    summary: '国語は大問境界を検出し、本文キーワードから言語知識、実用的文章、現代文、古典、漢文を判定します。',
    unitRows: buildFixedUnitRows(japaneseTags.rule_sets[0].code, japaneseTags.rule_sets[0].units, 'keyword'),
    subtopicRows: buildSubtopicRowsFromUnits(japaneseTags.rule_sets[0].code, japaneseTags.rule_sets[0].units),
    formatTags: japaneseTags.format_tags,
    ruleSets: buildRuleSets(japaneseTags.rule_sets),
    extraSections: (
      <div className="mt-6">
        <h4 className="font-mincho text-xl font-bold">言語知識タグ</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {japaneseTags.knowledge_tags.map((tag) => <span key={tag} className="border-2 border-ink bg-cream px-3 py-1 text-sm font-bold">{tag}</span>)}
        </div>
      </div>
    ),
  },
  {
    slug: 'math',
    name: '数学',
    accent: 'orange',
    status: 'active',
    summary: '数学は第1問から第6問までの固定構成を基準にし、ページ位置と本文キーワードで小テーマを補助判定します。',
    unitRows: buildFixedUnitRows(mathTags.rule_sets[0].code, mathTags.rule_sets[0].units, 'fixed'),
    subtopicRows: buildSubtopicRowsFromUnits(mathTags.rule_sets[0].code, mathTags.rule_sets[0].units),
    formatTags: [],
    formatNote: '数学の現行分析では形式タグを個別集計せず、topic_l1、topic_l2、大問構成、年度推移を中心に集計します。',
    ruleSets: buildRuleSets(mathTags.rule_sets),
  },
  {
    slug: 'english',
    name: '英語',
    accent: 'yellow',
    status: 'active',
    summary: '英語は問題形式、文法タグ、CEFR語彙レベル、固有名詞分離を組み合わせて分析します。',
    unitRows: buildEnglishGrammarRows(),
    subtopicRows: englishFormatTags.map((format, index) => ({
      code: `EN-FORM-${pad(index + 1)}`,
      tag: format,
      definition: '英語PDFの問題ブロックに付与する形式タグ。',
      rule: '年度別ルールセットの formats / distribution と、本文中の形式表現から推定。',
      examples: englishTags.rule_sets
        .filter((rule) => rule.formats.includes(format))
        .map((rule) => {
          const distribution = rule.distribution as Record<string, number | undefined> | undefined
          return `${rule.code}: ${distribution?.[format] ?? 0}問`
        })
        .join('、'),
    })),
    formatTags: englishFormatTags,
    ruleSets: buildRuleSets(englishTags.rule_sets),
    extraSections: (
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="font-mincho text-xl font-bold">CEFRレベル</h4>
          <p className="mt-2 text-sm leading-relaxed">語彙リスト照合で A1 から B2 に分類します。固有名詞は語彙レベル集計から分離します。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {englishTags.cefr_levels.map((lv) => <span key={lv} className="border-2 border-ink bg-yellow/20 px-3 py-1 text-sm font-bold">{lv}</span>)}
          </div>
        </div>
        <div>
          <h4 className="font-mincho text-xl font-bold">年度別形式配分</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {englishTags.rule_sets.map((rule) => (
              <li key={rule.code} className="border-2 border-ink bg-cream p-3">
                <strong>{rule.code}</strong>：{Object.entries(rule.distribution ?? {}).map(([format, count]) => `${format}${count}問`).join('、')}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    slug: 'history',
    name: '歴史',
    accent: 'blue',
    status: 'active',
    summary: '歴史は新課程・旧課程を年度で切り替え、topic_l1、topic_l2、時代、地域、形式をキーワード照合で付与します。',
    unitRows: buildTopicRowsFromRuleSets(historyTags.rule_sets as RuleSetLike[], historyTags.keyword_map.topic_l1 as Record<string, KeywordConfig>),
    subtopicRows: buildSubtopicRowsFromKeywordMap('HIST', historyTags.keyword_map.topic_l2 as Record<string, KeywordConfig>),
    formatTags: historyTags.format_tags,
    ruleSets: buildRuleSets(historyTags.rule_sets),
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
    summary: '地理は旧課程の地理A・地理Bと新課程の地理を切り替え、地図・地域・防災・調査系のタグを付与します。',
    unitRows: buildGeographyUnitRows(),
    subtopicRows: buildSubtopicRowsFromKeywordMap('GEO', geographyTags.keyword_map.topic_l2 as Record<string, KeywordConfig>),
    formatTags: geographyTags.format_tags,
    ruleSets: buildRuleSets(geographyTags.rule_sets),
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
    summary: '公民は現代社会、倫理、政治経済、公共のルールセットを分けて定義しています。分析画面は未実装です。',
    unitRows: buildTopicRowsFromRuleSets(civicsTags.rule_sets as RuleSetLike[], civicsTags.keyword_map as Record<string, KeywordConfig>),
    formatTags: civicsTags.format_tags,
    ruleSets: buildRuleSets(civicsTags.rule_sets),
  },
  {
    slug: 'science-life',
    name: '科学と人間生活',
    accent: 'blue',
    status: 'active',
    summary: '科学と人間生活は4分野から2分野を選ぶ構造を反映し、第1問から第8問の単元を固定対応で扱います。',
    unitRows: buildScienceRows(),
    formatTags: (scienceTags as { format_tags?: string[] }).format_tags ?? scienceLifeTags.format_tags,
    ruleSets: buildRuleSets(scienceTags.rule_sets),
    extraSections: (
      <div className="mt-6">
        <h4 className="font-mincho text-xl font-bold">選択構造</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {scienceTags.rule_sets[0].selection_structure.map((group) => (
            <div key={group.group} className="border-2 border-ink bg-cream p-4">
              <strong>{group.group}</strong>
              <p className="mt-1 text-sm">{group.instruction}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {group.blocks.map((block) => (
                  <li key={block.block}>{block.block}：{block.topic_l2}（問{block.question_range}）</li>
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
    summary: '物理基礎は大問ごとに本文を分割し、分野キーワードの一致数から主分野・小テーマ・形式を判定します。',
    unitRows: buildFixedUnitRows(physicsTags.rule_sets[0].code, physicsTags.rule_sets[0].units, 'keyword'),
    subtopicRows: buildSubtopicRowsFromUnits(physicsTags.rule_sets[0].code, physicsTags.rule_sets[0].units),
    formatTags: physicsTags.format_tags,
    ruleSets: buildRuleSets(physicsTags.rule_sets),
  },
  {
    slug: 'chemistry',
    name: '化学基礎',
    accent: 'yellow',
    status: 'active',
    summary: '化学基礎は公式PDFの大問見出しと本文キーワードから、物質の構成、化学結合、物質量、酸・塩基、酸化還元を判定します。',
    unitRows: buildFixedUnitRows(chemistryTags.rule_sets[0].code, chemistryTags.rule_sets[0].units, 'keyword'),
    subtopicRows: buildSubtopicRowsFromUnits(chemistryTags.rule_sets[0].code, chemistryTags.rule_sets[0].units),
    formatTags: chemistryTags.format_tags,
    ruleSets: buildRuleSets(chemistryTags.rule_sets),
  },
  {
    slug: 'biology',
    name: '生物基礎',
    accent: 'blue',
    status: 'placeholder',
    summary: '生物基礎は標準5大問の単元定義を用意しています。分析画面は未実装です。',
    unitRows: buildFixedUnitRows(biologyTags.rule_sets[0].code, biologyTags.rule_sets[0].units, 'fixed'),
    subtopicRows: buildSubtopicRowsFromUnits(biologyTags.rule_sets[0].code, biologyTags.rule_sets[0].units),
    formatTags: biologyTags.format_tags,
    ruleSets: buildRuleSets(biologyTags.rule_sets),
  },
  {
    slug: 'earth-science',
    name: '地学基礎',
    accent: 'orange',
    status: 'placeholder',
    summary: '地学基礎は標準5大問の単元定義を用意しています。分析画面は未実装です。',
    unitRows: buildFixedUnitRows(earthScienceTags.rule_sets[0].code, earthScienceTags.rule_sets[0].units, 'fixed'),
    subtopicRows: buildSubtopicRowsFromUnits(earthScienceTags.rule_sets[0].code, earthScienceTags.rule_sets[0].units),
    formatTags: earthScienceTags.format_tags,
    ruleSets: buildRuleSets(earthScienceTags.rule_sets),
  },
  {
    slug: 'informatics',
    name: '情報',
    accent: 'yellow',
    status: 'coming-soon',
    summary: '情報は新課程の出題に備えた想定単元です。実際の過去問解析に合わせて今後更新します。',
    unitRows: informaticsTags.expected_units.map((unit, index) => ({
      code: `INFO-${pad(index + 1)}`,
      tag: unit.topic_l1,
      definition: `想定 topic_l1。小テーマは ${listText(unit.topic_l2)}。`,
      rule: '令和8年度第1回以降の過去問公開後、本文キーワードと大問構成に合わせて調整予定。',
      examples: keywordText(unit.keywords),
    })),
    subtopicRows: buildSubtopicRowsFromUnits('INFO', informaticsTags.expected_units.map((unit, index) => ({
      block: `想定${index + 1}`,
      topic_l1: unit.topic_l1,
      topic_l2: unit.topic_l2,
      keywords: unit.keywords,
    }))),
    formatTags: informaticsTags.format_tags,
    ruleSets: buildRuleSets(informaticsTags.rule_sets),
  },
]

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

function TagDefinitionTable({ rows, caption }: { rows: TagRow[]; caption: string }) {
  return (
    <div className="mt-8 overflow-x-auto" role="region" aria-label={caption}>
      <table className="w-full min-w-[960px] border-collapse bg-paper" role="table">
        <caption className="py-3 text-left font-bold">{caption}</caption>
        <thead className="bg-ink text-cream">
          <tr>
            <th scope="col" className="p-3 text-left">コード</th>
            <th scope="col" className="p-3 text-left">タグ名</th>
            <th scope="col" className="p-3 text-left">定義</th>
            <th scope="col" className="p-3 text-left">付与ルール</th>
            <th scope="col" className="p-3 text-left">キーワード例</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-b-2 border-ink even:bg-blue/5">
              <td className="p-3 align-top font-mono text-sm">{row.code}</td>
              <td className="p-3 align-top font-bold">{row.tag}</td>
              <td className="p-3 align-top">{row.definition}</td>
              <td className="p-3 align-top">{row.rule}</td>
              <td className="p-3 align-top">{row.examples}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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
        <section className="py-12 md:py-20" aria-labelledby="tags-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.22em]">TAG DICTIONARY</p>
          <h1 id="tags-title" className="mt-4 max-w-6xl font-mincho text-4xl font-bold leading-none tracking-[-.04em] sm:text-5xl md:text-7xl lg:text-9xl">タグ定義</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-xl">
            各分析ツールで実際に使っている単元タグ、形式タグ、判定ルールを一覧化しています。科目ごとに、親単元と小単元、キーワード例を確認できます。
          </p>
        </section>

        <section className="panel p-6 md:p-8" aria-labelledby="subject-tabs-title">
          <h2 id="subject-tabs-title" className="font-mincho text-3xl font-bold">科目タブ</h2>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="科目カテゴリ">
            {subjectTabs.map((tab) => (
              <button
                key={tab.slug}
                id={`tab-${tab.slug}`}
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
            分析可の科目は実装済みツールの解析ロジック、定義済の科目は現在のタグJSON、準備中の科目は想定定義に合わせています。
          </p>
        </section>

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
          <p className="mt-4 max-w-4xl leading-relaxed">{active.summary}</p>

          {active.ruleSets.length > 0 && (
            <div className="mt-6">
              <h3 className="font-mincho text-2xl font-bold">ルールセット</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.ruleSets.map((rule) => (
                  <li key={rule.code} className="border-2 border-ink bg-cream p-4">
                    <strong className="font-mono text-sm">{rule.code}</strong>
                    <p className="mt-1 font-bold">{rule.label}</p>
                    {rule.detail && <p className="mt-1 text-sm text-ink/70">{rule.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {active.unitRows.length > 0 && (
            <TagDefinitionTable rows={active.unitRows} caption={`${active.name}の親単元タグ定義。コード、タグ名、定義、付与ルール、キーワード例。`} />
          )}

          {!!active.subtopicRows?.length && (
            <TagDefinitionTable rows={active.subtopicRows} caption={`${active.name}の小単元タグ定義。親タグ、付与ルール、キーワード例。`} />
          )}

          {active.extraSections}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="panel p-6" aria-labelledby="format-tags-title">
            <h2 id="format-tags-title" className="font-mincho text-3xl font-bold">{active.name}の形式タグ</h2>
            {active.formatTags.length > 0 ? (
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {active.formatTags.map((tag) => <li key={tag} className="border-2 border-ink bg-cream p-3 font-bold">{tag}</li>)}
              </ul>
            ) : (
              <p className="mt-4 leading-relaxed">{active.formatNote ?? 'この科目では、現行のタグ定義に形式タグはありません。'}</p>
            )}
          </article>
          <article className="panel p-6" aria-labelledby="pending-title">
            <h2 id="pending-title" className="font-mincho text-3xl font-bold">判定保留の扱い</h2>
            <p className="mt-4">PDFの文字抽出結果だけでは単元を確定しにくい場合に使用します。原因は表組み、画像化、OCR崩れ、問題文の欠落などです。</p>
            <p className="mt-3">判定保留は不合格リスクを示すものではなく、集計対象の品質を示す補助情報です。</p>
          </article>
        </section>

        <section className="panel mt-8 p-6 md:p-8" aria-labelledby="common-tags-title">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SHARED RULES</p>
          <h2 id="common-tags-title" className="mt-2 font-mincho text-3xl font-bold">共通の判定ルール</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="font-bold">年度区分</h3>
              <p className="mt-2 text-sm leading-relaxed">令和・平成・西暦表記から年度を検出し、2024年度以降は新課程、2023年度以前は旧課程としてルールセットを切り替えます。</p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="font-bold">本文キーワード</h3>
              <p className="mt-2 text-sm leading-relaxed">PDFから抽出した本文を、科目別JSONの keywords または keyword_map と照合して topic_l1 / topic_l2 を付与します。</p>
            </div>
            <div className="border-2 border-ink bg-cream p-4">
              <h3 className="font-bold">形式タグ</h3>
              <p className="mt-2 text-sm leading-relaxed">形式タグを持つ科目では、空欄補充、資料読解、実験考察などを科目別の形式語で検出します。数学のように未使用の科目もあります。</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
