import { prisma } from '@/lib/prisma'
import { error, guard, isGuardFailure, json } from '@/lib/api'
import { categorySchema, fieldErrors } from '@/lib/validators'
import { slugify } from '@/lib/format'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return json({ categories })
}

/** POST /api/categories — admin only */
export async function POST(request: Request) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const body = await request.json().catch(() => null)
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) return error('Please check the form.', 422, fieldErrors(parsed.error))

  const slug = slugify(parsed.data.name)
  const clash = await prisma.category.findFirst({
    where: { OR: [{ slug }, { name: parsed.data.name }] },
  })
  if (clash) {
    return error('A category with that name already exists.', 409, {
      name: 'A category with that name already exists.',
    })
  }

  const category = await prisma.category.create({ data: { ...parsed.data, slug } })
  return json({ category }, 201)
}
