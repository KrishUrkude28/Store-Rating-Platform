import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function getRoleHomePath(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'STORE_OWNER':
      return '/owner/dashboard';
    case 'USER':
    default:
      return '/user/stores';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('store_rating_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('store_rating_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Validate session on boot if token exists
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('store_rating_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('store_rating_token');
          localStorage.removeItem('store_rating_user');
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('store_rating_token', data.token);
    localStorage.setItem('store_rating_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('store_rating_token', data.token);
    localStorage.setItem('store_rating_user', JSON.stringify(data.user));
    return data.user;
  };

  const changePassword = async (payload) => {
    return await api.changePassword(payload);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('store_rating_token');
      localStorage.removeItem('store_rating_user');
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        changePassword,
        logout,
        getRoleHomePath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
