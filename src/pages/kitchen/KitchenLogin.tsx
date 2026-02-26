import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToken } from '../../hooks/useAdminToken';

export default function KitchenLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAdminToken();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validar se o campo está vazio
    if (!password.trim()) {
      setError('Por favor, insira o token de acesso');
      return;
    }

    // Salvar token e redirecionar
    setToken(password);
    navigate('/cozinha');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Painel da Cozinha
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Token de Acesso
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o token"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
