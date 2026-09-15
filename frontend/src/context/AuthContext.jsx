import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session from localStorage on app boot
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('helpdesk_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user session:', error);
      localStorage.removeItem('helpdesk_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      setUser(response.data);
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  };

  // Register handler
  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.success && response.data) {
      setUser(response.data);
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update profile handler
  const updateProfile = async (userData) => {
    const response = await authService.updateProfile(userData);
    if (response.success && response.data) {
      setUser(response.data);
      return response.data;
    }
    throw new Error(response.message || 'Profile update failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isAgent: user?.role === 'agent',
        isRequester: user?.role === 'requester',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
