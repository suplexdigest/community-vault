import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const ROLE_HIERARCHY = {
  resident: 0,
  board_member: 1,
  treasurer: 2,
  secretary: 3,
  president: 4,
  manager: 5,
  admin: 6,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/profile/');
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/token/', { email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await fetchUser();
    return data;
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_community_id');
      setUser(null);
    }
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register/', payload);
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      await fetchUser();
    }
    return data;
  }, [fetchUser]);

  const roleInfo = useMemo(() => {
    if (!user) return { role: 'resident', level: 0 };
    const role = user.role || 'resident';
    const level = ROLE_HIERARCHY[role] ?? 0;
    return { role, level };
  }, [user]);

  const highestRole = roleInfo.role;

  const hasRole = useCallback((role) => {
    return roleInfo.role === role;
  }, [roleInfo]);

  const hasMinRole = useCallback((minRole) => {
    const minLevel = ROLE_HIERARCHY[minRole] ?? 0;
    return roleInfo.level >= minLevel;
  }, [roleInfo]);

  const value = useMemo(() => ({
    user, loading, login, logout, register,
    roleInfo, highestRole, hasRole, hasMinRole,
  }), [user, loading, login, logout, register, roleInfo, highestRole, hasRole, hasMinRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
