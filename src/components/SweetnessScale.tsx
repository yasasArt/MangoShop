export function SweetnessScale({ value, className = '' }: { value: number; className?: string }) {
  const label = ['Sharp & sour', 'Tangy', 'Balanced', 'Sweet', 'Honey sweet'][
    Math.min(Math.max(value, 1), 5) - 1
  ]

  return (
    <div className={`flex items-center gap-2 ${className}`} title={`Sweetness: ${label}`}>
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={`h-1.5 w-5 rounded-full ${step <= value ? 'bg-mango-500' : 'bg-bark-200'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-bark-500">{label}</span>
    </div>
  )
}
