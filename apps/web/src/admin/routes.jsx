import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from '@/admin/context/AdminAuthContext';
import RequireAdminAuth from '@/admin/components/RequireAdminAuth';
import AdminLayout from '@/admin/components/AdminLayout';
import LoginPage from '@/admin/pages/LoginPage';
import DashboardPage from '@/admin/pages/DashboardPage';
import SalesPage from '@/admin/pages/SalesPage';
import ProductsListPage from '@/admin/pages/products/ProductsListPage';
import ProductFormPage from '@/admin/pages/products/ProductFormPage';
import OrdersListPage from '@/admin/pages/orders/OrdersListPage';
import OrderDetailPage from '@/admin/pages/orders/OrderDetailPage';
import CustomersListPage from '@/admin/pages/customers/CustomersListPage';
import CustomerDetailPage from '@/admin/pages/customers/CustomerDetailPage';
import ServicesPage from '@/admin/pages/ServicesPage';
import BookingsPage from '@/admin/pages/BookingsPage';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          path=""
          element={(
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          )}
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="customers" element={<CustomersListPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
