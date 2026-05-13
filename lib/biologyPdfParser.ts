/**
 * 生物基礎過去問PDFの解析
 * PDF.jsでテキスト抽出 → 大問分割 → 分野・形式タグ付け
 */

import {
  aggregateBiologyFormatCounts,
  analyzeBiologyBlocks,
  biologyRuleSet,
  detectBiologyBlocks,
  detectBiologyExamSession,
  detectBiologyExamYear,
  estimateBiologyQuestionCount,
  type BiologyAnalysisResult
} from './biologyTagMapper'

export type BiologyParseProgress = {
  fileName: string
  status: 'loading' | 'extracting' | 'tagging' | 'done' | 'error'
  message: string
}

function isCoverOrAnswerSheet(pageText: string): boolean {
  if (/高等学校卒業程度認定試験/.test(pageText) && /注意事項/.test(pageText)) return true
  if (/注\s*意\s*事\s*項/.test(pageText) && /試験開始/.test(pageText)) return true
  if (/解答用紙/.test(pageText)) return true
  if (/受験番号/.test(pageText) && /氏名/.test(pageText) && pageText.length < 500) return true
  if (/マーク/.test(pageText) && /記入/.test(pageText) && pageText.length < 500) return true
  return false
}

export async function parseBiologyPdf(
  file: File,
  onProgress?: (progress: BiologyParseProgress) => void
): Promise<BiologyAnalysisResult> {
  onProgress?.({ fileName: file.name, status: 'loading', message: 'PDFを読み込んでいます。' })

  const pdfjs = await import('pdfjs-dist')
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }

  const buffer = await file.arrayBuffer()
  onProgress?.({ fileName: file.name, status: 'extracting', message: 'PDFからテキストを抽出しています。' })

  const loadingTask = pdfjs.getDocument({
    data: buffer,
    cMapUrl: '/cmaps/',
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

    if (!isCoverOrAnswerSheet(pageText) && pageText.trim().length > 50) {
      questionPageTexts.push(pageText)
    }
  }

  const rawText = questionPageTexts.join('\n').replace(/\s+/g, ' ').trim()

  if (!rawText || rawText.length < 30) {
    throw new Error('NO_TEXT')
  }

  const fullText = pageTexts.join('\n')
  const examYear = detectBiologyExamYear(fullText, file.name)
  const examSession = detectBiologyExamSession(fullText, file.name)

  onProgress?.({ fileName: file.name, status: 'tagging', message: '大問構成、頻出分野、出題形式を解析しています。' })

  const blockHits = analyzeBiologyBlocks(rawText)
  const detectedBlocks = detectBiologyBlocks(rawText)
  const questionCount = estimateBiologyQuestionCount(fullText)
  const formatCounts = aggregateBiologyFormatCounts(blockHits)

  onProgress?.({ fileName: file.name, status: 'done', message: '解析が完了しました。' })

  return {
    fileName: file.name,
    examYear,
    examSession,
    ruleSet: biologyRuleSet,
    rawText,
    pageTexts,
    blockHits,
    detectedBlocks,
    questionCount,
    formatCounts,
    analyzedAt: new Date().toISOString()
  }
}

export async function parseBiologyPdfs(
  files: File[],
  onProgress?: (progress: BiologyParseProgress) => void
): Promise<BiologyAnalysisResult[]> {
  const results: BiologyAnalysisResult[] = []
  for (const file of files) {
    const result = await parseBiologyPdf(file, onProgress)
    results.push(result)
  }
  return results
}
