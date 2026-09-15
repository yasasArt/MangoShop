'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const inputClass =
  'w-full rounded-2xl border border-bark-200 bg-white px-4 py-3 text-sm text-bark-900 placeholder:text-bark-400 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200'

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setSubmitting(true)

    const data = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setFormError(payload.error ?? 'Could not sign you in.')
        setFieldErrors(payload.fields ?? {})
        return
      }

      router.replace(next || (payload.user.role === 'ADMIN' ? '/admin' : '/'))
      router.refresh()
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-bark-800">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
        {fieldErrors.email && (
          <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.email}</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-bark-800">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
        {fieldErrors.password && (
          <span className="mt-1 block text-xs font-medium text-rose-600">
            {fieldErrors.password}
          </span>
        )}
      </label>

      {formError && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-bark-900 px-6 py-3.5 text-sm font-semibold text-mango-50 transition hover:bg-mango-600 disabled:cursor-not-allowed disabled:bg-bark-300"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="rounded-2xl bg-mango-50 p-4 text-xs leading-relaxed text-bark-600">
        <p className="font-semibold text-bark-800">Demo accounts</p>
        <p className="mt-1">
          Admin — <code className="font-mono">admin@mangoshop.lk</code> /{' '}
          <code className="font-mono">Admin@123</code>
        </p>
        <p>
          Customer — <code className="font-mono">customer@mangoshop.lk</code> /{' '}
          <code className="font-mono">Customer@123</code>
        </p>
      </div>
    </form>
  )
}
