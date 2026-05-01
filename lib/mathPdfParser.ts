/**
 * mathPdfParser.ts — v2.0
 *
 * 数学過去問PDFをブラウザ上で解析する。
 * pdfjs-dist でテキスト抽出 → mathTagMapper で構造解析。
 * CMapはローカル /cmaps/ を使用、Workerも /pdf.worker.min.mjs を使用。
 *
 * NOTE: pdfjs-dist は Promise.withResolvers を使用するため、
 * Next.js SSRプリレンダリング時に読み込まないよう動的インポートを使用する。
 */

import { analyzeMathPages, type MathAnalysisResult } from './mathTagMapper'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export type MathParseProgress = {
  fileName: string
  current: number
  total: number
  status: 'loading' | 'extracting' | 'analyzing' | 'done' | 'error'
  message: string
}

/**
 * pdfjs-dist を動的インポートし、Workerを設定する。
 * SSR時にはインポートされないため Promise.withResolvers エラーを回避できる。
 */
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${basePath}/pdf.worker.min.mjs`
  return pdfjsLib
}

/**
 * 単一の数学PDFファイルを解析する
 */
export async function parseMathPdf(
  file: File,
  onProgress?: (progress: MathParseProgress) => void
): Promise<MathAnalysisResult> {
  const prog = (
    status: MathParseProgress['status'],
    message: string,
    current = 0,
    total = 0
  ) => onProgress?.({ fileName: file.name, current, total, status, message })

  prog('loading', `${file.name} を読み込んでいます…`)

  const buffer = await file.arrayBuffer()

  prog('extracting', `${file.name} からテキストを抽出しています…`)

  const pdfjsLib = await getPdfjs()

  const loadingTask = pdfjsLib.getDocument({
    data: buffer,
    cMapUrl: `${basePath}/cmaps/`,
    cMapPacked: true
  })

  const pdf = await loadingTask.promise
  const pages: string[] = []
  const totalPages = pdf.numPages

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    prog(
      'extracting',
      `${file.name}: ${pageNumber}/${totalPages} ページ抽出中…`,
      pageNumber,
      totalPages
    )
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  // 全ページが空の場合
  const hasText = pages.some((p) => p.trim().length > 5)
  if (!hasText) {
    throw new Error('NO_TEXT')
  }

  prog('analyzing', `${file.name} の年度・大問構造を解析しています…`)

  const result = analyzeMathPages(pages, file.name)

  prog('done', `解析完了: ${file.name} – ${result.examSession}`)

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
        current: 0,
        total: 0,
        status: 'error',
        message: `${file.name} の解析に失敗しました。`
      })
      console.warn(`Failed to parse ${file.name}:`, error)
    }
  }

  if (results.length === 0) {
    throw new Error('NO_TEXT')
  }

  return results
}
