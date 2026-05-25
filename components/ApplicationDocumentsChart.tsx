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

// Special-accommodation notes are grouped by question so that each card
// answers one concrete decision the applicant has to make. This replaces
// the previous 5-item flat bullet list which was hard to skim.
type SpecialNoteGroup = {
  heading: string
  body: string
  bullets?: string[]
}

const specialNoteGroups: SpecialNoteGroup[] = [
  {
    heading: '基本：何を出すか',
    body: '通常の出願書類に加えて、次の2点を同封します。',
    bullets: [
      '特別措置申請書（文部科学省の様式）',
      '医師の診断・意見書等',
    ],
  },
  {
    heading: '診断・意見書の条件',
    body: '提出時点で発行から半年以内のものを用意します。聴覚障害で申請する場合は、任意様式の診断・意見書にオージオグラム等を添付します。',
  },
  {
    heading: '診断書が不要になる場合',
    body: '杖、拡大鏡、無地のハンカチ・タオル、試験室入口までの付添者の同伴 — このいずれかの措置だけを希望する場合は、診断書の提出は不要とされています。',
  },
  {
    heading: '前年度の決定通知書を使う場合',
    body: '前年度の特別措置内容決定通知書を診断書の代わりに使う場合も、特別措置申請書は必要です。通知書の範囲外の追加措置を希望する場合は、現在の症状についての診断書を用意します。',
  },
  {
    heading: '期限の注意',
    body: '出願期間後の特別措置申請は、不慮の傷病を除き受け付けられません。出願期間内に書類を揃えて郵送します。',
  },
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
        </div>
      </div>

      {/* Special accommodation details — split into a separate, full-width
          subsection so each question becomes its own card and is easier
          to scan than the previous 5-item flat bullet list. */}
      <div className="mt-6 border-t-2 border-ink pt-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-serifDisplay text-sm uppercase tracking-[.18em]">SPECIAL ACCOMMODATION</p>
          <h3 id="special-accommodation-title" className="font-mincho text-2xl font-bold sm:text-3xl">
            特別措置を希望する場合の確認点
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          身体上の障害等により受験上の特別措置を希望する場合に追加で確認することを、決めごと単位で並べています。
        </p>

        <div
          className="mt-4 grid gap-3 sm:grid-cols-2"
          role="list"
          aria-labelledby="special-accommodation-title"
        >
          {specialNoteGroups.map((group, idx) => (
            <article
              key={group.heading}
              role="listitem"
              className="border-2 border-ink bg-paper p-4"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-serifDisplay text-xs tabular-nums text-ink/50">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h4 className="font-mincho text-base font-bold sm:text-lg">{group.heading}</h4>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{group.body}</p>
              {group.bullets && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed">
                  {group.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <p className="mt-4">
          <a
            href={officialSpecialAccommodationUrl}
            target="_blank"
            rel="noopener"
            className="hard-button button-like inline-flex bg-orange px-4 py-2 no-underline"
          >
            文部科学省 特別措置ページ
          </a>
        </p>
      </div>
    </section>
  )
}
