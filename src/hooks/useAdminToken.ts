const ADMIN_TOKEN_KEY = 'adminToken';

export function useAdminToken() {
  const getToken = (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  };

  const setToken = (token: string): void => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  };

  const clearToken = (): void => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  return { getToken, setToken, clearToken };
}
