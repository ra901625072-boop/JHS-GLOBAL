import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, fetchAdminMe, logoutAdmin } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = sessionStorage.getItem('admin_token');
      if (storedToken) {
        try {
          const profile = await fetchAdminMe();
          setUser(profile);
        } catch (err) {
          sessionStorage.removeItem('admin_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const result = await loginAdmin(credentials);
    sessionStorage.setItem('admin_token', result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } catch (e) {
      // Ignore logout errors
    } finally {
      sessionStorage.removeItem('admin_token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
