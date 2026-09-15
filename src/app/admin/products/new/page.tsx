import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'New product' }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-bark-500 hover:underline">
        ← Products
      </Link>
      <h1 className="mt-2 font-display text-3xl text-bark-900">New product</h1>
      <p className="mt-1 text-bark-600">Add a variety to the catalogue.</p>

      <ProductForm categories={categories} />
    </>
  )
}
