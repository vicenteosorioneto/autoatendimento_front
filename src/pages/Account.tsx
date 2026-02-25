import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useSession } from '../contexts/useSession.ts'
import { api } from '../lib/api'
import ErrorState from '../components/ErrorState'

interface SessionSummaryItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface SessionSummaryOrder {
  id: string
  status: string
  items: SessionSummaryItem[]
  orderTotal: number
}

interface SessionSummaryResponse {
  sessionId: string
  tableId: string
  status: string
  orders: SessionSummaryOrder[]
  sessionTotal: number
}

interface AccountErrorState {
  title: string
  message?: string
}

export default function Account() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { sessionId, isRecoveringSession, recoverSession } = useSession()
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AccountErrorState | null>(null)

  const loadSummary = useCallback(async () => {
    // Se está recuperando sessão, aguardar (loading será gerenciado pela UI)
    if (isRecoveringSession) {
      setLoading(false) // Não usar loading local enquanto isRecoveringSession está ativo
      return
    }

    // Se não está recuperando e não tem sessionId, mostrar erro
    if (!sessionId) {
      setSummary(null)
      setError({
        title: 'Sessão não encontrada',
        message: 'Não foi possível carregar a sessão desta mesa. Tente recuperar a sessão.',
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.get<SessionSummaryResponse>(`/sessions/${sessionId}/summary`)
      setSummary(response.data)
    } catch (caughtError) {
      setSummary(null)

      if (axios.isAxiosError(caughtError)) {
        if (caughtError.response?.status === 404) {
          setError({
            title: 'Sessão não encontrada',
            message: 'A sessão desta mesa não existe ou já foi encerrada.',
          })
        } else {
          const isNetworkError =
            !caughtError.response ||
            caughtError.message.toLowerCase().includes('failed to fetch') ||
            caughtError.code === 'ECONNABORTED'

          if (isNetworkError) {
            setError({
              title: 'Sem conexão',
              message: 'Verifique sua internet e tente novamente.',
            })
          } else {
            setError({
              title: 'Não foi possível carregar a conta',
            })
          }
        }
      } else {
        setError({
          title: 'Não foi possível carregar a conta',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [isRecoveringSession, sessionId])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const handleRetryRecovery = useCallback(async () => {
    if (!tableId) return

    try {
      await recoverSession(tableId)
      // Após recuperar, loadSummary será chamado automaticamente via useEffect
    } catch (err) {
      console.error('Erro ao tentar recuperar sessão:', err)
      // O erro já foi tratado no SessionProvider
    }
  }, [tableId, recoverSession])

  if (!tableId) {
    return <div className="p-4 text-red-600">Mesa inválida</div>
  }

  function handleBackToMenu() {
    navigate(`/mesa/${tableId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={handleBackToMenu}
            className="text-blue-600 text-sm font-medium mb-2"
          >
            ← Voltar ao Cardápio
          </button>
          <h1 className="text-xl font-bold">Conta da Mesa</h1>
          <p className="text-sm text-gray-500">Mesa {tableId}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          {(loading || isRecoveringSession) && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Carregando...</div>
            </div>
          )}

          {!loading && !isRecoveringSession && error && (
            <ErrorState
              title={error.title}
              message={error.message}
              actionLabel={sessionId ? 'Tentar novamente' : 'Recuperar sessão'}
              onAction={sessionId ? loadSummary : handleRetryRecovery}
            />
          )}

          {!loading && !isRecoveringSession && !error && summary && (
            <>
              {summary.orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhum pedido registrado</div>
              ) : (
                <div className="space-y-4">
                  {summary.orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">Pedido</h2>
                        <span className="text-sm font-medium text-gray-600">{order.status}</span>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={`${order.id}-${item.productId}`}
                            className="border border-gray-100 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                <p className="text-sm text-gray-500">Unitário: R$ {item.unitPrice.toFixed(2)}</p>
                              </div>
                              <p className="font-semibold text-green-600">R$ {item.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Total do pedido</span>
                        <span className="text-lg font-bold text-green-600">
                          R$ {order.orderTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total da sessão</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {summary.sessionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}