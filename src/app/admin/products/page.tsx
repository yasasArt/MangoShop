import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductImage } from '@/components/ProductImage'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Products' }

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    include: { category: { select: { name: true } } },
  })

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-bark-900">Products</h1>
          <p className="mt-1 text-bark-600">{products.length} in the catalogue.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-bark-900 px-5 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
        >
          + New product
        </Link>
      </header>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search products…"
          className="w-full max-w-sm rounded-full border border-bark-200 bg-white px-5 py-2.5 text-sm focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100">
        {products.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-bark-500">
            No products match that search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-sm">
              <thead className="border-b border-bark-100 text-xs uppercase tracking-wider text-bark-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 text-right font-semibold">Price</th>
                  <th className="px-5 py-3 text-right font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bark-100">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-mango-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-mango-50">
                          <ProductImage src={product.imageUrl} alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-bark-900">{product.name}</p>
                          <p className="truncate text-xs text-bark-500">
                            {product.origin ?? 'Sri Lanka'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-bark-700">{product.category.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-bark-900">
                      {formatPrice(product.price)}
                      <span className="block text-xs font-normal text-bark-500">
                        per {product.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          product.stock === 0
                            ? 'text-rose-600'
                            : product.stock <= 20
                              ? 'text-mango-700'
                              : 'text-bark-900'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.active
                              ? 'bg-leaf-100 text-leaf-700'
                              : 'bg-bark-100 text-bark-500'
                          }`}
                        >
                          {product.active ? 'Live' : 'Hidden'}
                        </span>
                        {product.featured && (
                          <span className="rounded-full bg-mango-100 px-2.5 py-1 text-xs font-semibold text-mango-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-bark-700 ring-1 ring-bark-200 transition hover:ring-mango-400"
                        >
                          Edit
                        </Link>
                        <DeleteButton endpoint={`/api/products/${product.id}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-bark-500">
        Deleting a product that already appears in an order hides it instead, so order history stays
        intact.
      </p>
    </>
  )
}
