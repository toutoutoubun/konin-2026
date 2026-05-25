import { officialPastExamUrl } from '@/data/subjects'
import { footerSecondaryItems } from '@/data/navigation'

type SiteFooterProps = {
  // Optional. Latest update date shown on the footer (top page only).
  updateDate?: string
}

/**
 * Shared site footer.
 *
 * Per design-doc review B-1, secondary links (tag dictionary, change log,
 * official PDF page) live in the footer so the global nav can stay focused
 * on the four primary tools.
 */
export default function SiteFooter({ updateDate }: SiteFooterProps) {
  return (
    <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-5 text-sm sm:text-base">
        <nav aria-label="サブナビゲーション">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
            {footerSecondaryItems.map((item) => (
              <li key={item.href}>
                <a className="text-cream underline decoration-cream/40 underline-offset-4 hover:decoration-cream" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                className="text-yellow underline decoration-yellow/50 underline-offset-4 hover:decoration-yellow"
                href={officialPastExamUrl}
                target="_blank"
                rel="noopener"
              >
                文部科学省 過去問題ページ
              </a>
            </li>
          </ul>
        </nav>

        <div className="space-y-2">
          {updateDate && (
            <p><strong>更新日</strong> {updateDate}</p>
          )}
          <p>
            <strong>データの保存場所</strong>{' '}
            各ツールの入力・チェック状態は、お使いのブラウザ（端末側）に保存されます（LocalStorage）。サーバーには送信されません。ブラウザの履歴・キャッシュ・サイトデータを消去すると、保存内容も一緒に消えます。重要な情報は別途メモを取ることをおすすめします。
          </p>
          <p>
            <strong>データ範囲</strong>{' '}
            ユーザーが正当に取得し、端末内で選択した文部科学省公式過去問PDF。問題文・設問文の配布や再掲載は行いません。
          </p>
          <p>
            <strong>注意書き</strong>{' '}
            高認パスは文部科学省の公式サービスではありません。
          </p>
        </div>
      </div>
    </footer>
  )
}
