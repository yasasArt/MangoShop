import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { error, guard, isGuardFailure, json } from '@/lib/api'
import { productSchema, fieldErrors } from '@/lib/validators'
import { slugify } from '@/lib/format'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!product) return error('Product not found.', 404)
  return json({ product })
}

/** PATCH /api/products/:id — admin only */
export async function PATCH(request: Request, { params }: Context) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const { id } = await params
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return error('Product not found.', 404)

  const body = await request.json().catch(() => null)
  const parsed = productSchema.partial().safeParse(body)
  if (!parsed.success) return error('Please check the form.', 422, fieldErrors(parsed.error))

  const data = parsed.data
  const update: Prisma.ProductUpdateInput = {}

  if (data.name !== undefined && data.name !== existing.name) {
    update.name = data.name
    let slug = slugify(data.name)
    const clash = await prisma.product.findUnique({ where: { slug } })
    if (clash && clash.id !== id) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
    update.slug = slug
  }
  if (data.description !== undefined) update.description = data.description
  if (data.price !== undefined) update.price = new Prisma.Decimal(data.price)
  if (data.comparePrice !== undefined) {
    update.comparePrice = data.comparePrice ? new Prisma.Decimal(data.comparePrice) : null
  }
  if (data.unit !== undefined) update.unit = data.unit
  if (data.stock !== undefined) update.stock = data.stock
  if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl
  if (data.origin !== undefined) update.origin = data.origin || null
  if (data.sweetness !== undefined) update.sweetness = data.sweetness
  if (data.featured !== undefined) update.featured = data.featured
  if (data.active !== undefined) update.active = data.active
  if (data.categoryId !== undefined) update.category = { connect: { id: data.categoryId } }

  const product = await prisma.product.update({ where: { id }, data: update })
  return json({ product })
}

/** DELETE /api/products/:id — admin only */
export async function DELETE(_request: Request, { params }: Context) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const { id } = await params
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  })
  if (!existing) return error('Product not found.', 404)

  // Products that appear in an order are archived, not deleted, so order
  // history keeps working.
  if (existing._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } })
    return json({ archived: true })
  }

  await prisma.product.delete({ where: { id } })
  return json({ deleted: true })
}
