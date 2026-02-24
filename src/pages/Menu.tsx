import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useCart } from '../contexts/CartContext'

interface Product {
  id: string
  name: string
  price: number
  description?: string
}

export default function Menu() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem, getTotalItems } = useCart()
  const totalItems = getTotalItems()

  if (!tableId) {
    return <div className="p-4 text-red-600">Mesa inválida</div>
  }

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/tables/${tableId}/menu`)
        
        // Backend retorna { sessionId, categories }
        const { categories } = response.data
        
        // Transformar categories em um único array de produtos
        const allProducts = Array.isArray(categories)
          ? categories.flatMap((category: any) => category.products ?? [])
          : []
        
        setProducts(allProducts)
      } catch (err) {
        setError('Erro ao carregar o cardápio')
        setProducts([]) // Garantir que products nunca fique undefined
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [tableId])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Mesa Social</h1>
          <p className="text-sm text-gray-500">Mesa {tableId}</p>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
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
