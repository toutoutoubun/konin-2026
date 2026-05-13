/**
 * 国語過去問PDFの解析
 * PDF.jsでテキスト抽出 → 大問分割 → 分野・形式タグ付け
 */

import {
  aggregateJapaneseFormatCounts,
  analyzeJapaneseBlocks,
  detectJapaneseBlocks,
  detectJapaneseExamSession,
  detectJapaneseExamYear,
  estimateJapaneseQuestionCount,
  japaneseRuleSet,
  type JapaneseAnalysisResult
} from './japaneseTagMapper'

export type JapaneseParseProgress = {
  fileName: string
  status: 'loading' | 'extracting' | 'tagging' | 'done' | 'error'
  message: string
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function isCoverOrAnswerSheet(pageText: string): boolean {
  if (/高等学校卒業程度認定試験/.test(pageText) && /注意事項/.test(pageText)) return true
  if (/注\s*意\s*事\s*項/.test(pageText) && /試験開始/.test(pageText)) return true
  if (/問題は、?次のページから始まります/.test(pageText) && pageText.length < 80) return true
  if (/解答用紙/.test(pageText)) return true
  if (/受験番号/.test(pageText) && /氏名/.test(pageText) && pageText.length < 700) return true
  if (/マーク/.test(pageText) && /記入/.test(pageText) && pageText.length < 700) return true
  return false
}

async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `${basePath}/pdf.worker.min.mjs`
  return pdfjs
}

export async function parseJapanesePdf(
  file: File,
  onProgress?: (progress: JapaneseParseProgress) => void
): Promise<JapaneseAnalysisResult> {
  onProgress?.({ fileName: file.name, status: 'loading', message: 'PDFを読み込んでいます。' })

  const pdfjs = await getPdfjs()
  const buffer = await file.arrayBuffer()

  onProgress?.({ fileName: file.name, status: 'extracting', message: 'PDFからテキストを抽出しています。' })

  const loadingTask = pdfjs.getDocument({
    data: buffer,
    cMapUrl: `${basePath}/cmaps/`,
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
      .replace(/\s+/g, ' ')
      .trim()
    pageTexts.push(pageText)

    if (!isCoverOrAnswerSheet(pageText) && pageText.length > 40) {
      questionPageTexts.push(pageText)
    }
  }

  const rawText = questionPageTexts.join('\n').replace(/[ \t]+/g, ' ').trim()

  if (!rawText || rawText.length < 30) {
    throw new Error('NO_TEXT')
  }

  const fullText = pageTexts.join('\n')
  const examYear = detectJapaneseExamYear(fullText, file.name)
  const examSession = detectJapaneseExamSession(fullText, file.name)

  onProgress?.({ fileName: file.name, status: 'tagging', message: '大問構成、頻出分野、出題形式を解析しています。' })

  const blockHits = analyzeJapaneseBlocks(rawText)
  const detectedBlocks = detectJapaneseBlocks(rawText)
  const questionCount = estimateJapaneseQuestionCount(fullText)
  const formatCounts = aggregateJapaneseFormatCounts(blockHits)

  onProgress?.({ fileName: file.name, status: 'done', message: '解析が完了しました。' })

  return {
    fileName: file.name,
    examYear,
    examSession,
    ruleSet: japaneseRuleSet,
    rawText,
    pageTexts,
    blockHits,
    detectedBlocks,
    questionCount,
    formatCounts,
    analyzedAt: new Date().toISOString()
  }
}

export async function parseJapanesePdfs(
  files: File[],
  onProgress?: (progress: JapaneseParseProgress) => void
): Promise<JapaneseAnalysisResult[]> {
  const results: JapaneseAnalysisResult[] = []
  for (const file of files) {
    const result = await parseJapanesePdf(file, onProgress)
    results.push(result)
  }
  return results
}
