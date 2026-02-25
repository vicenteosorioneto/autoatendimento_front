import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Menu from './pages/Menu.tsx'
import Order from './pages/Order.tsx'
import Success from './pages/Success.tsx'
import { CartProvider } from './contexts/CartContext.tsx'
import { SessionProvider } from './contexts/SessionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/mesa/9cece981-47ad-4d25-91b0-39a9e6ea8a3e" replace />} />
            <Route path="/mesa/:tableId" element={<Menu />} />
            <Route path="/mesa/:tableId/pedido" element={<Order />} />
            <Route path="/mesa/:tableId/sucesso" element={<Success />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SessionProvider>
  </StrictMode>,
)
