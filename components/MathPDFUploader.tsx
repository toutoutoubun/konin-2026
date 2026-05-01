'use client'

import { useRef, useState } from 'react'
import { parseMathPdfs, type MathParseProgress } from '@/lib/mathPdfParser'
import type { MathAnalysisResult } from '@/lib/mathTagMapper'
import SkeletonLoader from './SkeletonLoader'

type Props = {
  onComplete: (results: MathAnalysisResult[]) => void
  onError: (message: string) => void
}

export default function MathPDFUploader({ onComplete, onError }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<MathParseProgress | null>(null)
  const [completedFiles, setCompletedFiles] = useState<
    { name: string; session: string; skippedBlank: number; skippedCid: number }[]
  >([])

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
    )
    if (!files.length) {
      onError('該当データはない：PDFファイルを選択してください。')
      return
    }

    setLoading(true)
    setCompletedFiles([])
    onError('')
    try {
      const results = await parseMathPdfs(files, setProgress)
      setCompletedFiles(
        results.map((r) => ({
          name: r.fileName,
          session: r.examSession,
          skippedBlank: r.blankPages,
          skippedCid: r.cidHeavyPages
        }))
      )
      onComplete(results)
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'NO_TEXT'
          ? '該当データはない：PDFからテキストを抽出できませんでした。文科省公開の数学過去問PDFで試してください。'
          : '解析できませんでした。PDFを選び直すか、文科省公開の過去問PDFか確認してください。'
      onError(message)
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <section className="panel p-6 md:p-8" aria-labelledby="math-upload-title">
      <div className="mb-6">
        <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">
          UPLOAD
        </p>
        <h2
          id="math-upload-title"
          className="mt-2 font-mincho text-4xl font-bold md:text-6xl"
        >
          PDFアップロード
        </h2>
        <p id="math-upload-help" className="mt-3 max-w-3xl">
          文科省公開の数学過去問PDFをアップロードすると分析します。複数年度のPDFを同時に選択できます。PDFはサーバーへ送信せず、ブラウザ上で処理します。
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-describedby="math-upload-help math-upload-status"
        aria-label="数学過去問PDFをアップロード"
        className={`grid min-h-[230px] place-items-center border-[3px] border-dashed border-ink bg-cream p-8 text-center transition-colors ${dragging ? 'bg-yellow' : ''}`}
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
          aria-label="数学過去問PDFファイルを選択"
          onChange={(event) =>
            event.target.files && void handleFiles(event.target.files)
          }
        />
        <div>
          <span
            className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-orange font-serifDisplay text-xl"
            aria-hidden="true"
          >
            PDF
          </span>
          <strong className="block text-xl">ここへドラッグ&ドロップ</strong>
          <span className="mt-2 block">
            またはクリックして複数PDFを選択
          </span>
        </div>
      </div>

      <div id="math-upload-status" className="mt-5" aria-live="polite">
        {loading ? (
          <SkeletonLoader
            label={progress?.message ?? '数学PDFを解析しています…'}
          />
        ) : completedFiles.length > 0 ? (
          <div className="space-y-2">
            {completedFiles.map((f, i) => (
              <div key={`${f.name}-${i}`} className="border-2 border-ink bg-cream p-4">
                <p className="font-bold">
                  解析完了: {f.name} – {f.session}
                </p>
                {f.skippedBlank > 0 && (
                  <p className="text-sm mt-1">
                    計算用ページをスキップしました: {f.skippedBlank}ページ
                  </p>
                )}
                {f.skippedCid > 0 && (
                  <p className="text-sm mt-1">
                    数式のみのページ: {f.skippedCid}ページ（対象外）
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="border-2 border-ink bg-cream p-4">
            未解析。PDFを選択すると、解析したファイル名と検出した試験回を表示します。
          </p>
        )}
      </div>
    </section>
  )
}
