import { prisma } from '@/lib/prisma'
import { error, guard, isGuardFailure, json } from '@/lib/api'
import { orderStatusSchema, fieldErrors } from '@/lib/validators'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  const result = await guard()
  if (isGuardFailure(result)) return result.response
  const { session } = result

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  })

  if (!order) return error('Order not found.', 404)
  if (session.role !== 'ADMIN' && order.userId !== session.userId) {
    return error('Order not found.', 404)
  }

  return json({ order })
}

/** PATCH /api/orders/:id — admin changes the order status. */
export async function PATCH(request: Request, { params }: Context) {
  const result = await guard('ADMIN')
  if (isGuardFailure(result)) return result.response

  const { id } = await params
  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!existing) return error('Order not found.', 404)

  const body = await request.json().catch(() => null)
  const parsed = orderStatusSchema.safeParse(body)
  if (!parsed.success) return error('Unknown status.', 422, fieldErrors(parsed.error))

  const nextStatus = parsed.data.status

  const order = await prisma.$transaction(async (tx) => {
    // Cancelling an order that was not already cancelled puts the stock back.
    if (nextStatus === 'CANCELLED' && existing.status !== 'CANCELLED') {
      for (const item of existing.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }

    // Un-cancelling takes it back out again.
    if (existing.status === 'CANCELLED' && nextStatus !== 'CANCELLED') {
      for (const item of existing.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }
    }

    return tx.order.update({ where: { id }, data: { status: nextStatus } })
  })

  return json({ order })
}
