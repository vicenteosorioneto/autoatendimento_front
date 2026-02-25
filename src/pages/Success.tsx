import { useNavigate, useParams } from 'react-router-dom'

export default function Success() {
  const navigate = useNavigate()
  const { tableId } = useParams<{ tableId: string }>()

  function handleBackToMenu() {
    if (!tableId) return
    navigate(`/mesa/${tableId}`)
  }

  if (!tableId) {
    return <div className="p-4 text-red-600">Mesa inválida</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h1 className="text-xl font-bold mb-2">Pedido enviado com sucesso</h1>
            <p className="text-sm text-gray-500 mb-6">Mesa {tableId}</p>
            <button
              onClick={handleBackToMenu}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg active:scale-95 transition"
            >
              Voltar ao Cardápio
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}