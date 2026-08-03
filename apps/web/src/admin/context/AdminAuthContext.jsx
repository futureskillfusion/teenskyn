import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi, AdminApiError } from '@/admin/lib/adminApi';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await adminApi.get('/auth/me');
      setAdmin(data);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await adminApi.post('/auth/login', { email, password });
      setAdmin(data);
      return { ok: true };
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Login failed';
      return { ok: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    await adminApi.post('/auth/logout', {}).catch(() => {});
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
