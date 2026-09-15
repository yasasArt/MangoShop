import { prisma } from '@/lib/prisma'
import { error, guard, isGuardFailure, json } from '@/lib/api'
import { categorySchema, fieldErrors } from '@/lib/validators'
import { slugify } from '@/lib/format'

type Context = { params: Promise<{ id: string }> }

/** PATCH /api/categories/:id — admin only */
export async function PATCH(request: Request, { params }: Context) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const { id } = await params
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return error('Category not found.', 404)

  const body = await request.json().catch(() => null)
  const parsed = categorySchema.partial().safeParse(body)
  if (!parsed.success) return error('Please check the form.', 422, fieldErrors(parsed.error))

  const data = { ...parsed.data } as Record<string, unknown>
  if (parsed.data.name && parsed.data.name !== existing.name) {
    const slug = slugify(parsed.data.name)
    const clash = await prisma.category.findUnique({ where: { slug } })
    if (clash && clash.id !== id) {
      return error('A category with that name already exists.', 409, {
        name: 'A category with that name already exists.',
      })
    }
    data.slug = slug
  }

  const category = await prisma.category.update({ where: { id }, data })
  return json({ category })
}

/** DELETE /api/categories/:id — admin only. Refuses while products still use it. */
export async function DELETE(_request: Request, { params }: Context) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const { id } = await params
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })
  if (!existing) return error('Category not found.', 404)

  if (existing._count.products > 0) {
    return error(
      `Move or delete the ${existing._count.products} product(s) in this category first.`,
      409,
    )
  }

  await prisma.category.delete({ where: { id } })
  return json({ deleted: true })
}
