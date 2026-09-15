import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a MangoShop account to order and track deliveries.',
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes about thirty seconds, and your cart comes with you."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-mango-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
