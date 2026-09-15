import { NextResponse } from 'next/server'
import { getSession } from './auth'
import type { SessionPayload } from './session'

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status })
}

/** Returns the session, or a 401/403 response to return straight from the handler. */
export async function guard(
  role: 'USER' | 'ADMIN' = 'USER',
): Promise<{ session: SessionPayload } | { response: NextResponse }> {
  const session = await getSession()
  if (!session) return { response: error('You need to sign in first.', 401) }
  if (role === 'ADMIN' && session.role !== 'ADMIN') {
    return { response: error('Admins only.', 403) }
  }
  return { session }
}

export function isGuardFailure(
  result: Awaited<ReturnType<typeof guard>>,
): result is { response: NextResponse } {
  return 'response' in result
}
