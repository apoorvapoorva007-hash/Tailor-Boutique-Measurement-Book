import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('boutique_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for clear errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data?.error || error.message || 'Server error');
  }
);

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    if (res.data.token) {
      localStorage.setItem('boutique_token', res.data.token);
      localStorage.setItem('boutique_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('boutique_token');
    localStorage.removeItem('boutique_user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('boutique_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile/');
    return res.data;
  }
};

export const boutiqueService = {
  // System
  getHealth: async () => (await api.get('/health/')).data,
  seedDatabase: async (force = false) => (await api.post('/seed/', { force })).data,

  // Templates
  getGarmentTemplates: async () => (await api.get('/garment-templates/')).data,

  // Dashboard
  getDashboardStats: async () => (await api.get('/dashboard/stats/')).data,

  // Customers
  getCustomers: async (q = '') => (await api.get(`/customers/?q=${encodeURIComponent(q)}`)).data,
  getCustomer: async (customerId) => (await api.get(`/customers/${customerId}/`)).data,
  createCustomer: async (data) => (await api.post('/customers/', data)).data,
  updateCustomer: async (customerId, data) => (await api.put(`/customers/${customerId}/`, data)).data,
  deleteCustomer: async (customerId) => (await api.delete(`/customers/${customerId}/`)).data,

  // Dynamic Measurement Profiles
  getGarmentProfiles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/garment-profiles/?${query}`)).data;
  },
  getGarmentProfile: async (profileId) => (await api.get(`/garment-profiles/${profileId}/`)).data,
  createGarmentProfile: async (data) => (await api.post('/garment-profiles/', data)).data,
  updateGarmentProfile: async (profileId, data) => (await api.put(`/garment-profiles/${profileId}/`, data)).data,
  deleteGarmentProfile: async (profileId) => (await api.delete(`/garment-profiles/${profileId}/`)).data,

  // Orders
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/orders/?${query}`)).data;
  },
  getOrder: async (orderId) => (await api.get(`/orders/${orderId}/`)).data,
  createOrder: async (data) => (await api.post('/orders/', data)).data,
  updateOrder: async (orderId, data) => (await api.put(`/orders/${orderId}/`, data)).data,
  updateOrderStatus: async (orderId, status, notes = '') => {
    return (await api.post(`/orders/${orderId}/status/`, { status, notes })).data;
  },
  deleteOrder: async (orderId) => (await api.delete(`/orders/${orderId}/`)).data,
  getOrderPdfUrl: (orderId) => `/api/orders/${orderId}/invoice-pdf/`,

  // Fitting Notes
  getFittingNotes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/fitting-notes/?${query}`)).data;
  },
  createFittingNote: async (data) => (await api.post('/fitting-notes/', data)).data,
  updateFittingNote: async (noteId, data) => (await api.put(`/fitting-notes/${noteId}/`, data)).data,
  deleteFittingNote: async (noteId) => (await api.delete(`/fitting-notes/${noteId}/`)).data,

  // Delivery Management
  getDeliveries: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return (await api.get(`/deliveries/?${query}`)).data;
  },
  createDelivery: async (data) => (await api.post('/deliveries/', data)).data,
  updateDelivery: async (deliveryId, data) => (await api.put(`/deliveries/${deliveryId}/`, data)).data,

  // Reports
  getReports: async () => (await api.get('/reports/')).data,
  getSummaryPdfUrl: () => `/api/reports/pdf/`,
};

export default api;
