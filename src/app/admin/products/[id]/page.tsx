import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'
import { toNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Edit product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!product) notFound()

  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-bark-500 hover:underline">
        ← Products
      </Link>
      <h1 className="mt-2 font-display text-3xl text-bark-900">{product.name}</h1>
      <p className="mt-1 text-bark-600">
        Editing this updates it everywhere in the shop straight away.
      </p>

      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: toNumber(product.price),
          comparePrice: product.comparePrice ? toNumber(product.comparePrice) : '',
          unit: product.unit,
          stock: product.stock,
          imageUrl: product.imageUrl,
          origin: product.origin ?? '',
          sweetness: product.sweetness,
          featured: product.featured,
          active: product.active,
          categoryId: product.categoryId,
        }}
      />
    </>
  )
}
