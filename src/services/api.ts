import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; walletAddress?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  walletLogin: (data: { walletAddress: string; signature: string; message: string }) =>
    api.post('/auth/wallet-login', data),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Assets API
export const assetsAPI = {
  getAll: (params?: { category?: string; sortBy?: string; search?: string }) =>
    api.get('/assets', { params }),
  
  getById: (id: string) => api.get(`/assets/${id}`),
  
  getBySymbol: (symbol: string) => api.get(`/assets/symbol/${symbol}`),
  
  getPriceHistory: (id: string, period?: string) =>
    api.get(`/assets/${id}/price-history`, { params: { period } }),
  
  getMarketStats: () => api.get('/assets/stats/market'),
  
  updatePrice: (id: string, data: { price: number; source?: string; confidence?: number }) =>
    api.put(`/assets/${id}/price`, data),
};

// Trading API
export const tradingAPI = {
  getHistory: (params?: { limit?: number; offset?: number; status?: string }) =>
    api.get('/trading/history', { params }),
  
  getStats: (days?: number) => api.get('/trading/stats', { params: { days } }),
  
  createOrder: (data: {
    assetId: string;
    amount: number;
    price: number;
    tradeType?: string;
    side: 'buy' | 'sell';
  }) => api.post('/trading/order', data),
  
  getRecentTrades: (assetId: string, limit?: number) =>
    api.get(`/trading/asset/${assetId}/recent`, { params: { limit } }),
  
  getOrderBook: (assetId: string) => api.get(`/trading/asset/${assetId}/orderbook`),
};

// AI API
export const aiAPI = {
  getPredictions: (assetId: string) => api.get(`/ai/predictions/${assetId}`),
  
  getSentiment: () => api.get('/ai/sentiment'),
  
  getRiskAnalysis: () => api.get('/ai/risk-analysis'),
  
  getSignals: (assetId?: string, timeframe?: string) =>
    api.get('/ai/signals', { params: { assetId, timeframe } }),
  
  getPerformance: () => api.get('/ai/performance'),
  
  getRecommendations: () => api.get('/ai/recommendations'),
};

// Bridge API
export const bridgeAPI = {
  initiate: (data: {
    tokenAddress: string;
    amount: number;
    fromChain: number;
    toChain: number;
    recipientAddress: string;
  }) => api.post('/bridge/initiate', data),
  
  getTransaction: (txId: string) => api.get(`/bridge/transaction/${txId}`),
  
  getHistory: (params?: { limit?: number; offset?: number }) =>
    api.get('/bridge/history', { params }),
  
  getChains: () => api.get('/bridge/chains'),
  
  getStats: () => api.get('/bridge/stats'),
};

// Analytics API
export const analyticsAPI = {
  getPlatform: (period?: string) => api.get('/analytics/platform', { params: { period } }),
  
  getUser: (period?: string) => api.get('/analytics/user', { params: { period } }),
  
  getAsset: (assetId: string, period?: string) =>
    api.get(`/analytics/asset/${assetId}`, { params: { period } }),
};

export default api;