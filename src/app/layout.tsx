import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { CartToast } from '@/components/CartToast'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { StorefrontOnly } from '@/components/StorefrontOnly'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: {
    default: 'MangoShop — fresh mangoes delivered across Sri Lanka',
    template: '%s · MangoShop',
  },
  description:
    'Buy premium local and imported mangoes online. Karutha Colomban, Willard, Alphonso and more, picked in the morning and delivered the same day.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <CartProvider>
          <StorefrontOnly>
            <Suspense fallback={<div className="h-16 border-b border-mango-100 sm:h-20" />}>
              <Navbar session={session} />
            </Suspense>
          </StorefrontOnly>
          <main className="flex-1">{children}</main>
          <StorefrontOnly>
            <Footer />
          </StorefrontOnly>
          <CartToast />
        </CartProvider>
      </body>
    </html>
  )
}
