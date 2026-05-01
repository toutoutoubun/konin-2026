/**
 * mathTagMapper.ts — v2.0
 *
 * mathTags.json の MATH_STD ルールセットを使い、
 * 検出した大問をページ位置（page_hint）と大問番号で照合し、
 * topic_l1 を割り当てる。キーワードマッチで topic_l2 を補助的に付与する。
 */

import mathTags from '@/data/mathTags.json'
import {
  type BigQuestionMatch,
  type PageClassification,
  classifyPage,
  detectBigQuestions,
  detectExamSession,
  detectExamYear
} from './mathPatternMatcher'

// ── 型定義 ─────────────────────────────────────

export type MathUnit = {
  block: string
  page_hint: number
  topic_l1: string
  topic_l2: string[]
  keywords: string[]
}

export type MathRuleSet = {
  code: string
  label: string
  total_blocks: number
  units: MathUnit[]
}

export type PageInfo = {
  pageIndex: number
  text: string
  classification: PageClassification
}

export type DetectedBlock = {
  blockNumber: number
  blockLabel: string
  topic_l1: string
  matchedL2: string[]
  startPage: number
  endPage: number
  method: 'pattern' | 'pageHint' | 'fallback'
}

export type MathAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: MathRuleSet
  pageCount: number
  blankPages: number
  coverPages: number
  answerPages: number
  cidHeavyPages: number
  questionPages: number
  detectedBlocks: DetectedBlock[]
  analyzedAt: string
}

// ── ルールセット取得 ─────────────────────────────────

export function getMathRuleSet(): MathRuleSet {
  const raw = mathTags.rule_sets[0]
  return {
    code: raw.code,
    label: raw.label,
    total_blocks: raw.total_blocks,
    units: raw.units as MathUnit[]
  }
}

// ── メイン解析 ─────────────────────────────────────

/**
 * ページテキスト配列を解析し、大問・単元をマッピングする。
 */
export function analyzeMathPages(
  pages: string[],
  fileName: string
): MathAnalysisResult {
  const ruleSet = getMathRuleSet()
  const fullText = pages.join('\n')

  // 1. ページ分類
  const pageInfos: PageInfo[] = pages.map((text, i) => ({
    pageIndex: i,
    text,
    classification: classifyPage(text)
  }))

  const blankPages = pageInfos.filter((p) => p.classification === 'blank').length
  const coverPages = pageInfos.filter((p) => p.classification === 'cover').length
  const answerPages = pageInfos.filter((p) => p.classification === 'answer').length
  const cidHeavyPages = pageInfos.filter((p) => p.classification === 'cidHeavy').length
  const questionPages = pageInfos.filter((p) => p.classification === 'question').length

  // 2. 年度・試験回検出
  const examYear = detectExamYear(fullText, fileName)
  const examSession = detectExamSession(fullText, fileName)

  // 3. 大問番号検出（分類情報を渡して不要ページをスキップ）
  const classifications = pageInfos.map((p) => p.classification)
  const bigQuestions = detectBigQuestions(pages, classifications)

  // 4. 大問ブロック構築
  const detectedBlocks = buildBlocks(bigQuestions, pageInfos, ruleSet)

  return {
    fileName,
    examYear,
    examSession,
    ruleSet,
    pageCount: pages.length,
    blankPages,
    coverPages,
    answerPages,
    cidHeavyPages,
    questionPages,
    detectedBlocks,
    analyzedAt: new Date().toISOString()
  }
}

// ── ブロック構築 ─────────────────────────────────────

function buildBlocks(
  bigQuestions: BigQuestionMatch[],
  pageInfos: PageInfo[],
  ruleSet: MathRuleSet
): DetectedBlock[] {
  const blocks: DetectedBlock[] = []
  const assigned = new Set<number>()

  // ステップ1: パターンマッチで検出された大問を優先的に割り当て
  for (const bq of bigQuestions) {
    const unit = ruleSet.units.find(
      (u) => u.block === `第${bq.blockNumber}問`
    )
    if (!unit) continue
    if (assigned.has(bq.blockNumber)) continue
    assigned.add(bq.blockNumber)

    const startPage = bq.pageIndex
    const nextBq = bigQuestions.find(
      (q) => q.blockNumber > bq.blockNumber
    )
    const endPage = nextBq
      ? nextBq.pageIndex - 1
      : pageInfos.length - 1

    // ブロック範囲内のテキストからキーワードマッチ
    const blockText = collectBlockText(pageInfos, startPage, endPage)
    const matchedL2 = matchKeywords(blockText, unit)

    blocks.push({
      blockNumber: bq.blockNumber,
      blockLabel: unit.block,
      topic_l1: unit.topic_l1,
      matchedL2,
      startPage,
      endPage,
      method: 'pattern'
    })
  }

  // ステップ2: page_hintで補完（パターンで未検出の大問を埋める）
  for (const unit of ruleSet.units) {
    const blockNum = parseInt(unit.block.replace(/[^0-9]/g, ''), 10)
    if (assigned.has(blockNum)) continue

    // page_hint は1-indexed なので 0-indexed に変換
    const hintPage = unit.page_hint - 1

    // page_hint付近（±2ページ）にquestionまたはcidHeavyページがあるか確認
    const nearby = pageInfos.find(
      (p) =>
        Math.abs(p.pageIndex - hintPage) <= 2 &&
        (p.classification === 'question' || p.classification === 'cidHeavy')
    )

    if (nearby) {
      assigned.add(blockNum)

      // 次のユニットの page_hint から終了ページを推定
      const nextUnit = ruleSet.units.find(
        (u) => parseInt(u.block.replace(/[^0-9]/g, ''), 10) > blockNum
      )
      const endHint = nextUnit
        ? nextUnit.page_hint - 2 // 次の大問の1ページ前まで
        : pageInfos.length - 1

      const startPage = nearby.pageIndex
      const endPage = Math.max(startPage, endHint)

      const blockText = collectBlockText(pageInfos, startPage, endPage)
      const matchedL2 = matchKeywords(blockText, unit)

      blocks.push({
        blockNumber: blockNum,
        blockLabel: unit.block,
        topic_l1: unit.topic_l1,
        matchedL2,
        startPage,
        endPage,
        method: 'pageHint'
      })
    } else {
      // フォールバック: ページが見つからなくても大問は存在するとみなす
      assigned.add(blockNum)
      blocks.push({
        blockNumber: blockNum,
        blockLabel: unit.block,
        topic_l1: unit.topic_l1,
        matchedL2: [],
        startPage: -1,
        endPage: -1,
        method: 'fallback'
      })
    }
  }

  return blocks.sort((a, b) => a.blockNumber - b.blockNumber)
}

// ── テキスト収集 ─────────────────────────────────

/**
 * 指定ページ範囲の question ページテキストを結合する。
 * cidHeavy ページも部分的にテキストを含む場合があるので含める。
 */
function collectBlockText(
  pageInfos: PageInfo[],
  startPage: number,
  endPage: number
): string {
  return pageInfos
    .filter(
      (p) =>
        p.pageIndex >= startPage &&
        p.pageIndex <= endPage &&
        (p.classification === 'question' || p.classification === 'cidHeavy')
    )
    .map((p) => p.text)
    .join(' ')
}

// ── キーワードマッチ ─────────────────────────────────

/**
 * ブロック内テキストからキーワードマッチで topic_l2 を推定する。
 * 1) topic_l2 名自体がテキストに含まれるか
 * 2) keywords リストの語がテキストに含まれるか → 対応する topic_l2 を付与
 */
function matchKeywords(text: string, unit: MathUnit): string[] {
  const matched = new Set<string>()

  // 直接マッチ: topic_l2 名がテキストに含まれるか
  for (const topic of unit.topic_l2) {
    if (text.includes(topic)) {
      matched.add(topic)
    }
  }

  // キーワード補助マッチ
  for (const kw of unit.keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(escaped, 'i').test(text)) {
      // このキーワードに最も関連する topic_l2 を探す
      for (const topic of unit.topic_l2) {
        if (matched.has(topic)) continue
        // キーワードが topic 名の一部か、topic 名がキーワードの一部か
        if (topic.includes(kw) || kw.includes(topic)) {
          matched.add(topic)
        }
      }
      // 直接関連が見つからない場合、まだマッチしていない最初の topic_l2 を付与
      if (matched.size === 0 && unit.topic_l2.length > 0) {
        matched.add(unit.topic_l2[0])
      }
    }
  }

  return Array.from(matched)
}
