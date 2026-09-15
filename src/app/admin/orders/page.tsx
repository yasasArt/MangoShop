import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { formatDateTime, formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Orders' }

const filters = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const where: Prisma.OrderWhereInput = status
    ? { status: status as Prisma.EnumOrderStatusFilter['equals'] }
    : {}

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true, user: { select: { name: true, email: true } } },
  })

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-bark-900">Orders</h1>
        <p className="mt-1 text-bark-600">
          Change a status here and the customer sees it on their order page immediately.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = (status ?? '') === filter.value
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/orders?status=${filter.value}` : '/admin/orders'}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-bark-900 text-mango-50'
                  : 'bg-white text-bark-600 ring-1 ring-bark-200 hover:ring-mango-300'
              }`}
            >
              {filter.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100">
        {orders.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-bark-500">No orders in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-sm">
              <thead className="border-b border-bark-100 text-xs uppercase tracking-wider text-bark-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Deliver to</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bark-100">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top transition hover:bg-mango-50/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/orders/${order.code}`}
                        className="font-semibold text-bark-900 hover:text-mango-700"
                      >
                        {order.code}
                      </Link>
                      <p className="text-xs text-bark-500">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-bark-900">{order.user.name}</p>
                      <p className="text-xs text-bark-500">{order.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <ul className="space-y-0.5 text-xs text-bark-600">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity} {item.unit} · {item.name}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-4 text-xs text-bark-600">
                      <p>{order.address}</p>
                      <p className="font-medium text-bark-800">{order.city}</p>
                      {order.note && <p className="mt-1 italic text-mango-700">“{order.note}”</p>}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-bark-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
