import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sm_token'));
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    client.post('/validate-token', { access_token: token })
      .then(r => {
        if (r.data.status_code === 200) {
          setUser(r.data.data);
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (phone, password) => {
    const res = await client.post('/login', { customer_phone: phone, password });
    if (res.data.status_code === 200) {
      localStorage.setItem('sm_token', res.data.access_token);
      setToken(res.data.access_token);
      setUser(res.data.data);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  }, []);

  const register = useCallback(async (body) => {
    const res = await client.post('/android-registration', body);
    return { success: res.data.status_code === 200, data: res.data };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sm_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser(prev => ({ ...prev, ...data }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
