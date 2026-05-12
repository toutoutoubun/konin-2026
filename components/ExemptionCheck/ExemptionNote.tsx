import {
  officialApplicationFlowUrl,
  officialCreditCertificateUrl,
  officialExamGuideUrl,
  officialExemptionRequirementsUrl,
  officialSkillExemptionUrl,
} from '@/data/subjects'

export default function ExemptionNote() {
  return (
    <aside className="mt-4 border-2 border-ink/20 bg-cream p-3 sm:p-4" aria-label="免除確認に関する注意事項">
      <h3 className="text-sm font-bold">免除申請チェックリスト</h3>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
        <li>単位で申請する場合は、文部科学省の免除要件で修得科目と単位数を確認します。</li>
        <li>入学年度に合う文部科学省様式の単位修得証明書を選び、在籍していた学校等に作成を依頼します。</li>
        <li>技能審査で申請する場合は、公式一覧で対象の試験・級が科目免除に相当するか確認します。</li>
        <li>英語は英検準2級以上（準2級プラスを含む）、全商英検2級以上、国連英検C級以上のいずれかを確認します。</li>
        <li>歴史は歴検の世界史3級以上と日本史3級以上の両方、数学は数検2級以上、情報はITパスポート試験の合格を確認します。</li>
        <li>確認用の証明書類を見ながら、この画面と願書の受験科目・免除科目を照合します。</li>
        <li>出願書類フローチャートで不足書類を確認し、単位修得証明書または技能審査の証明書類を必要書類と一緒に郵送します。</li>
      </ol>
      <p className="mt-3 text-sm leading-relaxed">
        全ての科目を免除にして合格者になることはできないため、最低1科目以上は受験して合格する必要があります。この結果は入力内容をもとにした整理資料です。確定判定と提出書類の種類は、文部科学省の受験案内・免除要件・技能審査一覧で確認してください。
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <a href={officialExemptionRequirementsUrl} target="_blank" rel="noopener" className="font-bold">
          免除要件
        </a>
        <a href={officialCreditCertificateUrl} target="_blank" rel="noopener" className="font-bold">
          単位修得証明書様式
        </a>
        <a href={officialSkillExemptionUrl} target="_blank" rel="noopener" className="font-bold">
          技能審査一覧
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
