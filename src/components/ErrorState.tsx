interface ErrorStateProps {
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export default function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="bg-white border border-red-100 rounded-xl shadow-sm p-4 text-center">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium active:scale-95 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}