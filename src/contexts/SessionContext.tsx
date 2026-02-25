import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface SessionContextData {
  sessionId: string | null
  setSessionId: (sessionId: string | null) => void
  tableId: string | null
  setTableId: (tableId: string | null) => void
}

const SessionContext = createContext<SessionContextData | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [tableId, setTableId] = useState<string | null>(null)

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        tableId,
        setTableId,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}