import { prisma } from '@/lib/prisma'
import { CategoryManager } from '@/components/admin/CategoryManager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Categories' }

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-bark-900">Categories</h1>
        <p className="mt-1 text-bark-600">
          How the shop is organised. Customers browse these on the home page.
        </p>
      </header>

      <CategoryManager
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          productCount: category._count.products,
        }))}
      />
    </>
  )
}
