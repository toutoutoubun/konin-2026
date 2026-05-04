/**
 * 科学と人間生活 過去問PDFの解析
 * PDF.js でテキスト抽出 → 正規表現パターンマッチング → scienceTags.json照合
 * kuromoji.js は使用しない
 */

import {
  analyzeBlocks,
  detectSciBlocks,
  detectSciExamSession,
  detectSciExamYear,
  sciRuleSet,
  type SciAnalysisResult
} from './scienceTagMapper'

export type SciParseProgress = {
  fileName: string
  status: 'loading' | 'extracting' | 'tagging' | 'done' | 'error'
  message: string
}

/** 表紙・解答用紙を判定してスキップ */
function isCoverOrAnswerSheet(pageText: string): boolean {
  if (/高等学校卒業程度認定試験/.test(pageText) && /注意事項/.test(pageText)) return true
  if (/解答用紙/.test(pageText)) return true
  if (/受験番号/.test(pageText) && /氏名/.test(pageText) && pageText.length < 300) return true
  if (/マーク/.test(pageText) && /記入/.test(pageText) && pageText.length < 400) return true
  return false
}

/** 1つの科学と人間生活PDFを解析する */
export async function parseSciencePdf(
  file: File,
  onProgress?: (progress: SciParseProgress) => void
): Promise<SciAnalysisResult> {
  onProgress?.({ fileName: file.name, status: 'loading', message: 'PDFを読み込んでいます。' })

  const pdfjs = await import('pdfjs-dist')
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }

  const buffer = await file.arrayBuffer()
  onProgress?.({ fileName: file.name, status: 'extracting', message: 'PDFからテキストを抽出しています。' })

  const loadingTask = pdfjs.getDocument({
    data: buffer,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    useWorkerFetch: false,
    isEvalSupported: false
  })
  const pdf = await loadingTask.promise

  const pageTexts: string[] = []
  const questionPageTexts: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pageTexts.push(pageText)

    // 表紙・解答用紙はスキップ
    if (!isCoverOrAnswerSheet(pageText) && pageText.trim().length > 50) {
      questionPageTexts.push(pageText)
    }
  }

  const rawText = questionPageTexts.join('\n').replace(/\s+/g, ' ').trim()

  if (!rawText || rawText.length < 30) {
    throw new Error('NO_TEXT')
  }

  // 年度・試験回の検出
  const fullText = pageTexts.join('\n')
  const examYear = detectSciExamYear(fullText, file.name)
  const examSession = detectSciExamSession(fullText, file.name)

  onProgress?.({ fileName: file.name, status: 'tagging', message: '大問構造とキーワードを解析しています。' })

  // 大問番号の検出
  const detectedBlocks = detectSciBlocks(rawText)

  // 各大問のキーワードマッチング
  const blockHits = analyzeBlocks(rawText)

  onProgress?.({ fileName: file.name, status: 'done', message: '解析が完了しました。' })

  return {
    fileName: file.name,
    examYear,
    examSession,
    ruleSet: sciRuleSet,
    rawText,
    pageTexts,
    blockHits,
    detectedBlocks,
    analyzedAt: new Date().toISOString()
  }
}

/** 複数PDFを連続で解析 */
export async function parseSciencePdfs(
  files: File[],
  onProgress?: (progress: SciParseProgress) => void
): Promise<SciAnalysisResult[]> {
  const results: SciAnalysisResult[] = []
  for (const file of files) {
    const result = await parseSciencePdf(file, onProgress)
    results.push(result)
  }
  return results
}
