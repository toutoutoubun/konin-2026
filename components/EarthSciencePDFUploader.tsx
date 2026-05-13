'use client'

import { useRef, useState } from 'react'
import { parseEarthSciencePdfs, type EarthScienceParseProgress } from '@/lib/earthSciencePdfParser'
import type { EarthScienceAnalysisResult } from '@/lib/earthScienceTagMapper'
import SkeletonLoader from './SkeletonLoader'

type Props = {
  onComplete: (results: EarthScienceAnalysisResult[]) => void
  onError: (message: string) => void
}

export default function EarthSciencePDFUploader({ onComplete, onError }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<EarthScienceParseProgress | null>(null)

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    )
    if (!files.length) {
      onError('該当データはない：PDFファイルを選択してください。')
      return
    }

    setLoading(true)
    onError('')
    try {
      const results = await parseEarthSciencePdfs(files, setProgress)
      onComplete(results)
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'NO_TEXT'
          ? '該当データはない：PDFからテキストを抽出できませんでした。別の公式PDFで試してください。'
          : '解析できませんでした。PDFを選び直すか、文科省公式ページから取得した地学基礎PDFか確認してください。'
      onError(message)
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="earth-science-upload-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">LOCAL PDF</p>
        <h2 id="earth-science-upload-title" className="mt-2 font-mincho text-4xl font-bold md:text-6xl">
          公式PDFを選択
        </h2>
        <p id="earth-science-upload-help" className="mt-3 max-w-3xl">
          ユーザーが文科省公式ページから取得した地学基礎PDFを選択すると、端末内で大問構成・頻出分野・出題形式を集計します。複数ファイルを同時に追加できます。PDFはサーバーへ送信せず、問題文や設問文は再掲載しません。
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-describedby="earth-science-upload-help earth-science-upload-status"
        aria-label="地学基礎の公式PDFを端末内解析用に選択"
        className={`grid min-h-[230px] place-items-center border-[3px] border-dashed border-ink bg-cream p-8 text-center ${dragging ? 'bg-yellow' : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void handleFiles(event.dataTransfer.files)
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={(event) => event.target.files && void handleFiles(event.target.files)}
        />
        <div>
          <span className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-orange font-serifDisplay text-xl text-white">
            PDF
          </span>
          <strong className="block text-xl">ここへドラッグ&ドロップ</strong>
          <span className="mt-2 block">またはクリックして複数PDFを選択</span>
        </div>
      </div>

      <div id="earth-science-upload-status" className="mt-5" aria-live="polite">
        {loading ? (
          <SkeletonLoader label={progress?.message ?? 'PDF解析中'} />
        ) : (
          <p className="border-2 border-ink bg-cream p-4">
            未解析。PDFを選択すると、解析したファイル名・試験回・検出した大問構成を表示します。
          </p>
        )}
      </div>
    </section>
  )
}
