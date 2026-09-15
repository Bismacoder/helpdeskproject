import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.data) {
      localStorage.setItem('helpdesk_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.data) {
      localStorage.setItem('helpdesk_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Get current profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data && response.data.data) {
      const currentUser = JSON.parse(localStorage.getItem('helpdesk_user') || '{}');
      const updated = { ...currentUser, ...response.data.data };
      localStorage.setItem('helpdesk_user', JSON.stringify(updated));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('helpdesk_user');
  },
};
