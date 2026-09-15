'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { deliveryFeeFor } from '@/lib/format'

export type CartItem = {
  productId: string
  slug: string
  name: string
  price: number
  unit: string
  imageUrl: string
  stock: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  delivery: number
  total: number
  ready: boolean
  lastAdded: CartItem | null
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
  dismissToast: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'mango-shop-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null)

  // Restore the cart once, on the client, so the server render stays stable.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // Corrupt or blocked storage — start with an empty cart.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Private mode or full storage — the cart still works for this session.
    }
  }, [items, ready])

  useEffect(() => {
    if (!lastAdded) return
    const timer = setTimeout(() => setLastAdded(null), 3200)
    return () => clearTimeout(timer)
  }, [lastAdded])

  const add: CartContextValue['add'] = useCallback((item, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((line) => line.productId === item.productId)
      if (existing) {
        const next = Math.min(existing.quantity + quantity, Math.max(item.stock, 1))
        return current.map((line) =>
          line.productId === item.productId ? { ...line, ...item, quantity: next } : line,
        )
      }
      return [...current, { ...item, quantity: Math.min(quantity, Math.max(item.stock, 1)) }]
    })
    setLastAdded({ ...item, quantity })
  }, [])

  const setQuantity: CartContextValue['setQuantity'] = useCallback((productId, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(quantity, Math.max(line.stock, 1)) }
              : line,
          ),
    )
  }, [])

  const remove: CartContextValue['remove'] = useCallback((productId) => {
    setItems((current) => current.filter((line) => line.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const dismissToast = useCallback(() => setLastAdded(null), [])

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0)
    const delivery = deliveryFeeFor(subtotal)
    return {
      items,
      count: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      delivery,
      total: subtotal + delivery,
      ready,
      lastAdded,
      add,
      setQuantity,
      remove,
      clear,
      dismissToast,
    }
  }, [items, ready, lastAdded, add, setQuantity, remove, clear, dismissToast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
