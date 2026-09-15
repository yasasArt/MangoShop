'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/ProductImage'
import { formatPrice } from '@/lib/format'

const cities = [
  'Colombo',
  'Dehiwala',
  'Moratuwa',
  'Negombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Matara',
  'Kurunegala',
  'Jaffna',
  'Anuradhapura',
  'Batticaloa',
  'Other',
]

export function CheckoutForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string
  defaultPhone: string
}) {
  const router = useRouter()
  const { items, subtotal, delivery, total, clear, ready } = useCart()

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    if (items.length === 0) {
      setFormError('Your cart is empty.')
      return
    }

    const data = new FormData(event.currentTarget)
    setSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.get('fullName'),
          phone: data.get('phone'),
          address: data.get('address'),
          city: data.get('city'),
          note: data.get('note'),
          items: items.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setFormError(payload.error ?? 'Something went wrong. Please try again.')
        setFieldErrors(payload.fields ?? {})
        return
      }

      clear()
      router.push(`/orders/${payload.order.code}?placed=1`)
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-card ring-1 ring-bark-100">
        <p className="text-4xl">🧺</p>
        <h2 className="mt-4 font-display text-xl text-bark-900">There is nothing to check out</h2>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-bark-900 px-6 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
        >
          Browse mangoes
        </Link>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-2xl border border-bark-200 bg-white px-4 py-3 text-sm text-bark-900 placeholder:text-bark-400 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200'

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-xl text-bark-900">Delivery details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={fieldErrors.fullName}>
              <input name="fullName" defaultValue={defaultName} required className={inputClass} />
            </Field>

            <Field label="Contact number" error={fieldErrors.phone}>
              <input
                name="phone"
                type="tel"
                defaultValue={defaultPhone}
                placeholder="07X XXX XXXX"
                required
                className={inputClass}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Delivery address" error={fieldErrors.address}>
                <textarea
                  name="address"
                  rows={3}
                  required
                  placeholder="House number, street, landmark"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="City" error={fieldErrors.city}>
              <select name="city" required defaultValue="Colombo" className={inputClass}>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Note for the packing team (optional)" error={fieldErrors.note}>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="e.g. slightly under-ripe please, or leave with the security desk"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-xl text-bark-900">Payment</h2>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-mango-300 bg-mango-50 p-4">
              <input type="radio" name="payment" defaultChecked className="mt-1 accent-mango-600" />
              <span>
                <span className="block text-sm font-semibold text-bark-900">Cash on delivery</span>
                <span className="block text-sm text-bark-600">
                  Pay the driver when the box arrives. Available island-wide.
                </span>
              </span>
            </label>
            <label className="flex cursor-not-allowed items-start gap-3 rounded-2xl border border-bark-200 p-4 opacity-60">
              <input type="radio" name="payment" disabled className="mt-1" />
              <span>
                <span className="block text-sm font-semibold text-bark-900">Card payment</span>
                <span className="block text-sm text-bark-600">
                  Coming soon — connect a payment gateway to enable this.
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-xl text-bark-900">Your order</h2>

          <ul className="mt-5 space-y-3">
            {items.map((line) => (
              <li key={line.productId} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mango-50">
                  <ProductImage src={line.imageUrl} alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-bark-900">{line.name}</p>
                  <p className="text-xs text-bark-500">
                    {line.quantity} × {formatPrice(line.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-bark-900">
                  {formatPrice(line.price * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-bark-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-bark-600">Subtotal</dt>
              <dd className="font-semibold text-bark-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bark-600">Delivery</dt>
              <dd className="font-semibold text-bark-900">
                {delivery === 0 ? <span className="text-leaf-600">Free</span> : formatPrice(delivery)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-bark-100 pt-3">
              <dt className="font-display text-lg text-bark-900">Total</dt>
              <dd className="font-display text-lg text-bark-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          {formError && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-bark-900 px-6 py-3.5 text-sm font-semibold text-mango-50 transition hover:bg-mango-600 disabled:cursor-not-allowed disabled:bg-bark-300"
          >
            {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
          </button>

          <p className="mt-3 text-center text-xs text-bark-500">
            We call to confirm before dispatch. No payment is taken online.
          </p>
        </div>
      </aside>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-bark-800">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  )
}
