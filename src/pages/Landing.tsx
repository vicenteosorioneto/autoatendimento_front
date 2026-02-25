export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">
          Escaneie o QR Code da mesa para iniciar
        </h1>
        <p className="text-sm text-gray-600">
          Ou aproxime o cartão NFC da mesa.
        </p>
      </div>
    </div>
  )
}