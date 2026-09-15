import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { error, guard, isGuardFailure, json } from '@/lib/api'
import { orderSchema, fieldErrors } from '@/lib/validators'
import { deliveryFeeFor, generateOrderCode, toNumber } from '@/lib/format'

/** GET /api/orders — your own orders, or every order if you are an admin. */
export async function GET() {
  const result = await guard()
  if (isGuardFailure(result)) return result.response
  const { session } = result

  const orders = await prisma.order.findMany({
    where: session.role === 'ADMIN' ? {} : { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  })

  return json({ orders })
}

/** POST /api/orders — place an order from the cart. */
export async function POST(request: Request) {
  const result = await guard()
  if (isGuardFailure(result)) return result.response
  const { session } = result

  const body = await request.json().catch(() => null)
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) return error('Please check the form.', 422, fieldErrors(parsed.error))

  const { items, ...delivery } = parsed.data

  // Prices and stock always come from the database — never from the browser.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, active: true },
  })

  if (products.length !== items.length) {
    return error('Some items are no longer available. Please review your cart.', 409)
  }

  const outOfStock = items.filter((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return !product || product.stock < item.quantity
  })

  if (outOfStock.length > 0) {
    const names = outOfStock
      .map((item) => products.find((p) => p.id === item.productId)?.name ?? 'An item')
      .join(', ')
    return error(`Not enough stock for: ${names}. Please reduce the quantity.`, 409)
  }

  const lines = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)!
    return {
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: item.quantity,
      productId: product.id,
      lineTotal: toNumber(product.price) * item.quantity,
    }
  })

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const deliveryFee = deliveryFeeFor(subtotal)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        code: generateOrderCode(),
        userId: session.userId,
        fullName: delivery.fullName,
        phone: delivery.phone,
        address: delivery.address,
        city: delivery.city,
        note: delivery.note || null,
        subtotal: new Prisma.Decimal(subtotal),
        delivery: new Prisma.Decimal(deliveryFee),
        total: new Prisma.Decimal(subtotal + deliveryFee),
        items: {
          create: lines.map(({ lineTotal: _lineTotal, ...line }) => line),
        },
      },
      include: { items: true },
    })

    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      })
    }

    return created
  })

  return json({ order }, 201)
}
