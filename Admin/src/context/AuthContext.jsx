import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const data = localStorage.getItem('admin_data');
    if (token && data) {
      setAdmin(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('admin_token', res.data.access_token);
      localStorage.setItem('admin_data', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
