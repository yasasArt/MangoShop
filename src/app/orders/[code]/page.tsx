import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { StatusPill } from '@/components/StatusPill'
import { formatDateTime, formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Params = Promise<{ code: string }>
type SearchParams = Promise<{ placed?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { code } = await params
  return { title: `Order ${code}` }
}

const steps = ['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED'] as const

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { code } = await params
  const { placed } = await searchParams
  const session = await requireUser(`/orders/${code}`)

  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true },
  })

  // Customers can only ever see their own orders; admins can see any.
  if (!order || (session.role !== 'ADMIN' && order.userId !== session.userId)) notFound()

  const currentStep = steps.indexOf(order.status as (typeof steps)[number])
  const cancelled = order.status === 'CANCELLED'

  return (
    <div className="container-page py-10 sm:py-14">
      {placed === '1' && (
        <div className="animate-rise mb-8 rounded-3xl bg-leaf-100 p-6 ring-1 ring-leaf-200">
          <p className="font-display text-xl text-leaf-900">Order placed — thank you!</p>
          <p className="mt-1 text-sm text-leaf-700">
            We will call {order.phone} shortly to confirm delivery. Keep the reference{' '}
            <strong>{order.code}</strong> handy.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/orders"
            className="text-sm font-semibold text-bark-500 underline-offset-4 hover:underline"
          >
            ← All orders
          </Link>
          <h1 className="mt-2 font-display text-3xl text-bark-900 sm:text-4xl">{order.code}</h1>
          <p className="mt-1 text-bark-600">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* Progress */}
      {!cancelled && (
        <ol className="mt-8 grid gap-3 sm:grid-cols-4">
          {steps.map((step, index) => {
            const done = index <= currentStep
            return (
              <li
                key={step}
                className={`rounded-2xl p-4 ring-1 ${
                  done ? 'bg-mango-100 ring-mango-200' : 'bg-white ring-bark-100'
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                    done ? 'bg-mango-600 text-white' : 'bg-bark-100 text-bark-400'
                  }`}
                >
                  {index + 1}
                </span>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    done ? 'text-mango-900' : 'text-bark-500'
                  }`}
                >
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </p>
              </li>
            )
          })}
        </ol>
      )}

      {cancelled && (
        <p className="mt-8 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          This order was cancelled. Nothing has been charged and the stock has been returned.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-xl text-bark-900">Items</h2>
          <ul className="mt-4 divide-y divide-bark-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-bark-900">{item.name}</p>
                  <p className="text-xs text-bark-500">
                    {item.quantity} {item.unit} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-bark-900">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-bark-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-bark-600">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bark-600">Delivery</dt>
              <dd className="font-semibold">
                {Number(order.delivery) === 0 ? (
                  <span className="text-leaf-600">Free</span>
                ) : (
                  formatPrice(order.delivery)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-bark-100 pt-3">
              <dt className="font-display text-lg text-bark-900">Total</dt>
              <dd className="font-display text-lg text-bark-900">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
          <h2 className="font-display text-xl text-bark-900">Delivering to</h2>
          <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-bark-700">
            <p className="font-semibold text-bark-900">{order.fullName}</p>
            <p>{order.address}</p>
            <p>{order.city}</p>
            <p className="pt-2 text-bark-500">{order.phone}</p>
          </address>

          {order.note && (
            <>
              <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-bark-400">
                Your note
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bark-700">{order.note}</p>
            </>
          )}

          <p className="mt-6 border-t border-bark-100 pt-4 text-xs text-bark-500">
            Something wrong with this order? Call us on 011 234 5678 with the reference above.
          </p>
        </aside>
      </div>
    </div>
  )
}
