const styles: Record<string, string> = {
  PENDING: 'bg-mango-100 text-mango-800 ring-mango-200',
  CONFIRMED: 'bg-sky-100 text-sky-800 ring-sky-200',
  PACKED: 'bg-violet-100 text-violet-800 ring-violet-200',
  DELIVERED: 'bg-leaf-100 text-leaf-700 ring-leaf-200',
  CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-200',
}

const labels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? 'bg-bark-100 text-bark-700 ring-bark-200'
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}
