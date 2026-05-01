/**
 * mathPatternMatcher.ts — v2.0
 *
 * 数学PDFのページ分類、CIDコード検出、大問番号検出。
 * 数式部分はCIDコードとして抽出されるため数式解析は行わない。
 * 正常テキスト（大問番号・年度・ページ識別子）とページ位置で大問を特定する。
 */

// ── ページ分類 ─────────────────────────────────────

export type PageClassification =
  | 'question'
  | 'blank'
  | 'cover'
  | 'answer'
  | 'cidHeavy'

/**
 * CIDコードが大量に含まれるかを判定する。
 * (cid:NNN) の出現文字数がテキスト全体の30%以上なら数式ページとみなす。
 */
export function isCIDHeavy(text: string): boolean {
  if (text.length === 0) return false
  const cidPattern = /\(cid:\d+\)/g
  const matches = text.match(cidPattern)
  if (!matches) return false
  // 各マッチの文字数を合算
  const cidChars = matches.reduce((sum, m) => sum + m.length, 0)
  return cidChars / text.length > 0.3
}

/**
 * 計算用余白ページ or ほぼ空白のページかを判定する。
 */
export function isBlankPage(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10) return true
  if (/計算用\s*余白/.test(trimmed)) return true
  if (/計算用\s*ページ/.test(trimmed)) return true
  if (/^[\s\u3000]*$/.test(trimmed)) return true
  // ページ番号だけのページ
  if (/^[\s\u3000\-―─\d]+$/.test(trimmed)) return true
  return false
}

/**
 * 表紙・注意事項ページかを判定する。
 */
export function isCoverPage(text: string): boolean {
  return (
    /注\s*意\s*事\s*項/.test(text) ||
    text.includes('解答上の注意') ||
    text.includes('試験開始の合図') ||
    text.includes('受験番号') ||
    /高等学校卒業程度認定試験/.test(text) ||
    text.includes('数\u3000\u3000学') // 表紙の「数　　学」
  )
}

/**
 * 解答用紙ページかを判定する。
 */
export function isAnswerSheet(text: string): boolean {
  return (
    text.includes('解答用紙') ||
    text.includes('マークシート') ||
    text.includes('記入上の注意') ||
    text.includes('正解番号')
  )
}

/**
 * ページテキストを分類する。
 */
export function classifyPage(text: string): PageClassification {
  if (isBlankPage(text)) return 'blank'
  if (isCoverPage(text)) return 'cover'
  if (isAnswerSheet(text)) return 'answer'
  if (isCIDHeavy(text)) return 'cidHeavy'
  return 'question'
}

// ── 年度・試験回検出 ─────────────────────────────────

/**
 * 年度を検出する（西暦 or 元号）。
 */
export function detectExamYear(text: string, fileName = ''): number | null {
  const target = `${fileName}\n${text}`

  // 西暦: 2014–2029
  const western = target.match(/20(1[4-9]|2[0-9])\s*(?:年度|年)?/)
  if (western) return Number(western[0].match(/20\d{2}/)?.[0])

  // 令和
  const reiwa = target.match(/令和\s*([元1-9]|[0-9]{1,2})\s*年度?/)
  if (reiwa) {
    const raw = reiwa[1]
    return 2018 + (raw === '元' ? 1 : Number(raw))
  }

  // 平成
  const heisei = target.match(/平成\s*([0-9]{1,2})\s*年度?/)
  if (heisei) return 1988 + Number(heisei[1])

  return null
}

/**
 * 試験回を検出する。「第1回」「第2回」等。
 */
export function detectExamSession(text: string, fileName = ''): string {
  const target = `${fileName}\n${text}`
  const year = detectExamYear(text, fileName)

  const sessionMatch = target.match(/(?:第\s*([12])\s*回|([12])\s*回目)/i)
  const session = sessionMatch?.[1] ?? sessionMatch?.[2]

  if (year && session) return `${year}年度 第${session}回`
  if (year) return `${year}年度`
  return '試験回未検出'
}

// ── 大問番号検出 ─────────────────────────────────────

const KANJI_MAP: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6
}

export type BigQuestionMatch = {
  raw: string
  blockNumber: number
  pageIndex: number
}

/**
 * 全ページから大問番号を検出する。
 * 「第1問」「第一問」等のパターンを認識。
 * questionまたはcidHeavyのページのみ対象とする。
 */
export function detectBigQuestions(
  pages: string[],
  pageClassifications?: PageClassification[]
): BigQuestionMatch[] {
  const results: BigQuestionMatch[] = []
  const seen = new Set<number>()

  for (let i = 0; i < pages.length; i++) {
    // question or cidHeavy ページのみ対象
    if (pageClassifications) {
      const cls = pageClassifications[i]
      if (cls === 'blank' || cls === 'cover' || cls === 'answer') continue
    }

    const text = pages[i]

    // パターン1: 「第N問」「第一問」
    const daiPattern = /第\s*([0-9一二三四五六]+)\s*問/g
    let match: RegExpExecArray | null
    while ((match = daiPattern.exec(text)) !== null) {
      const rawNum = match[1]
      const num = /^[0-9]+$/.test(rawNum)
        ? parseInt(rawNum, 10)
        : (KANJI_MAP[rawNum] ?? 0)
      if (num >= 1 && num <= 6 && !seen.has(num)) {
        seen.add(num)
        results.push({ raw: match[0], blockNumber: num, pageIndex: i })
      }
    }

    // パターン2: ページ先頭の単独数字「1」〜「6」（大問番号の可能性）
    if (!seen.has(0)) {
      const headMatch = text.trimStart().match(/^([1-6])\s/)
      if (headMatch) {
        const num = parseInt(headMatch[1], 10)
        if (!seen.has(num)) {
          seen.add(num)
          results.push({ raw: headMatch[0], blockNumber: num, pageIndex: i })
        }
      }
    }
  }

  return results.sort((a, b) => a.blockNumber - b.blockNumber)
}
