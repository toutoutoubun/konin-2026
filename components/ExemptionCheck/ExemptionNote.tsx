export default function ExemptionNote() {
  return (
    <aside className="mt-4 border-2 border-ink/20 bg-cream p-3 sm:p-4" aria-label="免除確認に関する注意事項">
      <p className="text-sm leading-relaxed">
        この結果は入力内容をもとにした整理資料です。免除の確定判定は文部科学省または都道府県教育委員会への確認が必要です。詳細は
        <a
          href="https://www.mext.go.jp/a_menu/koutou/shiken/index.htm"
          target="_blank"
          rel="noopener"
          className="font-bold"
        >
          文部科学省の公式ページ
        </a>
        を参照してください。
      </p>
    </aside>
  )
}
