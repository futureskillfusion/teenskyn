import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import { CartProvider } from './hooks/useCart';
import { Toaster } from '@/components/ui/toaster';
import AdminApp from './admin/routes';

function App() {
    return (
        <CartProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/admin/*" element={<AdminApp />} />
                </Routes>
                <Toaster />
            </Router>
        </CartProvider>
    );
}

export default App;
