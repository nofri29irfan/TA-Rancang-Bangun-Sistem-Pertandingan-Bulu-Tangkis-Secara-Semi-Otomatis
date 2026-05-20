import { createContext, useContext, useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bulkis_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('bulkis_token') || null;
  });

  const login = useCallback(async (emailOrUsername, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emailOrUsername, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('bulkis_user', JSON.stringify(data.user));
        localStorage.setItem('bulkis_token', data.token);
        setUser(data.user);
        setToken(data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login gagal' };
      }
    } catch (error) {
      return { success: false, error: 'Tidak dapat terhubung ke server' };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        localStorage.setItem('bulkis_user', JSON.stringify(responseData.user));
        localStorage.setItem('bulkis_token', responseData.token);
        setUser(responseData.user);
        setToken(responseData.token);
        return { success: true, user: responseData.user };
      } else {
        return { success: false, error: responseData.error || 'Registrasi gagal' };
      }
    } catch (error) {
      return { success: false, error: 'Tidak dapat terhubung ke server' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bulkis_user');
    localStorage.removeItem('bulkis_token');
    setUser(null);
    setToken(null);
  }, []);

  /**
   * Helper: Authenticated fetch
   * Automatically adds Authorization header with Bearer token
   * and handles token expiration (auto-logout on 401)
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = localStorage.getItem('bulkis_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      },
    };

    const response = await fetch(`${API_BASE}${url}`, config);

    // Auto-logout on token expiration
    if (response.status === 401) {
      localStorage.removeItem('bulkis_user');
      localStorage.removeItem('bulkis_token');
      setUser(null);
      setToken(null);
    }

    return response;
  }, []);

  const isOrganizer = user?.role === 'organizer';
  const isUmpire = user?.role === 'umpire';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, authFetch, isOrganizer, isUmpire, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
