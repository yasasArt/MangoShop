import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { error, json } from '@/lib/api'
import { loginSchema, fieldErrors } from '@/lib/validators'
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return error('Please check the form.', 422, fieldErrors(parsed.error))
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  })

  // Same message either way, so the form can't be used to discover who has an account.
  const valid = user ? await bcrypt.compare(parsed.data.password, user.password) : false
  if (!user || !valid) {
    return error('Email or password is incorrect.', 401)
  }

  const token = await signSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions)

  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
