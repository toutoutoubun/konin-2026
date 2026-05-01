/**
 * mathPatternMatcher.ts
 * 数学過去問PDFから大問番号、小問番号、選択肢（ア〜エ）を検出し、
 * 空白ページ・計算用紙・表紙・解答用紙をスキップする。
 */

/** ページ分類結果 */
export type PageClassification =
  | 'question'    // 問題ページ
  | 'blank'       // 白紙・計算用紙
  | 'cover'       // 表紙
  | 'answerSheet' // 解答用紙
  | 'formulaOnly' // 数式・図のみ

/** 大問検出結果 */
export type BigQuestionMatch = {
  raw: string          // マッチした生テキスト
  blockNumber: number  // 正規化された大問番号（1〜6）
  startIndex: number   // テキスト内の開始位置
}

/** 小問検出結果 */
export type SubQuestionMatch = {
  raw: string
  subNumber: number
  startIndex: number
}

/** 選択肢検出結果 */
export type ChoiceMatch = {
  raw: string
  choices: string[]
}

// ── ページ分類 ─────────────────────────────────────────

const BLANK_PATTERNS = [
  /^[\s\u3000]*$/,                          // 完全空白
  /計算用紙/,                                // 計算用紙
  /このページは白紙/i,                       // 白紙明示
  /余白/,                                    // 余白
  /メモ欄/                                   // メモ欄
]

const COVER_PATTERNS = [
  /高等学校卒業程度認定試験/,
  /文部科学省/,
  /注\s*意\s*事\s*項/,
  /試験問題は.*ページ/,
  /受験番号/,
  /解答についての注意/
]

const ANSWER_SHEET_PATTERNS = [
  /解答用紙/,
  /マークシート/,
  /解答番号/,
  /記入上の注意/
]

/**
 * ページテキストを分類する
 */
export function classifyPage(pageText: string): PageClassification {
  const trimmed = pageText.trim()

  // 完全空白 or 非常に短いテキスト
  if (trimmed.length < 10) return 'blank'

  // 空白・計算用紙
  if (BLANK_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'blank'

  // 表紙
  if (COVER_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'cover'

  // 解答用紙
  if (ANSWER_SHEET_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'answerSheet'

  // 数式・図のみ判定: 日本語テキストがほとんどなく数字・記号が主体
  const japaneseChars = (trimmed.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) ?? []).length
  const totalChars = trimmed.replace(/\s/g, '').length
  if (totalChars > 20 && japaneseChars / totalChars < 0.05) return 'formulaOnly'

  return 'question'
}

// ── 大問番号検出 ─────────────────────────────────────────

const KANJI_MAP: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
  '七': 7, '八': 8, '九': 9, '十': 10
}

/**
 * 大問見出しを検出する
 * パターン: 「第1問」「第一問」「問1」「[1]」「【1】」
 */
export function detectBigQuestions(text: string): BigQuestionMatch[] {
  const patterns: RegExp[] = [
    /第\s*([0-9一二三四五六七八九十]+)\s*問/g,
    /問\s*([0-9]+)/g,
    /[\[［]\s*([0-9]+)\s*[\]］]/g,
    /【\s*([0-9]+)\s*】/g
  ]

  const results: BigQuestionMatch[] = []
  const seen = new Set<number>()

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const rawNumber = match[1]
      let blockNumber: number

      if (/^[0-9]+$/.test(rawNumber)) {
        blockNumber = parseInt(rawNumber, 10)
      } else {
        blockNumber = KANJI_MAP[rawNumber] ?? 0
      }

      if (blockNumber >= 1 && blockNumber <= 6 && !seen.has(blockNumber)) {
        seen.add(blockNumber)
        results.push({
          raw: match[0],
          blockNumber,
          startIndex: match.index
        })
      }
    }
  }

  return results.sort((a, b) => a.blockNumber - b.blockNumber)
}

// ── 小問番号検出 ─────────────────────────────────────────

/**
 * 大問テキストブロック内の小問番号を検出する
 * パターン: (1), 〔1〕, 問1, ①②③
 */
export function detectSubQuestions(blockText: string): SubQuestionMatch[] {
  const patterns: RegExp[] = [
    /[（\(]\s*([0-9]+)\s*[）\)]/g,
    /〔\s*([0-9]+)\s*〕/g,
    /問\s*([0-9]+)/g
  ]

  const circleDigits: Record<string, number> = {
    '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5,
    '⑥': 6, '⑦': 7, '⑧': 8, '⑨': 9, '⑩': 10
  }

  const results: SubQuestionMatch[] = []
  const seen = new Set<number>()

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(blockText)) !== null) {
      const subNumber = parseInt(match[1], 10)
      if (subNumber >= 1 && subNumber <= 20 && !seen.has(subNumber)) {
        seen.add(subNumber)
        results.push({ raw: match[0], subNumber, startIndex: match.index })
      }
    }
  }

  // 丸数字
  const circlePattern = /[①②③④⑤⑥⑦⑧⑨⑩]/g
  let circleMatch: RegExpExecArray | null
  while ((circleMatch = circlePattern.exec(blockText)) !== null) {
    const subNumber = circleDigits[circleMatch[0]]
    if (subNumber && !seen.has(subNumber)) {
      seen.add(subNumber)
      results.push({ raw: circleMatch[0], subNumber, startIndex: circleMatch.index })
    }
  }

  return results.sort((a, b) => a.subNumber - b.subNumber)
}

// ── 選択肢検出 ─────────────────────────────────────────

/**
 * 選択肢パターン（ア〜エ、①〜④、A〜D等）を検出する
 */
export function detectChoices(blockText: string): ChoiceMatch {
  const katakanaChoices = blockText.match(/[アイウエオ]\s*[\.．、)\s]/g)
  const circleChoices = blockText.match(/[①②③④]/g)
  const alphaChoices = blockText.match(/[A-D]\s*[\.．)\s]/g)

  const allChoices: string[] = [
    ...new Set([
      ...(katakanaChoices ?? []).map((c) => c.trim().replace(/[\.．、)\s]/g, '')),
      ...(circleChoices ?? []),
      ...(alphaChoices ?? []).map((c) => c.trim().replace(/[\.．)\s]/g, ''))
    ])
  ]

  return {
    raw: allChoices.join(', '),
    choices: allChoices.slice(0, 20)
  }
}

// ── 数式のみ判定 ─────────────────────────────────────────

/**
 * 小問テキストが数式・図のみかどうかを判定する
 * 日本語文字が非常に少なく、数字・記号が主体の場合にtrue
 */
export function isFormulaOnly(subText: string): boolean {
  const trimmed = subText.trim()
  if (trimmed.length < 5) return true

  const japaneseChars = (trimmed.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) ?? []).length
  const totalChars = trimmed.replace(/\s/g, '').length

  // 日本語が5%未満で、テキストの長さが十分ある場合
  if (totalChars > 15 && japaneseChars / totalChars < 0.08) return true

  return false
}
