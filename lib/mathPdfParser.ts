/**
 * mathPdfParser.ts
 * 数学過去問PDFをブラウザ上で解析する。
 * pdfjs-dist でテキスト抽出 → mathTagMapper で構造解析。
 */

import { analyzeMathPages, type MathAnalysisResult } from './mathTagMapper'

export type MathParseProgress = {
  fileName: string
  status: 'loading' | 'extracting' | 'analyzing' | 'done' | 'error'
  message: string
}

/**
 * 単一の数学PDFファイルを解析する
 */
export async function parseMathPdf(
  file: File,
  onProgress?: (progress: MathParseProgress) => void
): Promise<MathAnalysisResult> {
  onProgress?.({
    fileName: file.name,
    status: 'loading',
    message: `${file.name} を読み込んでいます…`
  })

  const pdfjs = await import('pdfjs-dist')
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }

  const buffer = await file.arrayBuffer()

  onProgress?.({
    fileName: file.name,
    status: 'extracting',
    message: `${file.name} からテキストを抽出しています…`
  })

  const loadingTask = pdfjs.getDocument({
    data: buffer,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    useWorkerFetch: false,
    isEvalSupported: false
  })

  const pdf = await loadingTask.promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  // 全ページが空の場合
  const hasText = pages.some((p) => p.trim().length > 10)
  if (!hasText) {
    throw new Error('NO_TEXT')
  }

  onProgress?.({
    fileName: file.name,
    status: 'analyzing',
    message: `${file.name} の年度・大問構造・トピックを解析しています…`
  })

  const result = analyzeMathPages(pages, file.name)

  onProgress?.({
    fileName: file.name,
    status: 'done',
    message: `${file.name} の解析が完了しました。`
  })

  return result
}

/**
 * 複数の数学PDFファイルを順番に解析する
 */
export async function parseMathPdfs(
  files: File[],
  onProgress?: (progress: MathParseProgress) => void
): Promise<MathAnalysisResult[]> {
  const results: MathAnalysisResult[] = []

  for (const file of files) {
    try {
      const result = await parseMathPdf(file, onProgress)
      results.push(result)
    } catch (error) {
      onProgress?.({
        fileName: file.name,
        status: 'error',
        message: `${file.name} の解析に失敗しました。`
      })
      // 個別ファイルの失敗はスキップして続行
      console.warn(`Failed to parse ${file.name}:`, error)
    }
  }

  if (results.length === 0) {
    throw new Error('NO_TEXT')
  }

  return results
}
