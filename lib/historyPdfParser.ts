/**
 * 歴史過去問PDFの解析
 * PDF.js でテキスト抽出 → kuromoji.js で形態素解析 → タグ付け
 */

import { extractCompoundNouns } from './kuromojiAnalyzer'
import {
  aggregateEraTags,
  aggregateFormatTags,
  aggregateRegionTags,
  detectHistoryBlocks,
  detectHistoryExamSession,
  detectHistoryExamYear,
  estimateQuestionCount,
  getHistoryRuleSet,
  matchTopicL1,
  matchTopicL2,
  type HistoryAnalysisResult
} from './historyTagMapper'

export type HistoryParseProgress = {
  fileName: string
  status: 'loading' | 'extracting' | 'morphing' | 'tagging' | 'done' | 'error'
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

/** 1つの歴史PDFを解析する */
export async function parseHistoryPdf(
  file: File,
  onProgress?: (progress: HistoryParseProgress) => void
): Promise<HistoryAnalysisResult> {
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
  const examYear = detectHistoryExamYear(fullText, file.name)
  const examSession = detectHistoryExamSession(fullText, file.name)
  const ruleSet = getHistoryRuleSet(examYear)

  onProgress?.({ fileName: file.name, status: 'morphing', message: 'テキストからキーワードを抽出しています。' })

  // 正規表現ベースでキーワード抽出
  const nouns = await extractCompoundNouns(rawText)

  onProgress?.({ fileName: file.name, status: 'tagging', message: '年度、問題構造、テーマタグを解析しています。' })

  // 大問番号の検出
  const detectedBlocks = detectHistoryBlocks(rawText, ruleSet)

  // 問題数の推定
  const questionCount = estimateQuestionCount(rawText, ruleSet)

  // タグ付け（テキスト全体から照合）
  const topicHits = matchTopicL1(nouns, rawText, ruleSet)
  const topicL2Hits = matchTopicL2(nouns, rawText)
  const eraHits = aggregateEraTags(topicHits)
  const regionHits = aggregateRegionTags(topicHits)

  // 出題形式タグ
  const { tags: formatTags, counts: formatCounts } = aggregateFormatTags(rawText)

  onProgress?.({ fileName: file.name, status: 'done', message: '解析が完了しました。' })

  return {
    fileName: file.name,
    examYear,
    examSession,
    ruleSet,
    rawText,
    pageTexts,
    topicHits,
    topicL2Hits,
    eraHits,
    regionHits,
    formatTags,
    formatCounts,
    detectedBlocks,
    questionCount,
    analyzedAt: new Date().toISOString()
  }
}

/** 複数PDFを連続で解析 */
export async function parseHistoryPdfs(
  files: File[],
  onProgress?: (progress: HistoryParseProgress) => void
): Promise<HistoryAnalysisResult[]> {
  const results: HistoryAnalysisResult[] = []
  for (const file of files) {
    const result = await parseHistoryPdf(file, onProgress)
    results.push(result)
  }
  return results
}
