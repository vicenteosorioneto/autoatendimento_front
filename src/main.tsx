import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing.tsx'
import Menu from './pages/Menu.tsx'
import Order from './pages/Order.tsx'
import Success from './pages/Success.tsx'
import Account from './pages/Account.tsx'
import { SessionProvider } from './contexts/SessionContext.tsx'
import MesaLayout from './components/MesaLayout.tsx'
import KitchenLogin from './pages/kitchen/KitchenLogin.tsx'
import KitchenDashboard from './pages/kitchen/KitchenDashboard.tsx'
import RequireAdminAuth from './components/kitchen/RequireAdminAuth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/mesa/:tableId/*" element={<MesaLayout />}>
            <Route index element={<Menu />} />
            <Route path="pedido" element={<Order />} />
            <Route path="conta" element={<Account />} />
            <Route path="sucesso" element={<Success />} />
          </Route>
          <Route path="/cozinha/login" element={<KitchenLogin />} />
          <Route
            path="/cozinha"
            element={
              <RequireAdminAuth>
                <KitchenDashboard />
              </RequireAdminAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
)
