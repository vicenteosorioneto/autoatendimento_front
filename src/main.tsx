import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Menu from './pages/Menu.tsx'
import { CartProvider } from './contexts/CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/mesa/1" replace />} />
          <Route path="/mesa/:tableId" element={<Menu />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
