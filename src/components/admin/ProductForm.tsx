'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'

export type ProductFormValues = {
  id?: string
  name: string
  description: string
  price: number | string
  comparePrice: number | string | null
  unit: string
  stock: number | string
  imageUrl: string
  origin: string | null
  sweetness: number
  featured: boolean
  active: boolean
  categoryId: string
}

const inputClass =
  'w-full rounded-2xl border border-bark-200 bg-white px-4 py-2.5 text-sm text-bark-900 placeholder:text-bark-400 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200'

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[]
  initial?: ProductFormValues
}) {
  const router = useRouter()
  const editing = Boolean(initial?.id)

  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      unit: 'kg',
      stock: 0,
      imageUrl: '/mangoes/placeholder.svg',
      origin: '',
      sweetness: 4,
      featured: false,
      active: true,
      categoryId: categories[0]?.id ?? '',
    },
  )

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setSaving(true)

    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      comparePrice:
        values.comparePrice === '' || values.comparePrice === null
          ? null
          : Number(values.comparePrice),
      origin: values.origin || null,
    }

    try {
      const response = await fetch(
        editing ? `/api/products/${initial!.id}` : '/api/products',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const body = await response.json()

      if (!response.ok) {
        setFormError(body.error ?? 'Could not save the product.')
        setFieldErrors(body.fields ?? {})
        return
      }

      router.push('/admin/products')
      router.refresh()
    } catch {
      setFormError('Could not reach the server. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
        <Field label="Product name" error={fieldErrors.name}>
          <input
            value={values.name}
            onChange={(event) => set('name', event.target.value)}
            required
            placeholder="Karutha Colomban"
            className={inputClass}
          />
        </Field>

        <Field label="Description" error={fieldErrors.description}>
          <textarea
            value={values.description}
            onChange={(event) => set('description', event.target.value)}
            rows={4}
            required
            placeholder="What does it taste like, and who is it for?"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (Rs)" error={fieldErrors.price}>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(event) => set('price', event.target.value)}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Compare-at price" error={fieldErrors.comparePrice}>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.comparePrice ?? ''}
              onChange={(event) => set('comparePrice', event.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </Field>

          <Field label="Sold by" error={fieldErrors.unit}>
            <select
              value={values.unit}
              onChange={(event) => set('unit', event.target.value)}
              className={inputClass}
            >
              {['kg', 'piece', 'pack', 'box', 'crate'].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Stock" error={fieldErrors.stock}>
            <input
              type="number"
              min={0}
              value={values.stock}
              onChange={(event) => set('stock', event.target.value)}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Origin" error={fieldErrors.origin}>
            <input
              value={values.origin ?? ''}
              onChange={(event) => set('origin', event.target.value)}
              placeholder="Jaffna"
              className={inputClass}
            />
          </Field>

          <Field label="Category" error={fieldErrors.categoryId}>
            <select
              value={values.categoryId}
              onChange={(event) => set('categoryId', event.target.value)}
              required
              className={inputClass}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={`Sweetness — ${values.sweetness} of 5`} error={fieldErrors.sweetness}>
          <input
            type="range"
            min={1}
            max={5}
            value={values.sweetness}
            onChange={(event) => set('sweetness', Number(event.target.value))}
            className="w-full accent-mango-500"
          />
        </Field>
      </div>

      <aside className="space-y-5">
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-lg text-bark-900">Image</h2>
          <div className="mt-3 aspect-4/3 overflow-hidden rounded-2xl bg-mango-50 ring-1 ring-bark-100">
            <ProductImage src={values.imageUrl} alt="Preview" />
          </div>
          <div className="mt-3">
            <Field label="Image URL or path" error={fieldErrors.imageUrl}>
              <input
                value={values.imageUrl}
                onChange={(event) => set('imageUrl', event.target.value)}
                required
                placeholder="/mangoes/karutha-colomban.svg"
                className={inputClass}
              />
            </Field>
            <p className="mt-2 text-xs leading-relaxed text-bark-500">
              Paste any image URL, or use one of the bundled illustrations in{' '}
              <code className="font-mono">/mangoes/</code>. Drop your own photos into{' '}
              <code className="font-mono">public/mangoes/</code> and reference them the same way.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-lg text-bark-900">Visibility</h2>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => set('active', event.target.checked)}
              className="mt-1 h-4 w-4 accent-mango-600"
            />
            <span>
              <span className="block text-sm font-semibold text-bark-900">Visible in the shop</span>
              <span className="block text-xs text-bark-500">
                Uncheck to hide without deleting.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => set('featured', event.target.checked)}
              className="mt-1 h-4 w-4 accent-mango-600"
            />
            <span>
              <span className="block text-sm font-semibold text-bark-900">Pick of the week</span>
              <span className="block text-xs text-bark-500">Shows on the home page.</span>
            </span>
          </label>
        </div>

        {formError && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {formError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-bark-900 px-6 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600 disabled:bg-bark-300"
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-bark-700 ring-1 ring-bark-200 transition hover:ring-bark-400"
          >
            Cancel
          </button>
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
