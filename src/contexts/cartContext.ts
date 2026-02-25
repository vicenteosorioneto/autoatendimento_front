import { createContext } from 'react'
import type { CartItem, CartProduct } from '../types/cart'

export interface CartContextData {
  items: CartItem[]
  addItem: (product: CartProduct) => void
  updateQuantity: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const CartContext = createContext<CartContextData | undefined>(undefined)
