import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Menu from './pages/Menu.tsx'
import Order from './pages/Order.tsx'
import { CartProvider } from './contexts/CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/mesa/9cece981-47ad-4d25-91b0-39a9e6ea8a3e" replace />} />
          <Route path="/mesa/:tableId" element={<Menu />} />
          <Route path="/mesa/:tableId/pedido" element={<Order />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
