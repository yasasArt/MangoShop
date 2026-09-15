import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { StatusPill } from '@/components/StatusPill'
import { formatDate, formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'My orders' }

export default async function OrdersPage() {
  const session = await requireUser('/orders')

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl text-bark-900 sm:text-4xl">My orders</h1>
      <p className="mt-2 text-bark-600">Everything you have ordered, newest first.</p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-card ring-1 ring-bark-100">
          <p className="text-4xl">📦</p>
          <h2 className="mt-4 font-display text-xl text-bark-900">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-bark-600">
            When you place your first order it will show up here, with its status and delivery
            details.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-bark-900 px-6 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
          >
            Browse mangoes
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.code}`}
                className="block rounded-3xl bg-white p-5 shadow-card ring-1 ring-bark-100 transition hover:-translate-y-0.5 hover:shadow-lift sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-bark-900">{order.code}</p>
                    <p className="text-sm text-bark-500">
                      {formatDate(order.createdAt)} ·{' '}
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusPill status={order.status} />
                    <p className="font-display text-lg text-bark-900">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <p className="mt-3 truncate text-sm text-bark-600">
                  {order.items.map((item) => `${item.quantity}× ${item.name}`).join(' · ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
