import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { StatusPill } from '@/components/StatusPill'
import { formatDate, formatPrice, toNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const [revenue, orderCount, pendingCount, productCount, customerCount, recentOrders, lowStock] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { user: { select: { name: true } }, items: true },
      }),
      prisma.product.findMany({
        where: { active: true, stock: { lte: 25 } },
        orderBy: { stock: 'asc' },
        take: 6,
        include: { category: { select: { name: true } } },
      }),
    ])

  const stats = [
    {
      label: 'Revenue',
      value: formatPrice(toNumber(revenue._sum.total ?? 0)),
      note: 'excluding cancelled orders',
    },
    { label: 'Orders', value: orderCount.toString(), note: `${pendingCount} awaiting confirmation` },
    { label: 'Live products', value: productCount.toString(), note: 'visible in the shop' },
    { label: 'Customers', value: customerCount.toString(), note: 'registered accounts' },
  ]

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-bark-900">Dashboard</h1>
        <p className="mt-1 text-bark-600">How the shop is doing today.</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-bark-100"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-bark-400">{stat.label}</p>
            <p className="mt-2 font-display text-2xl text-bark-900">{stat.value}</p>
            <p className="mt-1 text-xs text-bark-500">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Recent orders */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100">
          <div className="flex items-center justify-between gap-3 border-b border-bark-100 px-5 py-4">
            <h2 className="font-display text-lg text-bark-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-mango-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-bark-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-bark-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bark-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-mango-50/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/orders/${order.code}`}
                          className="font-semibold text-bark-900 hover:text-mango-700"
                        >
                          {order.code}
                        </Link>
                        <p className="text-xs text-bark-500">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-bark-700">{order.user.name}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-bark-900">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Low stock */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100">
          <div className="flex items-center justify-between gap-3 border-b border-bark-100 px-5 py-4">
            <h2 className="font-display text-lg text-bark-900">Running low</h2>
            <Link
              href="/admin/products"
              className="text-sm font-semibold text-mango-700 hover:underline"
            >
              Manage
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-bark-500">
              Everything is well stocked.
            </p>
          ) : (
            <ul className="divide-y divide-bark-100">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="block truncate text-sm font-semibold text-bark-900 hover:text-mango-700"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-bark-500">{product.category.name}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      product.stock === 0
                        ? 'bg-rose-100 text-rose-700'
                        : product.stock <= 10
                          ? 'bg-mango-100 text-mango-800'
                          : 'bg-bark-100 text-bark-600'
                    }`}
                  >
                    {product.stock} {product.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
