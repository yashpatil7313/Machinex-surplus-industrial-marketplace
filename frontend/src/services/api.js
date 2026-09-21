import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('machinex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  getUsers: (params) => api.get('/api/auth/users', { params }),
  deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
};

// Parts Service
export const partsService = {
  getParts: (params) => api.get('/api/parts', { params }),
  getFeatured: () => api.get('/api/parts/featured'),
  getById: (id) => api.get(`/api/parts/${id}`),
  create: (formData) =>
    api.post('/api/parts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/api/parts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/api/parts/${id}`),
  getSellerListings: () => api.get('/api/parts/seller/my-listings'),
  getInventoryValue: () => api.get('/api/parts/seller/inventory-value'),
};

// Categories Service
export const categoryService = {
  getCategories: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Wishlist Service
export const wishlistService = {
  getWishlist: () => api.get('/api/wishlist'),
  add: (partId) => api.post('/api/wishlist', { part_id: partId }),
  remove: (partId) => api.delete(`/api/wishlist/${partId}`),
};

// Inquiry Service
export const inquiryService = {
  getInquiries: () => api.get('/api/inquiries'),
  create: (data) => api.post('/api/inquiries', data),
  update: (id, data) => api.put(`/api/inquiries/${id}`, data),
};

// Purchase Requests Service
export const requestService = {
  getRequests: () => api.get('/api/requests'),
  create: (data) => api.post('/api/requests', data),
  update: (id, data) => api.put(`/api/requests/${id}`, data),
};

// Admin Service
export const adminService = {
  getStatistics: () => api.get('/api/admin/statistics'),
  getListings: (params) => api.get('/api/admin/listings', { params }),
  approveListing: (id) => api.put(`/api/admin/listings/${id}/approve`),
  rejectListing: (id, data) => api.put(`/api/admin/listings/${id}/reject`, data),
};

// Reports Service
export const reportService = {
  create: (data) => api.post('/api/reports', data),
  getReports: () => api.get('/api/reports'),
  update: (id, data) => api.put(`/api/reports/${id}`, data),
};

export default api;
