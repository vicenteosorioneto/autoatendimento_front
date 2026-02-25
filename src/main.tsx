import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing.tsx'
import Menu from './pages/Menu.tsx'
import Order from './pages/Order.tsx'
import Success from './pages/Success.tsx'
import Account from './pages/Account.tsx'
import { CartProvider } from './contexts/CartContext.tsx'
import { SessionProvider } from './contexts/SessionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/mesa/:tableId" element={<Menu />} />
            <Route path="/mesa/:tableId/pedido" element={<Order />} />
            <Route path="/mesa/:tableId/conta" element={<Account />} />
            <Route path="/mesa/:tableId/sucesso" element={<Success />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SessionProvider>
  </StrictMode>,
)
