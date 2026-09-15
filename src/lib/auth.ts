import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, verifySession, type SessionPayload } from './session'

/** Reads the signed session cookie. Safe to call from any server component. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

/** Server-component guard: bounces anonymous visitors to the login page. */
export async function requireUser(returnTo = '/'): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`)
  return session
}

/** Server-component guard for the admin panel. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect('/login?next=%2Fadmin')
  if (session.role !== 'ADMIN') redirect('/?error=forbidden')
  return session
}
