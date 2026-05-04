/**
 * 科学と人間生活 過去問のタグマッピング
 * 正規表現パターンマッチングとscienceTags.jsonとの照合で
 * 大問→分野・単元を特定する（kuromoji.js不使用）
 */

import scienceTags from '@/data/scienceTags.json'

/* ── 型定義 ── */

export type SciRuleSet = {
  code: string
  label: string
  period: string
}

export type SciGroupName = '物理系' | '化学系' | '生物系' | '地学系'

export type SciBlockHit = {
  block: string
  blockIndex: number
  group: SciGroupName
  topic_l2: string
  matchedKeywords: string[]
  keywordCount: number
  confidence: 'high' | 'low'
}

export type SciAnalysisResult = {
  fileName: string
  examYear: number | null
  examSession: string
  ruleSet: SciRuleSet
  rawText: string
  pageTexts: string[]
  blockHits: SciBlockHit[]
  detectedBlocks: string[]
  analyzedAt: string
}

/* ── rule_set ── */

const ruleSetData = scienceTags.rule_sets[0]

export const sciRuleSet: SciRuleSet = {
  code: ruleSetData.code,
  label: ruleSetData.label,
  period: ruleSetData.period
}

/* ── 選択構造の参照 ── */

export const selectionStructure = ruleSetData.selection_structure

export const allBlocks = selectionStructure.flatMap((group) =>
  group.blocks.map((b) => ({
    ...b,
    group: group.group as SciGroupName,
    groupEn: group.group_en
  }))
)

/* ── 年度検出 ── */

export function detectSciExamYear(text: string, fileName = ''): number | null {
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

/* ── 試験回検出 ── */

export function detectSciExamSession(text: string, fileName = ''): string {
  const target = `${fileName}\n${text}`
  const year = detectSciExamYear(text, fileName)
  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]
  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

/* ── 大問番号の検出 ── */

export function detectSciBlocks(text: string): string[] {
  const blocks: string[] = []
  const pattern = /第?\s*([1-8１-８])\s*問/g
  let match
  while ((match = pattern.exec(text)) !== null) {
    const num = match[1].replace(/[１-８]/g, (c) =>
      String(c.charCodeAt(0) - 0xff10)
    )
    const label = `第${num}問`
    if (!blocks.includes(label)) blocks.push(label)
  }
  return blocks.sort()
}

/* ── 大問テキストの分割 ── */

export function splitTextByBlocks(text: string): Map<number, string> {
  const blockTexts = new Map<number, string>()

  // 「第N問」の位置を検出
  const blockPositions: { blockNum: number; position: number }[] = []
  const pattern = /第?\s*([1-8１-８])\s*問/g
  let match
  while ((match = pattern.exec(text)) !== null) {
    const num = Number(
      match[1].replace(/[１-８]/g, (c) =>
        String(c.charCodeAt(0) - 0xff10)
      )
    )
    // 同じ大問番号が既にあればスキップ（最初の出現を使う）
    if (!blockPositions.some((p) => p.blockNum === num)) {
      blockPositions.push({ blockNum: num, position: match.index })
    }
  }

  blockPositions.sort((a, b) => a.position - b.position)

  for (let i = 0; i < blockPositions.length; i++) {
    const start = blockPositions[i].position
    const end =
      i + 1 < blockPositions.length
        ? blockPositions[i + 1].position
        : text.length
    blockTexts.set(blockPositions[i].blockNum, text.slice(start, end))
  }

  return blockTexts
}

/* ── キーワードマッチング ── */

export function matchScienceUnit(
  blockIndex: number,
  text: string
): SciBlockHit | null {
  const blockDef = allBlocks[blockIndex]
  if (!blockDef) return null

  const matchedKeywords: string[] = []
  let keywordCount = 0

  for (const kw of blockDef.keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'g')
    const matches = text.match(regex)
    if (matches) {
      matchedKeywords.push(kw)
      keywordCount += matches.length
    }
  }

  return {
    block: blockDef.block,
    blockIndex,
    group: blockDef.group,
    topic_l2: blockDef.topic_l2,
    matchedKeywords,
    keywordCount,
    confidence: matchedKeywords.length >= 2 ? 'high' : 'low'
  }
}

/* ── PDF全体のブロック照合 ── */

export function analyzeBlocks(text: string): SciBlockHit[] {
  const blockTexts = splitTextByBlocks(text)
  const hits: SciBlockHit[] = []

  // 検出された各大問テキストを解析
  for (const [blockNum, blockText] of blockTexts) {
    const blockIndex = blockNum - 1 // 第1問→index 0
    if (blockIndex < 0 || blockIndex >= 8) continue

    const hit = matchScienceUnit(blockIndex, blockText)
    if (hit) {
      hits.push(hit)
    }
  }

  // テキストから大問が検出できなかった場合、全文でマッチング
  if (hits.length === 0) {
    for (let i = 0; i < allBlocks.length; i++) {
      const hit = matchScienceUnit(i, text)
      if (hit && hit.keywordCount > 0) {
        hits.push(hit)
      }
    }
  }

  return hits
}
