import { createContext } from 'react'
import type { SessionContextData } from '../types/session'

export const SessionContext = createContext<SessionContextData | undefined>(undefined)
