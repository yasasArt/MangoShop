import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session'

/**
 * First line of defence. Every protected page ALSO re-checks the session
 * server-side (see requireUser / requireAdmin), so a bypass here is not enough
 * to reach protected data.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  const isAdminArea = pathname.startsWith('/admin')
  const isCustomerArea = pathname.startsWith('/checkout') || pathname.startsWith('/orders')

  if (!session && (isAdminArea || isCustomerArea)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  if (isAdminArea && session?.role !== 'ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = '?error=forbidden'
    return NextResponse.redirect(url)
  }

  // Signed-in users have no business on the login/register screens.
  if (session && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'ADMIN' ? '/admin' : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/orders/:path*', '/login', '/register'],
}
