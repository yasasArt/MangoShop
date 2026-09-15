'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const options = ['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED', 'CANCELLED'] as const

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [value, setValue] = useState(status)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function change(next: string) {
    const previous = value
    setValue(next)
    setBusy(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(body.error ?? 'Could not update.')
        setValue(previous)
        return
      }
      router.refresh()
    } catch {
      setError('Could not reach the server.')
      setValue(previous)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col">
      <select
        value={value}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
        aria-label="Order status"
        className="rounded-full border border-bark-200 bg-white px-3 py-1.5 text-xs font-semibold text-bark-800 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200 disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-xs text-rose-600">{error}</span>}
    </span>
  )
}
