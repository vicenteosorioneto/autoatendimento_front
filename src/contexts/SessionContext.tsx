import { useState } from 'react'
import type { ReactNode } from 'react'
import { SessionContext } from './sessionContext'

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