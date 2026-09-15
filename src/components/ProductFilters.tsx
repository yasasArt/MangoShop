'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type CategoryOption = { id: string; name: string; slug: string; count: number }

export function ProductFilters({
  categories,
  activeCategory,
  sort,
}: {
  categories: CategoryOption[]
  activeCategory?: string
  sort: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function hrefWith(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    return query ? `/products?${query}` : '/products'
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Link
          href={hrefWith({ category: null })}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            !activeCategory
              ? 'bg-bark-900 text-mango-50'
              : 'bg-white text-bark-600 ring-1 ring-bark-200 hover:ring-mango-300'
          }`}
        >
          All mangoes
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={hrefWith({ category: category.slug })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category.slug
                ? 'bg-bark-900 text-mango-50'
                : 'bg-white text-bark-600 ring-1 ring-bark-200 hover:ring-mango-300'
            }`}
          >
            {category.name}
            <span className="ml-1.5 text-xs opacity-60">{category.count}</span>
          </Link>
        ))}
      </div>

      <label className="flex shrink-0 items-center gap-2 text-sm text-bark-600">
        Sort
        <select
          value={sort}
          onChange={(event) => router.push(hrefWith({ sort: event.target.value }))}
          className="rounded-full border border-bark-200 bg-white px-4 py-2 text-sm font-semibold text-bark-800 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
    </div>
  )
}
