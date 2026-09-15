import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { error, json } from '@/lib/api'
import { registerSchema, fieldErrors } from '@/lib/validators'
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return error('Please check the form.', 422, fieldErrors(parsed.error))
  }

  const { name, email, phone, password } = parsed.data
  const normalisedEmail = email.toLowerCase().trim()

  const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } })
  if (existing) {
    return error('That email already has an account.', 409, {
      email: 'That email already has an account.',
    })
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalisedEmail,
      phone: phone ?? null,
      password: await bcrypt.hash(password, 10),
    },
  })

  const token = await signSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions)

  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201)
}
