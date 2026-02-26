import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToken } from '../../hooks/useAdminToken';
import { api } from '../../lib/api';
import type { KitchenOrder } from '../../types/kitchen';

export default function KitchenDashboard() {
  const navigate = useNavigate();
  const { getToken, clearToken } = useAdminToken();

  const [pendingOrders, setPendingOrders] = useState<KitchenOrder[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});

  const updatingOrderIdRef = useRef<string | null>(null);
  const getTokenRef = useRef(getToken);
  const clearTokenRef = useRef(clearToken);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    updatingOrderIdRef.current = updatingOrderId;
  }, [updatingOrderId]);

  useEffect(() => {
    getTokenRef.current = getToken;
    clearTokenRef.current = clearToken;
    navigateRef.current = navigate;
  }, [getToken, clearToken, navigate]);

  const fetchOrders = async () => {
    // Não executar polling se houver um pedido sendo atualizado
    if (updatingOrderIdRef.current !== null) {
      return;
    }

    const token = getTokenRef.current();
    if (!token) {
      clearTokenRef.current();
      navigateRef.current('/cozinha/login');
      return;
    }

    try {
      const [pendingResponse, preparingResponse] = await Promise.all([
        api.get('/orders?status=PENDING', {
          headers: { 'x-admin-token': token }
        }),
        api.get('/orders?status=PREPARING', {
          headers: { 'x-admin-token': token }
        })
      ]);

      setPendingOrders(pendingResponse.data);
      setPreparingOrders(preparingResponse.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        clearTokenRef.current();
        navigateRef.current('/cozinha/login');
      } else {
        setError('Erro ao carregar pedidos');
        console.error('Erro ao buscar pedidos:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'PREPARING' | 'READY') => {
    const token = getToken();
    if (!token) {
      clearToken();
      navigate('/cozinha/login');
      return;
    }

    setUpdatingOrderId(orderId);
    setOrderErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[orderId];
      return newErrors;
    });

    try {
      await api.patch(
        `/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { 'x-admin-token': token } }
      );

      // Atualizar UI imediatamente após sucesso
      if (newStatus === 'PREPARING') {
        // Remover de pendingOrders e adicionar em preparingOrders
        const order = pendingOrders.find((o) => o.orderId === orderId);
        if (order) {
          setPendingOrders((prev) => prev.filter((o) => o.orderId !== orderId));
          setPreparingOrders((prev) => [...prev, { ...order, status: 'PREPARING' }]);
        }
      } else if (newStatus === 'READY') {
        // Remover de preparingOrders
        setPreparingOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        clearToken();
        navigate('/cozinha/login');
      } else {
        const errorMessage = err.response?.data?.error || 'Erro ao atualizar pedido';
        setOrderErrors((prev) => ({ ...prev, [orderId]: errorMessage }));
        console.error('Erro ao atualizar pedido:', err);
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    void fetchOrders();

    const intervalId = window.setInterval(() => {
      void fetchOrders();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/cozinha/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Painel da Cozinha
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pedidos Pendentes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">
              PENDENTES ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum pedido pendente
                </p>
              ) : (
                pendingOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Mesa {order.tableNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="font-medium">{item.name}</span>
                            {item.quantity > 1 ? (
                              <span className="text-gray-600">{item.quantity}x</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {orderErrors[order.orderId] && (
                      <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        {orderErrors[order.orderId]}
                      </div>
                    )}

                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'PREPARING')}
                      disabled={updatingOrderId === order.orderId}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.orderId ? 'Iniciando...' : 'Iniciar'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pedidos em Preparo */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              EM PREPARO ({preparingOrders.length})
            </h2>
            <div className="space-y-4">
              {preparingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum pedido em preparo
                </p>
              ) : (
                preparingOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Mesa {order.tableNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="font-medium">{item.name}</span>
                            {item.quantity > 1 ? (
                              <span className="text-gray-600">{item.quantity}x</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {orderErrors[order.orderId] && (
                      <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        {orderErrors[order.orderId]}
                      </div>
                    )}

                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'READY')}
                      disabled={updatingOrderId === order.orderId}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.orderId ? 'Finalizando...' : 'Marcar como pronto'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
