import { Outlet } from 'react-router-dom'
import { CartProvider } from '../contexts/CartContext.tsx'

function MesaLayout() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  )
}

export default MesaLayout