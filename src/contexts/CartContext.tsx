import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartContextData {
  items: CartItem[]
  addItem: (product: { id: string; name: string; price: number }) => void
  updateQuantity: (id: string, qty: number) => void
  removeItem: (id: string) => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextData | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(product: { id: string; name: string; price: number }) {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)

      if (existingItem) {
        // Item já existe → aumentar quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Item não existe → adicionar com quantity 1
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  function updateQuantity(id: string, qty: number) {
    if (qty <= 0) {
      // Remover item se quantidade <= 0
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    } else {
      // Atualizar quantidade
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: qty } : item
        )
      )
    }
  }

  function removeItem(id: string) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  function getTotalItems(): number {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  function getTotalPrice(): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
