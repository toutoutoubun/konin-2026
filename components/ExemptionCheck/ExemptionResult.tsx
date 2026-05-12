'use client'

import {
  type ExemptionInput,
  type ExemptionStatus,
  exemptionSubjects,
  evaluateExemption,
  formatRequirementGroup,
  getCreditRequirementGroups,
} from '@/data/exemptions'

type Props = {
  input: ExemptionInput
}

const statusConfig: Record<ExemptionStatus, { label: string; bgClass: string; borderClass: string; icon: string; badgeBg: string }> = {
  possible: {
    label: '免除できる可能性がある科目',
    bgClass: 'bg-blue/8',
    borderClass: 'border-blue/30',
    icon: '○',
    badgeBg: 'bg-blue text-white',
  },
  needed: {
    label: '受験が必要な可能性がある科目',
    bgClass: 'bg-orange/8',
    borderClass: 'border-orange/30',
    icon: '△',
    badgeBg: 'bg-orange',
  },
  unknown: {
    label: '確認が必要な科目',
    bgClass: 'bg-yellow/15',
    borderClass: 'border-yellow/50',
    icon: '？',
    badgeBg: 'bg-yellow',
  },
}

export default function ExemptionResult({ input }: Props) {
  const results = exemptionSubjects.map((subject) => ({
    subject,
    status: evaluateExemption(subject, input),
  }))

  const grouped: Record<ExemptionStatus, typeof results> = {
    possible: results.filter((r) => r.status === 'possible'),
    needed: results.filter((r) => r.status === 'needed'),
    unknown: results.filter((r) => r.status === 'unknown'),
  }

  const order: ExemptionStatus[] = ['possible', 'needed', 'unknown']

  return (
    <div className="space-y-3" aria-live="polite" aria-atomic="true">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-2 border-2 border-ink bg-cream p-2.5 text-xs">
        {order.map((status) => {
          const config = statusConfig[status]
          return (
            <span key={status} className="flex items-center gap-1">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center border border-ink text-xs font-bold ${config.badgeBg}`}
                aria-hidden="true"
              >
                {config.icon}
              </span>
              <span className="font-bold">{grouped[status].length}</span>
              <span className="text-ink/60">科目</span>
            </span>
          )
        })}
      </div>

      {/* Grouped results */}
      {order.map((status) => {
        const items = grouped[status]
        if (items.length === 0) return null
        const config = statusConfig[status]

        return (
          <div key={status}>
            <h4 className="flex items-center gap-1.5 text-sm font-bold">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center border border-ink text-xs font-bold ${config.badgeBg}`}
                aria-hidden="true"
              >
                {config.icon}
              </span>
              {config.label}
            </h4>
            <ul className="mt-1.5 space-y-1" role="list">
              {items.map(({ subject }) => {
                const requirementGroups = input.admissionPeriod
                  ? getCreditRequirementGroups(input.admissionPeriod, subject.slug)
                  : []

                return (
                  <li
                    key={subject.slug}
                    className={`border ${config.borderClass} ${config.bgClass} p-2`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-bold">{subject.name}</span>
                      <span className="border border-ink/20 bg-paper px-1.5 py-0.5 text-xs">
                        {subject.categoryLabel}
                      </span>
                    </div>
                    {subject.exemptionConditions.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {subject.exemptionConditions.map((cond, i) => (
                          <li key={i} className="text-xs leading-relaxed pl-2.5 relative before:absolute before:left-0 before:content-['・']">
                            {cond}
                          </li>
                        ))}
                      </ul>
                    )}
                    {requirementGroups.length > 0 && (
                      <div className="mt-2 border border-ink/15 bg-paper p-2">
                        <p className="text-xs font-bold">選択した入学時期の単位要件</p>
                        <ul className="mt-1 space-y-0.5">
                          {requirementGroups.map((group) => (
                            <li key={`${group.subjectSlug}-${group.label}`} className="text-xs leading-relaxed pl-2.5 relative before:absolute before:left-0 before:content-['・']">
                              {formatRequirementGroup(group)}
                              {group.note ? ` / ${group.note}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
