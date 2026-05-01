/**
 * mathTagMapper.ts
 * mathTags.json の MATH_STD ルールセットを使い、
 * 検出した大問ブロックに topic_l1 を、小問に topic_l2 をマッピングする。
 */

import mathTags from '@/data/mathTags.json'
import {
  type BigQuestionMatch,
  classifyPage,
  detectBigQuestions,
  detectChoices,
  detectSubQuestions,
  isFormulaOnly
} from './mathPatternMatcher'

// ── 型定義 ─────────────────────────────────────────

export type MathRuleSet = {
  code: string
  label: string
  total_questions: number
  blocks: MathBlock[]
  keyword_map: Record<string, string[]>
}

export type MathBlock = {
  block_id: number
  label: string
  topic_l1: string
  topic_l2: string[]
}

export type MathSubQuestion = {
  subNumber: number
  text: string
  topic_l2: string | null
  isFormulaOnly: boolean
  choices: string[]
}

export type MathQuestionBlock = {
  blockNumber: number
  heading: string
  text: string
  topic_l1: string
  subQuestions: MathSubQuestion[]
  totalSubQuestions: number
  formulaOnlyCount: number
}

export type MathAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: MathRuleSet
  rawText: string
  pageCount: number
  skippedPages: number
  questionBlocks: MathQuestionBlock[]
  formulaOnlyTotal: number
  analyzedAt: string
}

// ── ルールセット取得 ─────────────────────────────────────────

export function getMathRuleSet(): MathRuleSet {
  const raw = mathTags.rule_sets.find((rs) => rs.code === 'MATH_STD')!
  return {
    code: raw.code,
    label: raw.label,
    total_questions: raw.total_questions,
    blocks: raw.blocks,
    keyword_map: raw.keyword_map
  }
}

// ── 年度検出 ─────────────────────────────────────────

export function detectMathExamYear(text: string, fileName = ''): number | null {
  const target = `${fileName}\n${text}`

  const western = target.match(/20(1[4-9]|2[0-9])\s*(?:年度|年)?/)
  if (western) return Number(western[0].match(/20\d{2}/)?.[0])

  const reiwa = target.match(/令和\s*([元1-9]|[0-9]{1,2})\s*年度?/)
  if (reiwa) {
    const raw = reiwa[1]
    const yearNumber = raw === '元' ? 1 : Number(raw)
    return 2018 + yearNumber
  }

  const heisei = target.match(/平成\s*([0-9]{1,2})\s*年度?/)
  if (heisei) return 1988 + Number(heisei[1])

  return null
}

// ── 試験回検出 ─────────────────────────────────────────

export function detectMathExamSession(text: string, fileName = ''): string {
  const target = `${fileName}\n${text}`
  const year = detectMathExamYear(text, fileName)

  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目|No\.\s*([12]))/i)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2] ?? sessionMatch?.[3]

  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

// ── topic_l2 キーワードマッチ ─────────────────────────────────────────

/**
 * テキストからキーワードマッチで topic_l2 を推定する
 * 対象ブロックの topic_l2 候補のみにマッチさせる
 */
export function matchTopicL2(
  text: string,
  block: MathBlock,
  keywordMap: Record<string, string[]>
): string | null {
  let bestMatch: string | null = null
  let bestCount = 0

  for (const topic of block.topic_l2) {
    const keywords = keywordMap[topic] ?? []
    let count = 0
    for (const kw of keywords) {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedKw, 'gi')
      const matches = text.match(regex)
      if (matches) count += matches.length
    }
    if (count > bestCount) {
      bestCount = count
      bestMatch = topic
    }
  }

  return bestMatch
}

// ── メイン解析 ─────────────────────────────────────────

/**
 * ページテキスト配列を解析し、大問・小問・トピックをマッピングする
 */
export function analyzeMathPages(
  pages: string[],
  fileName: string
): MathAnalysisResult {
  const ruleSet = getMathRuleSet()
  const fullText = pages.join('\n')

  // ページ分類
  let skippedPages = 0
  const questionPages: string[] = []

  for (const page of pages) {
    const classification = classifyPage(page)
    if (classification === 'question' || classification === 'formulaOnly') {
      questionPages.push(page)
    } else {
      skippedPages++
    }
  }

  const questionText = questionPages.join('\n')
  const examYear = detectMathExamYear(fullText, fileName)
  const examSession = detectMathExamSession(fullText, fileName)

  // 大問検出
  const bigQuestions = detectBigQuestions(questionText)

  // ブロックテキスト分割
  const questionBlocks = buildQuestionBlocks(
    questionText,
    bigQuestions,
    ruleSet
  )

  const formulaOnlyTotal = questionBlocks.reduce(
    (sum, block) => sum + block.formulaOnlyCount,
    0
  )

  return {
    fileName,
    examYear,
    examSession,
    ruleSet,
    rawText: fullText,
    pageCount: pages.length,
    skippedPages,
    questionBlocks,
    formulaOnlyTotal,
    analyzedAt: new Date().toISOString()
  }
}

/**
 * 大問マッチ位置に基づいてテキストをブロック分割し、
 * 各ブロックに topic_l1 と小問の topic_l2 を割り当てる
 */
function buildQuestionBlocks(
  text: string,
  bigQuestions: BigQuestionMatch[],
  ruleSet: MathRuleSet
): MathQuestionBlock[] {
  // 大問が検出できなかった場合、全テキストをブロック1として扱う
  if (bigQuestions.length === 0) {
    return buildFallbackBlocks(text, ruleSet)
  }

  const blocks: MathQuestionBlock[] = []

  for (let i = 0; i < bigQuestions.length; i++) {
    const bq = bigQuestions[i]
    const start = bq.startIndex
    const end = bigQuestions[i + 1]?.startIndex ?? text.length
    const blockText = text.slice(start, end)

    // ルールセットから対応するブロック定義を取得
    const blockDef = ruleSet.blocks.find((b) => b.block_id === bq.blockNumber)
    const topicL1 = blockDef?.topic_l1 ?? '未分類'

    // 小問検出
    const subMatches = detectSubQuestions(blockText)
    const subQuestions = buildSubQuestions(blockText, subMatches, blockDef, ruleSet.keyword_map)

    const formulaOnlyCount = subQuestions.filter((sq) => sq.isFormulaOnly).length

    blocks.push({
      blockNumber: bq.blockNumber,
      heading: bq.raw,
      text: blockText,
      topic_l1: topicL1,
      subQuestions,
      totalSubQuestions: subQuestions.length,
      formulaOnlyCount
    })
  }

  return blocks
}

/**
 * 大問が検出できなかった場合のフォールバック
 */
function buildFallbackBlocks(text: string, ruleSet: MathRuleSet): MathQuestionBlock[] {
  return ruleSet.blocks.map((blockDef) => ({
    blockNumber: blockDef.block_id,
    heading: blockDef.label,
    text: '',
    topic_l1: blockDef.topic_l1,
    subQuestions: [],
    totalSubQuestions: 0,
    formulaOnlyCount: 0
  }))
}

/**
 * 小問テキストを分割し、各小問に topic_l2 を割り当てる
 */
function buildSubQuestions(
  blockText: string,
  subMatches: ReturnType<typeof detectSubQuestions>,
  blockDef: MathBlock | undefined,
  keywordMap: Record<string, string[]>
): MathSubQuestion[] {
  if (subMatches.length === 0) {
    // 小問番号が見つからない場合、ブロック全体から topic_l2 を推定
    if (!blockDef) return []

    const topic = matchTopicL2(blockText, blockDef, keywordMap)
    const formulaOnly = isFormulaOnly(blockText)
    const choices = detectChoices(blockText)

    return [{
      subNumber: 1,
      text: blockText.slice(0, 300),
      topic_l2: formulaOnly ? null : topic,
      isFormulaOnly: formulaOnly,
      choices: choices.choices
    }]
  }

  return subMatches.map((sub, index) => {
    const start = sub.startIndex
    const end = subMatches[index + 1]?.startIndex ?? blockText.length
    const subText = blockText.slice(start, end)

    const formulaOnly = isFormulaOnly(subText)
    const topic = blockDef && !formulaOnly
      ? matchTopicL2(subText, blockDef, keywordMap)
      : null
    const choices = detectChoices(subText)

    return {
      subNumber: sub.subNumber,
      text: subText.slice(0, 300),
      topic_l2: topic,
      isFormulaOnly: formulaOnly,
      choices: choices.choices
    }
  })
}
