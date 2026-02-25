import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from './cartContext'
import type { CartItem, CartProduct } from '../types/cart'
import { useSession } from './useSession'

function readCartItemsFromStorage(storageKey: string | null): CartItem[] {
  if (!storageKey) {
    return []
  }

  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return []
    }

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }

    const isValidCartItems = parsed.every((item) => {
      if (typeof item !== 'object' || item === null) {
        return false
      }

      const maybeItem = item as Record<string, unknown>
      return (
        typeof maybeItem.id === 'string' &&
        typeof maybeItem.name === 'string' &&
        typeof maybeItem.price === 'number' &&
        typeof maybeItem.quantity === 'number'
      )
    })

    return isValidCartItems ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

function areCartItemsEqual(a: CartItem[], b: CartItem[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((item, index) => {
    const other = b[index]
    return (
      item.id === other.id &&
      item.name === other.name &&
      item.price === other.price &&
      item.quantity === other.quantity
    )
  })
}

type CartAction =
  | { type: 'hydrate'; payload: CartItem[] }
  | { type: 'add'; payload: CartProduct }
  | { type: 'updateQuantity'; payload: { id: string; qty: number } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'clear' }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'hydrate':
      return areCartItemsEqual(state, action.payload) ? state : action.payload

    case 'add': {
      const existingItem = state.find((item) => item.id === action.payload.id)

      if (existingItem) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...state, { ...action.payload, quantity: 1 }]
    }

    case 'updateQuantity':
      if (action.payload.qty <= 0) {
        return state.filter((item) => item.id !== action.payload.id)
      }

      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.qty }
          : item
      )

    case 'remove':
      return state.filter((item) => item.id !== action.payload.id)

    case 'clear':
      return state.length === 0 ? state : []

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { tableId } = useSession()
  const storageKey = tableId ? `mesa_social_cart_${tableId}` : null
  const [items, dispatch] = useReducer(
    cartReducer,
    storageKey,
    readCartItemsFromStorage
  )

  useEffect(() => {
    dispatch({ type: 'hydrate', payload: readCartItemsFromStorage(storageKey) })
  }, [storageKey])

  useEffect(() => {
    if (!storageKey) {
      return
    }

    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey])

  function addItem(product: CartProduct) {
    dispatch({ type: 'add', payload: product })
  }

  function updateQuantity(id: string, qty: number) {
    dispatch({ type: 'updateQuantity', payload: { id, qty } })
  }

  function removeItem(id: string) {
    dispatch({ type: 'remove', payload: { id } })
  }

  function clear() {
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
    dispatch({ type: 'clear' })
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
        clear,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
