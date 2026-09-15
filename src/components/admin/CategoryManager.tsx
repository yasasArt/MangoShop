'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { DeleteButton } from './DeleteButton'

type Category = {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  productCount: number
}

const inputClass =
  'w-full rounded-2xl border border-bark-200 bg-white px-4 py-2.5 text-sm text-bark-900 placeholder:text-bark-400 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200'

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(event: React.FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setError(null)

    try {
      const response = await fetch(id ? `/api/categories/${id}` : '/api/categories', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          description: data.get('description'),
          imageUrl: data.get('imageUrl'),
        }),
      })
      const body = await response.json()

      if (!response.ok) {
        setError(body.error ?? 'Could not save the category.')
        return
      }

      if (!id) form.reset()
      setEditingId(null)
      router.refresh()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100">
        <ul className="divide-y divide-bark-100">
          {categories.map((category) => (
            <li key={category.id} className="p-5">
              {editingId === category.id ? (
                <form onSubmit={(event) => save(event, category.id)} className="space-y-3">
                  <input name="name" defaultValue={category.name} required className={inputClass} />
                  <textarea
                    name="description"
                    defaultValue={category.description}
                    rows={2}
                    required
                    className={inputClass}
                  />
                  <input
                    name="imageUrl"
                    defaultValue={category.imageUrl}
                    required
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-full bg-bark-900 px-5 py-2 text-xs font-semibold text-mango-50 disabled:bg-bark-300"
                    >
                      {busy ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-bark-700 ring-1 ring-bark-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-mango-50">
                    <ProductImage src={category.imageUrl} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg text-bark-900">{category.name}</h2>
                      <span className="rounded-full bg-mango-100 px-2.5 py-0.5 text-xs font-bold text-mango-700">
                        {category.productCount} products
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-bark-600">
                      {category.description}
                    </p>
                    <p className="mt-1 font-mono text-xs text-bark-400">/{category.slug}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(category.id)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-bark-700 ring-1 ring-bark-200 transition hover:ring-mango-400"
                    >
                      Edit
                    </button>
                    <DeleteButton endpoint={`/api/categories/${category.id}`} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <form
          onSubmit={(event) => save(event)}
          className="space-y-3 rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100"
        >
          <h2 className="font-display text-lg text-bark-900">Add a category</h2>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-bark-800">Name</span>
            <input name="name" required placeholder="Organic" className={inputClass} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-bark-800">Description</span>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="What makes this range different?"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-bark-800">Image</span>
            <input
              name="imageUrl"
              required
              defaultValue="/mangoes/placeholder.svg"
              className={inputClass}
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-bark-900 px-6 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600 disabled:bg-bark-300"
          >
            {busy ? 'Saving…' : 'Create category'}
          </button>

          <p className="text-xs leading-relaxed text-bark-500">
            A category can only be deleted once no products point at it.
          </p>
        </form>
      </aside>
    </div>
  )
}
