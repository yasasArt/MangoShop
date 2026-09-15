import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice, toNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Customers' }

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        where: { status: { not: 'CANCELLED' } },
        select: { total: true, createdAt: true },
      },
    },
  })

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-bark-900">Customers</h1>
        <p className="mt-1 text-bark-600">{users.length} accounts, newest first.</p>
      </header>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="border-b border-bark-100 text-xs uppercase tracking-wider text-bark-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 text-right font-semibold">Orders</th>
                <th className="px-5 py-3 text-right font-semibold">Lifetime value</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bark-100">
              {users.map((user) => {
                const spend = user.orders.reduce((sum, order) => sum + toNumber(order.total), 0)
                return (
                  <tr key={user.id} className="transition hover:bg-mango-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mango-100 text-sm font-bold text-mango-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-bark-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-bark-700">{user.email}</p>
                      <p className="text-xs text-bark-500">{user.phone ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-bark-900 text-mango-100'
                            : 'bg-bark-100 text-bark-600'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-bark-900">
                      {user.orders.length}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-bark-900">
                      {formatPrice(spend)}
                    </td>
                    <td className="px-5 py-3 text-bark-600">{formatDate(user.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
