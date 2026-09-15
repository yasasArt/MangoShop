import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your full name').max(80),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .min(9, 'Enter a valid phone number')
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  description: z.string().min(10, 'Write at least a sentence about this mango'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  unit: z.string().min(1).max(20),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  origin: z.string().max(80).optional().nullable(),
  sweetness: z.coerce.number().int().min(1).max(5),
  featured: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(true),
  categoryId: z.string().min(1, 'Choose a category'),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(60),
  description: z.string().min(10, 'Add a short description'),
  imageUrl: z.string().min(1, 'Image URL is required'),
})

export const orderSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(80),
  phone: z.string().min(9, 'Enter a contact number').max(20),
  address: z.string().min(5, 'Enter the delivery address'),
  city: z.string().min(2, 'Enter the city').max(60),
  note: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, 'Your cart is empty'),
})

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED', 'CANCELLED']),
})

/** Turns a ZodError into { field: message } for rendering next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!out[key]) out[key] = issue.message
  }
  return out
}
