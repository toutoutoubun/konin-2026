import { analyzeEnglishText } from './textAnalyzer'
import { analyzeVocabulary } from './vocabAnalyzer'
import {
  AnalysisResult,
  countFormats,
  detectExamSession,
  detectExamYear,
  detectQuestionBlocks,
  getRuleSetForYear
} from './tagMapper'

export type ParseProgress = {
  fileName: string
  status: 'loading' | 'extracting' | 'analyzing' | 'done' | 'error'
  message: string
}

export async function parseEnglishPdf(file: File, onProgress?: (progress: ParseProgress) => void): Promise<AnalysisResult> {
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
  const chunks: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    chunks.push(pageText)
  }

  const rawText = chunks.join('\n').replace(/\s+/g, ' ').trim()
  if (!rawText) {
    throw new Error('NO_TEXT')
  }

  onProgress?.({ fileName: file.name, status: 'analyzing', message: '年度、問題構造、英文タグを解析しています。' })
  const examYear = detectExamYear(rawText, file.name)
  const examSession = detectExamSession(rawText, file.name)
  const ruleSet = getRuleSetForYear(examYear)
  const questionBlocks = detectQuestionBlocks(rawText, ruleSet)
  const nlpResult = analyzeEnglishText(rawText)
  const vocabResult = analyzeVocabulary(rawText)
  const formatCounts = countFormats(questionBlocks, ruleSet)

  onProgress?.({ fileName: file.name, status: 'done', message: '解析が完了しました。' })
  return {
    fileName: file.name,
    examYear,
    examSession,
    ruleSet,
    rawText,
    questionBlocks,
    grammarTags: nlpResult.grammarTags,
    vocabularyLevels: nlpResult.vocabularyLevels,
    vocabItems: vocabResult.vocabItems,
    cefrDistribution: vocabResult.cefrDistribution,
    grammarVocabCross: vocabResult.grammarVocabCross,
    totalContentWords: vocabResult.totalContentWords,
    formatCounts,
    analyzedAt: new Date().toISOString()
  }
}

export async function parseEnglishPdfs(files: File[], onProgress?: (progress: ParseProgress) => void): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = []
  for (const file of files) {
    const result = await parseEnglishPdf(file, onProgress)
    results.push(result)
  }
  return results
}
