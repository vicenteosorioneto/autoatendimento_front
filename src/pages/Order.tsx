import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSession } from '../contexts/SessionContext'
import { api } from '../lib/api'

export default function Order() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, getTotalPrice, clear } = useCart()
  const { sessionId, tableId: sessionTableId } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!tableId) {
    return <div className="p-4 text-red-600">Mesa inválida</div>
  }

  const totalPrice = getTotalPrice()
  const isEmpty = items.length === 0

  function handleBackToMenu() {
    navigate(`/mesa/${tableId}`)
  }

  async function handleConfirmOrder() {
    if (!sessionId) {
      alert('Sessão não encontrada. Recarregue o cardápio para continuar.')
      return
    }

    if (isSubmitting) return

    const resolvedTableId = sessionTableId ?? tableId
    if (!resolvedTableId) {
      alert('Mesa inválida.')
      return
    }

    try {
      setIsSubmitting(true)
      const clientRequestId = crypto.randomUUID()

      await api.post(`/sessions/${sessionId}/orders`, {
        clientRequestId,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      })

      clear()
      navigate(`/mesa/${resolvedTableId}/sucesso`)
    } catch (error) {
      alert('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={handleBackToMenu}
            className="text-blue-600 text-sm font-medium mb-2"
          >
            ← Voltar ao Cardápio
          </button>
          <h1 className="text-xl font-bold">Revisar Pedido</h1>
          <p className="text-sm text-gray-500">Mesa {tableId}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto px-4 py-6">
          {isEmpty ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
              <button
                onClick={handleBackToMenu}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium active:scale-95 transition"
              >
                Voltar ao Cardápio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 text-sm font-medium ml-2"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 bg-gray-100 rounded-lg font-bold text-lg active:scale-95 transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg font-bold text-lg active:scale-95 transition"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-semibold text-green-600">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Bar */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
