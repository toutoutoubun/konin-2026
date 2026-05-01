export default function SkeletonLoader({ label = '解析しています' }: { label?: string }) {
  return (
    <div className="panel min-h-[180px] p-6" role="status" aria-live="polite" aria-label={label}>
      <div className="skeleton mb-4 h-7 w-2/5 rounded" />
      <div className="skeleton mb-3 h-4 w-full rounded" />
      <div className="skeleton mb-3 h-4 w-5/6 rounded" />
      <div className="skeleton h-20 w-full rounded" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
