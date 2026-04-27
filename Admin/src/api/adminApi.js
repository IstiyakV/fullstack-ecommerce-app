import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api/v1/admin' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  },
);

// Resolve image paths for production (admin subdomain → api subdomain)
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || '';
export const resolveImage = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${UPLOADS_BASE}${path}`;
};

export default api;
