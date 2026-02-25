import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SessionContext } from './sessionContext'
import { api } from '../lib/api'

function getTableIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/mesa\/([^/]+)(?:\/|$)/)
  return match?.[1] ?? null
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRecoveringSession, setIsRecoveringSession] = useState(false)
  const [tableId, setTableId] = useState<string | null>(() =>
    getTableIdFromPathname(window.location.pathname),
  )
  const attemptedRecoveryTableIdRef = useRef<string | null>(null)
  const attemptedRecoveryTimestampRef = useRef<number>(0)

  const recoverSession = useCallback(async (targetTableId: string) => {
    // Permite retry se passou mais de 5 segundos desde última tentativa
    const now = Date.now()
    const timeSinceLastAttempt = now - attemptedRecoveryTimestampRef.current
    const canRetry = timeSinceLastAttempt > 5000

    if (attemptedRecoveryTableIdRef.current === targetTableId && !canRetry) {
      console.log('[SessionProvider] Tentativa de recuperação recente, aguardando 5s')
      return
    }

    attemptedRecoveryTableIdRef.current = targetTableId
    attemptedRecoveryTimestampRef.current = now

    try {
      setIsRecoveringSession(true)

      const response = await api.get(`/tables/${targetTableId}/menu`)
      const recoveredSessionId = response.data?.sessionId

      if (!recoveredSessionId) {
        // API retornou 200 mas sem sessionId - tratar como erro lógico
        console.error('[SessionProvider] API retornou sucesso mas sem sessionId')
        // Liberar retry resetando ref
        attemptedRecoveryTableIdRef.current = null
        throw new Error('Resposta da API sem sessionId')
      }

      setSessionId(recoveredSessionId)
      console.log('[SessionProvider] Sessão recuperada:', recoveredSessionId)
    } catch (error) {
      // Liberar retry em caso de erro
      attemptedRecoveryTableIdRef.current = null
      attemptedRecoveryTimestampRef.current = 0
      console.error('[SessionProvider] Erro ao recuperar sessão:', error)
      throw error
    } finally {
      setIsRecoveringSession(false)
    }
  }, [])

  useEffect(() => {
    const detectedTableId = getTableIdFromPathname(window.location.pathname)
    if (detectedTableId && detectedTableId !== tableId) {
      setTableId(detectedTableId)
    }
  }, [tableId])

  useEffect(() => {
    if (!tableId || sessionId !== null) {
      return
    }

    let isCancelled = false

    recoverSession(tableId).catch((error) => {
      if (!isCancelled) {
        console.error('[SessionProvider] Falha na recuperação automática:', error)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [sessionId, tableId, recoverSession])

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        tableId,
        setTableId,
        isRecoveringSession,
        recoverSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}