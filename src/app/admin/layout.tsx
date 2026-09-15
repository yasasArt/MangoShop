import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · MangoShop Admin' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-dvh flex-col bg-bark-50 lg:flex-row">
      <AdminNav name={session.name} email={session.email} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  )
}
