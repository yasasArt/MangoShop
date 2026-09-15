import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { CheckoutForm } from './CheckoutForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const session = await requireUser('/checkout')
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, phone: true },
  })

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl text-bark-900 sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-bark-600">
        Cash on delivery, or bank transfer — we call to confirm before the van leaves.
      </p>

      <CheckoutForm defaultName={user?.name ?? session.name} defaultPhone={user?.phone ?? ''} />
    </div>
  )
}
