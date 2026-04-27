import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiShoppingCart, FiPackage, FiUsers, FiFolder, FiTag, FiImage, FiGift, FiStar, FiTruck, FiBell, FiSettings, FiCreditCard } from 'react-icons/fi';

const nav = [
  { label: 'MAIN' },
  { to: '/', icon: FiGrid, text: 'Dashboard' },
  { to: '/orders', icon: FiShoppingCart, text: 'Orders' },
  { label: 'CATALOG' },
  { to: '/products', icon: FiPackage, text: 'Products' },
  { to: '/categories', icon: FiFolder, text: 'Categories' },
  { to: '/brands', icon: FiTag, text: 'Brands' },
  { label: 'CONTENT' },
  { to: '/sliders', icon: FiImage, text: 'Sliders' },
  { to: '/banners', icon: FiImage, text: 'Banners' },
  { to: '/vouchers', icon: FiGift, text: 'Vouchers' },
  { label: 'PEOPLE' },
  { to: '/customers', icon: FiUsers, text: 'Customers' },
  { to: '/reviews', icon: FiStar, text: 'Reviews' },
  { to: '/notifications', icon: FiBell, text: 'Notifications' },
  { label: 'SYSTEM' },
  { to: '/shipping', icon: FiTruck, text: 'Shipping' },
  { to: '/settings', icon: FiSettings, text: 'App Config' },
  { to: '/payment-gateways', icon: FiCreditCard, text: 'Payment Gateways' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-[999] md:hidden" onClick={onClose} />}
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">SM</div>
          <span className="brand-text">Shopperz Mart</span>
        </div>
        <nav className="nav-section">
          {nav.map((item, i) =>
            item.label ? (
              <div key={i} className="nav-label">{item.label}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon size={18} />
                <span>{item.text}</span>
              </NavLink>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
