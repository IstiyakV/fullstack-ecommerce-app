import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/account/Wishlist';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyAccount from './pages/account/MyAccount';
import Profile from './pages/account/Profile';
import Addresses from './pages/account/Addresses';
import OrderHistory from './pages/account/OrderHistory';
import OrderDetails from './pages/account/OrderDetails';
import OrderTracking from './pages/account/OrderTracking';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />

                {/* Account (protected inside component) */}
                <Route path="/account" element={<MyAccount />}>
                  <Route index element={<Navigate to="profile" replace />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="addresses" element={<Addresses />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="orders/:id/track" element={<OrderTracking />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={
                  <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '4rem', color: 'var(--sm-primary)' }}>404</h1>
                    <h2>Page Not Found</h2>
                    <p className="text-muted mt-2">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn btn-primary mt-4">Back to Home</a>
                  </div>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'sm-toast',
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '0.9375rem',
                borderRadius: '8px',
              },
            }}
          />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
