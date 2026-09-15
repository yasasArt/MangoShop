'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Two-step delete — the first click arms it, the second confirms. Avoids
 * window.confirm, which is easy to mis-click and impossible to style.
 */
export function DeleteButton({
  endpoint,
  label = 'Delete',
  confirmLabel = 'Really delete?',
}: {
  endpoint: string
  label?: string
  confirmLabel?: string
}) {
  const router = useRouter()
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onDelete() {
    if (!armed) {
      setArmed(true)
      setTimeout(() => setArmed(false), 4000)
      return
    }

    setBusy(true)
    setError(null)

    try {
      const response = await fetch(endpoint, { method: 'DELETE' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(body.error ?? 'Could not delete.')
        return
      }
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
      setArmed(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          armed
            ? 'bg-rose-600 text-white'
            : 'bg-white text-rose-600 ring-1 ring-rose-200 hover:ring-rose-400'
        } disabled:opacity-50`}
      >
        {busy ? 'Deleting…' : armed ? confirmLabel : label}
      </button>
      {error && <span className="mt-1 max-w-48 text-right text-xs text-rose-600">{error}</span>}
    </span>
  )
}
