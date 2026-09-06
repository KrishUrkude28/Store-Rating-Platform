// API service layer for client-server communication

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('store_rating_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Trigger logout if token is expired/invalid
      localStorage.removeItem('store_rating_token');
      localStorage.removeItem('store_rating_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Admin Dashboard & Users
  getAdminStats: () => request('/admin/dashboard', { method: 'GET' }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  getUserDetails: (id) => request(`/users/${id}`, { method: 'GET' }),
  getStoreOwners: () => request('/users/owners', { method: 'GET' }),

  // Stores
  getStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/stores${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getStoreById: (id) => request(`/stores/${id}`, { method: 'GET' }),
  createStore: (payload) => request('/stores', { method: 'POST', body: payload }),

  // Ratings
  submitRating: (store_id, rating, review) => request('/ratings', { method: 'POST', body: { store_id, rating, review } }),
  modifyRating: (rating_id, rating, review) => request(`/ratings/${rating_id}`, { method: 'PUT', body: { rating, review } }),

  // Store Owner Dashboard
  getOwnerDashboard: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/owner/dashboard${query ? `?${query}` : ''}`, { method: 'GET' });
  }
};
