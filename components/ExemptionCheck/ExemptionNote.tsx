import {
  officialApplicationFlowUrl,
  officialCreditCertificateUrl,
  officialExamGuideUrl,
  officialExemptionRequirementsUrl,
} from '@/data/subjects'

export default function ExemptionNote() {
  return (
    <aside className="mt-4 border-2 border-ink/20 bg-cream p-3 sm:p-4" aria-label="免除確認に関する注意事項">
      <h3 className="text-sm font-bold">既取得単位で免除申請する流れ</h3>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
        <li>文部科学省の免除要件で、修得科目と単位数が免除条件を満たすか確認します。</li>
        <li>入学年度に合う文部科学省様式の単位修得証明書を選び、在籍していた学校等に作成を依頼します。</li>
        <li>提出用は発行元で厳封されたものを用意し、免除科目を自分で確認するための1通またはコピーも手元に残します。</li>
        <li>確認用の証明書を見ながら、この画面と願書の受験科目・免除科目を照合します。</li>
        <li>出願書類フローチャートで不足書類を確認し、厳封の証明書を必要書類と一緒に郵送します。</li>
      </ol>
      <p className="mt-3 text-sm leading-relaxed">
        全ての科目を免除にして合格者になることはできないため、最低1科目以上は受験して合格する必要があります。この結果は入力内容をもとにした整理資料です。確定判定は文部科学省の受験案内・免除要件で確認してください。
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <a href={officialExemptionRequirementsUrl} target="_blank" rel="noopener" className="font-bold">
          免除要件
        </a>
        <a href={officialCreditCertificateUrl} target="_blank" rel="noopener" className="font-bold">
          単位修得証明書様式
        </a>
        <a href={officialApplicationFlowUrl} target="_blank" rel="noopener" className="font-bold">
          出願書類フローチャート
        </a>
        <a href={officialExamGuideUrl} target="_blank" rel="noopener" className="font-bold">
          文部科学省公式ページ
        </a>
      </div>
    </aside>
  )
}
