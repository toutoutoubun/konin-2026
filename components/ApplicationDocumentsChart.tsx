import {
  officialApplicationFlowUrl,
  officialExemptionRequirementsUrl,
  officialSpecialAccommodationUrl,
} from '@/data/subjects'

const documentBranches = [
  {
    step: '全員',
    title: '通常の出願書類',
    body: '願書、写真、本人確認・住所確認、検定料など、受験案内と出願書類フローチャートで指定される基本書類を揃えます。',
    href: officialApplicationFlowUrl,
    linkLabel: '出願書類フローチャート',
  },
  {
    step: '免除あり',
    title: '免除申請の証明書類',
    body: '受験科目を免除申請する場合は、単位修得証明書または技能審査の証明書類を、通常の出願書類と一緒に提出します。',
    href: officialExemptionRequirementsUrl,
    linkLabel: '免除要件',
  },
  {
    step: '特別措置希望',
    title: '受験上の特別措置申請書類',
    body: '身体上の障害等により受験上の特別措置を希望する場合は、通常の出願書類に加えて、特別措置申請書と医師の診断・意見書等を提出します。',
    href: officialSpecialAccommodationUrl,
    linkLabel: '特別措置',
  },
]

const specialNotes = [
  '診断・意見書は、提出時点で発行から半年以内のものを用意します。',
  '聴覚障害で申請する場合は、任意様式の診断・意見書にオージオグラム等を添付します。',
  '杖、拡大鏡、無地のハンカチ・タオル、試験室入口までの付添者の同伴のみを希望する場合は、診断書の提出は不要とされています。',
  '前年度の特別措置内容決定通知書を診断書の代わりに使う場合も、特別措置申請書は必要です。通知書の範囲外の追加措置を希望する場合は、現在の症状についての診断書を用意します。',
  '出願期間後の特別措置申請は、不慮の傷病を除き受け付けられません。',
]

export default function ApplicationDocumentsChart() {
  return (
    <section className="panel mb-8 p-5 sm:p-6 md:p-8" aria-labelledby="documents-chart-title">
      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">DOCUMENT FLOW</p>
          <h2 id="documents-chart-title" className="mt-2 font-mincho text-3xl font-bold leading-tight sm:text-4xl">
            出願書類チャート
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            まず全員に必要な通常書類を確認し、免除申請や受験上の特別措置を希望する場合だけ追加書類を足します。
          </p>
        </div>

        <div className="grid gap-3">
          {documentBranches.map((branch) => (
            <article key={branch.step} className="border-2 border-ink bg-cream p-4">
              <div className="flex flex-wrap items-start gap-3">
                <span className="border-2 border-ink bg-paper px-2 py-1 text-xs font-bold">{branch.step}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-mincho text-xl font-bold">{branch.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{branch.body}</p>
                  <a href={branch.href} target="_blank" rel="noopener" className="mt-3 inline-flex text-sm font-bold">
                    {branch.linkLabel}を確認する
                  </a>
                </div>
              </div>
            </article>
          ))}

          <div className="border-2 border-ink bg-paper p-4">
            <h3 className="font-mincho text-xl font-bold">特別措置を希望する場合の確認点</h3>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed">
              {specialNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
