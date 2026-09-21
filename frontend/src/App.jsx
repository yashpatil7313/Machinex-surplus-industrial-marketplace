import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { Categories } from './pages/Categories';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BuyerWishlist } from './pages/buyer/BuyerWishlist';
import { BuyerRequests } from './pages/buyer/BuyerRequests';
import { BuyerInquiries } from './pages/buyer/BuyerInquiries';

// Seller Pages
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerListings } from './pages/seller/SellerListings';
import { AddPart } from './pages/seller/AddPart';
import { InventoryValue } from './pages/seller/InventoryValue';
import { SellerInquiries } from './pages/seller/SellerInquiries';
import { SellerRequests } from './pages/seller/SellerRequests';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminListings } from './pages/admin/AdminListings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminRequests } from './pages/admin/AdminRequests';

// Protected Route Guard Component
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin can access all portals
  if (user?.role === 'admin') {
    return children;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard
    if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    return <Navigate to="/buyer/dashboard" replace />;
  }

  return children;
};

// Generic Dashboard Redirector
const DashboardRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
  return <Navigate to="/buyer/dashboard" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/parts/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Buyer Protected Portal */}
            <Route
              path="/buyer"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<BuyerDashboard />} />
              <Route path="wishlist" element={<BuyerWishlist />} />
              <Route path="requests" element={<BuyerRequests />} />
              <Route path="inquiries" element={<BuyerInquiries />} />
            </Route>

            {/* Seller Protected Portal */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SellerDashboard />} />
              <Route path="listings" element={<SellerListings />} />
              <Route path="add-part" element={<AddPart />} />
              <Route path="inventory" element={<InventoryValue />} />
              <Route path="inquiries" element={<SellerInquiries />} />
              <Route path="requests" element={<SellerRequests />} />
            </Route>

            {/* Admin Protected Console */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="requests" element={<AdminRequests />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
