import axios from 'axios';

const isProd = import.meta.env.PROD;
const defaultApiUrl = isProd 
  ? 'https://efficient-reprieve-production-9d02.up.railway.app/api/v1'
  : 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
