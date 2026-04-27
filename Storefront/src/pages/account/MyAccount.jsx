import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMapPin, FiPackage, FiHeart, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/account/profile', icon: FiUser, label: 'My Profile' },
  { to: '/account/addresses', icon: FiMapPin, label: 'Addresses' },
  { to: '/account/orders', icon: FiPackage, label: 'My Orders' },
  { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
];

export default function MyAccount() {
  const { user, isAuthenticated, logout, loading } = useAuth();

  if (loading) {
    return (
      <>
        <Helmet><title>Loading... — Shopperz Mart</title></Helmet>
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto' }} />
          <p className="text-muted mt-4">Loading account details...</p>
        </div>
      </>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login?redirect=/account" replace />;

  return (
    <>
      <Helmet><title>My Account — Shopperz Mart</title></Helmet>
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Home</a>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">My Account</span>
        </div>

        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="account-sidebar__user">
              <div className="account-sidebar__avatar">
                {user?.customer_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold">{user?.customer_name || 'User'}</p>
                <p className="text-xs text-muted">{user?.customer_phone}</p>
              </div>
            </div>
            <nav className="account-sidebar__nav">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `account-sidebar__link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
              <button className="account-sidebar__link account-sidebar__logout" onClick={logout}>
                <FiLogOut size={16} /> Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="account-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
