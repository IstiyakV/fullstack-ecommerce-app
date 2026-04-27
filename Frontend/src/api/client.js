import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1/customer',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access_token if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sm_token');
  if (token) {
    if (config.data && typeof config.data === 'object') {
      config.data.access_token = token;
    }
  }
  return config;
});

export default client;
