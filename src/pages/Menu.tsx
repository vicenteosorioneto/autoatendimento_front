import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { api } from '../lib/api'
import { useCart } from '../contexts/useCart.ts'
import { useSession } from '../contexts/useSession.ts'
import ErrorState from '../components/ErrorState'

interface Product {
  id: string
  name: string
  price: number
  description?: string
}

interface Category {
  products: Product[]
}

interface MenuErrorState {
  title: string
  message?: string
}

export default function Menu() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<MenuErrorState | null>(null)
  const { addItem, getTotalItems } = useCart()
  const { setSessionId, setTableId } = useSession()
  const totalItems = getTotalItems()

  const loadMenu = useCallback(async () => {
    if (!tableId) {
      setProducts([])
      setError(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/tables/${tableId}/menu`)

      const { sessionId, categories } = response.data as {
        sessionId?: string
        categories?: Category[]
      }

      setSessionId(sessionId ?? null)
      setTableId(tableId)

      const allProducts = Array.isArray(categories)
        ? categories.flatMap((category: Category) => category.products ?? [])
        : []

      setProducts(allProducts)
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        if (caughtError.response?.status === 404) {
          setError({
            title: 'Mesa não encontrada',
            message: 'Confira o QR Code/NFC ou peça ajuda ao garçom.',
          })
        } else {
          const isNetworkError =
            !caughtError.response ||
            caughtError.message.toLowerCase().includes('failed to fetch')

          if (isNetworkError) {
            setError({
              title: 'Sem conexão',
              message: 'Verifique sua internet e tente novamente.',
            })
          } else {
            setError({
              title: 'Não foi possível carregar o cardápio',
            })
          }
        }
      } else {
        setError({
          title: 'Não foi possível carregar o cardápio',
        })
      }

      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [tableId, setSessionId, setTableId])

  useEffect(() => {
    loadMenu()
  }, [loadMenu])

  if (!tableId) {
    return <div className="p-4 text-red-600">Mesa inválida</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Mesa Social</h1>
              <p className="text-sm text-gray-500">Mesa {tableId}</p>
            </div>
            <button
              onClick={() => navigate(`/mesa/${tableId}/conta`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition"
            >
              Ver Conta
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          <h2 className="text-lg font-semibold">Cardápio</h2>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Carregando...</div>
            </div>
          )}

          {error && (
            <ErrorState
              title={error.title}
              message={error.message}
              actionLabel="Tentar novamente"
              onAction={loadMenu}
            />
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto disponível
            </div>
          )}

          {!loading && !error && products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-500">{product.description}</p>
                )}
                <p className="mt-2 font-semibold text-green-600">
                  R$ {product.price.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => addItem(product)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition"
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Bar */}
      {totalItems > 0 && (
        <div className="sticky bottom-0 bg-white border-t shadow-lg">
          <div className="max-w-md mx-auto px-4 py-4">
            <button
              onClick={() => navigate(`/mesa/${tableId}/pedido`)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg active:scale-95 transition"
            >
              Ver Pedido ({totalItems})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
