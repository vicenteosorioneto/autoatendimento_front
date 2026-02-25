import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing.tsx'
import Menu from './pages/Menu.tsx'
import Order from './pages/Order.tsx'
import Success from './pages/Success.tsx'
import { SessionProvider } from './contexts/SessionContext.tsx'
import MesaLayout from './components/MesaLayout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/mesa/:tableId/*" element={<MesaLayout />}>
            <Route index element={<Menu />} />
            <Route path="pedido" element={<Order />} />
            <Route path="sucesso" element={<Success />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
)
