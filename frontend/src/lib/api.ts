import axios from 'axios';
import { getToken, removeToken } from './auth';

// When running locally: calls go to http://localhost:3001 directly
// When accessed via ngrok / public URL: Next.js proxies /api/* to localhost:3001 server-side
// so visitors never need direct access to port 3001
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = isLocal
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
