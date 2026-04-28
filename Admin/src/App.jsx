import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import ProductList from './pages/products/ProductList';
import ProductVariants from './pages/products/ProductVariants';
import CustomerList from './pages/customers/CustomerList';
import CategoryList from './pages/categories/CategoryList';
import BrandList from './pages/brands/BrandList';
import SliderList from './pages/sliders/SliderList';
import BannerList from './pages/sliders/BannerList';
import VoucherList from './pages/vouchers/VoucherList';
import ReviewList from './pages/reviews/ReviewList';
import ShippingPage from './pages/shipping/ShippingPage';
import NotificationList from './pages/notifications/NotificationList';
import AppConfigPage from './pages/settings/AppConfig';
import PaymentGatewaysPage from './pages/settings/PaymentGateways';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading…</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/change-password" element={<ChangePassword standalone />} />

      {/* Protected — AdminLayout shell */}
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/:id/variants" element={<ProductVariants />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="brands" element={<BrandList />} />
        <Route path="sliders" element={<SliderList />} />
        <Route path="banners" element={<BannerList />} />
        <Route path="vouchers" element={<VoucherList />} />
        <Route path="reviews" element={<ReviewList />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="notifications" element={<NotificationList />} />
        <Route path="settings" element={<AppConfigPage />} />
        <Route path="payment-gateways" element={<PaymentGatewaysPage />} />
        <Route path="account/change-password" element={<ChangePassword />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
