import axios from 'axios';

// Create Axios Instance with dynamic baseURL fallback
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('helpdesk_user');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Failed to parse user session:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for cleaner error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'An unexpected error occurred';
    
    // Auto logout on 401 unauthorized
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('helpdesk_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
