/**
 * 地理過去問PDFの解析
 * PDF.js でテキスト抽出 → kuromoji.js で形態素解析 → タグ付け
 */

import { extractCompoundNouns } from './kuromojiAnalyzer'
import {
  aggregateFormatTags,
  aggregateRegionTags,
  detectGeoBlocks,
  detectGeoExamSession,
  detectGeoExamYear,
  detectGeoSubject,
  estimateQuestionCount,
  getGeoRuleSet,
  matchTopicL1,
  matchTopicL2,
  type GeoAnalysisResult
} from './geographyTagMapper'

export type GeoParseProgress = {
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

/** 1つの地理PDFを解析する */
export async function parseGeographyPdf(
  file: File,
  onProgress?: (progress: GeoParseProgress) => void
): Promise<GeoAnalysisResult> {
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
  const examYear = detectGeoExamYear(fullText, file.name)
  const examSession = detectGeoExamSession(fullText, file.name)
  const ruleSet = getGeoRuleSet(examYear)

  // 科目名の検出（GEO_OLD の場合、地理A/地理B を判定）
  const detectedSubject = detectGeoSubject(fullText, ruleSet)

  onProgress?.({ fileName: file.name, status: 'morphing', message: 'テキストからキーワードを抽出しています。' })

  // 正規表現ベースでキーワード抽出
  const nouns = await extractCompoundNouns(rawText)

  onProgress?.({ fileName: file.name, status: 'tagging', message: '年度、問題構造、テーマタグを解析しています。' })

  // 大問番号の検出
  const detectedBlocks = detectGeoBlocks(rawText, ruleSet)

  // 問題数の推定
  const questionCount = estimateQuestionCount(rawText, ruleSet)

  // topic_l1 の候補を科目に応じてフィルタ（GEO_OLD の場合）
  let effectiveRuleSet = ruleSet
  if (ruleSet.code === 'GEO_OLD' && detectedSubject) {
    const rsData = (await import('@/data/geographyTags.json')).default.rule_sets[0] as any
    if (detectedSubject === '地理A') {
      effectiveRuleSet = { ...ruleSet, topic_l1: rsData.topic_l1_A ?? ruleSet.topic_l1 }
    } else if (detectedSubject === '地理B') {
      effectiveRuleSet = { ...ruleSet, topic_l1: rsData.topic_l1_B ?? ruleSet.topic_l1 }
    }
  }

  // タグ付け
  const topicHits = matchTopicL1(nouns, rawText, effectiveRuleSet)
  const topicL2Hits = matchTopicL2(nouns, rawText)

  // 地域タグ（地理専用：キーワードベース）
  const regionHits = aggregateRegionTags(nouns, rawText)

  // 出題形式タグ
  const { tags: formatTags, counts: formatCounts } = aggregateFormatTags(rawText)

  onProgress?.({ fileName: file.name, status: 'done', message: '解析が完了しました。' })

  return {
    fileName: file.name,
    examYear,
    examSession,
    ruleSet,
    detectedSubject,
    rawText,
    pageTexts,
    topicHits,
    topicL2Hits,
    regionHits,
    formatTags,
    formatCounts,
    detectedBlocks,
    questionCount,
    analyzedAt: new Date().toISOString()
  }
}

/** 複数PDFを連続で解析 */
export async function parseGeographyPdfs(
  files: File[],
  onProgress?: (progress: GeoParseProgress) => void
): Promise<GeoAnalysisResult[]> {
  const results: GeoAnalysisResult[] = []
  for (const file of files) {
    const result = await parseGeographyPdf(file, onProgress)
    results.push(result)
  }
  return results
}
