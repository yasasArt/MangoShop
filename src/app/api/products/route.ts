import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { error, guard, isGuardFailure, json } from '@/lib/api'
import { productSchema, fieldErrors } from '@/lib/validators'
import { slugify } from '@/lib/format'

/** GET /api/products?q=&category=&sort=&featured=1 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')?.trim()
  const sort = searchParams.get('sort') ?? 'newest'
  const featured = searchParams.get('featured') === '1'

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(featured ? { featured: true } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { origin: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc'
      ? { price: 'asc' }
      : sort === 'price-desc'
        ? { price: 'desc' }
        : sort === 'name'
          ? { name: 'asc' }
          : { createdAt: 'desc' }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: { select: { name: true, slug: true } } },
  })

  return json({ products })
}

/** POST /api/products — admin only */
export async function POST(request: Request) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const body = await request.json().catch(() => null)
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return error('Please check the form.', 422, fieldErrors(parsed.error))

  const data = parsed.data
  let slug = slugify(data.name)

  // Slugs are unique; add a suffix rather than failing the save.
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      comparePrice: data.comparePrice ? new Prisma.Decimal(data.comparePrice) : null,
      unit: data.unit,
      stock: data.stock,
      imageUrl: data.imageUrl,
      origin: data.origin || null,
      sweetness: data.sweetness,
      featured: data.featured ?? false,
      active: data.active ?? true,
      categoryId: data.categoryId,
    },
  })

  return json({ product }, 201)
}
