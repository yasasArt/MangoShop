import type { Category, Product } from '@prisma/client'
import type { ProductCardData } from '@/components/ProductCard'
import { toNumber } from './format'

type WithCategory = Product & { category: Pick<Category, 'name' | 'slug'> }

/**
 * Prisma returns Decimal objects, which cannot cross the server/client
 * boundary. Everything the UI touches goes through here first.
 */
export function toCardData(product: WithCategory): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: toNumber(product.price),
    comparePrice: product.comparePrice ? toNumber(product.comparePrice) : null,
    unit: product.unit,
    stock: product.stock,
    imageUrl: product.imageUrl,
    origin: product.origin,
    sweetness: product.sweetness,
    categoryName: product.category.name,
  }
}
