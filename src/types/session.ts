export interface SessionContextData {
  sessionId: string | null
  setSessionId: (sessionId: string | null) => void
  tableId: string | null
  setTableId: (tableId: string | null) => void
  isRecoveringSession: boolean
  recoverSession: (tableId: string) => Promise<void>
}
