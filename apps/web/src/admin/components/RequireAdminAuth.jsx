import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';

export default function RequireAdminAuth({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6ff]">
        <Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
