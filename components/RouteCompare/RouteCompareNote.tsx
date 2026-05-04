export default function RouteCompareNote() {
  return (
    <aside className="mt-4 border-2 border-ink/20 bg-cream p-3 sm:p-4" aria-label="ルート比較に関する注意事項">
      <p className="text-sm leading-relaxed">
        この表は公開情報をもとに作成した整理資料です。学校の状況・各自の単位取得状況・地域によって異なる場合があります。詳細は在籍校・各通信制高校・
        <a
          href="https://www.mext.go.jp/a_menu/koutou/shiken/index.htm"
          target="_blank"
          rel="noopener"
          className="font-bold"
        >
          文部科学省の公式情報
        </a>
        を確認してください。
      </p>
    </aside>
  )
}
