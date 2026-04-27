import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="header">
      {/* Top utility bar */}
      <div className="header-top">
        <div className="container">
          <div className="header-top__links">
            <span>Welcome to Shopperz Mart!</span>
          </div>
          <div className="header-top__links">
            <Link to="/account/orders">Track Order</Link>
            <Link to="/account">Help & Support</Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="header-main">
        <div className="container">
          {/* Mobile menu toggle */}
          <button className="header-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="header-logo">
            Shopperz<span>Mart</span>
          </Link>

          {/* Search */}
          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="header-search__btn" aria-label="Search">
              <FiSearch size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className="header-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="header-action">
              <FiHeart className="header-action__icon" size={22} />
              {wishlistItemCount > 0 && <span className="header-action__badge">{wishlistItemCount}</span>}
              <span>Wishlist</span>
            </Link>

            {/* Account */}
            <div
              className="header-action"
              onMouseEnter={() => setAccountDropdown(true)}
              onMouseLeave={() => setAccountDropdown(false)}
              style={{ position: 'relative' }}
            >
              <FiUser className="header-action__icon" size={22} />
              <span>{isAuthenticated ? user?.customer_name?.split(' ')[0] : 'Account'}</span>

              {accountDropdown && (
                <div className="header-dropdown">
                  {isAuthenticated ? (
                    <>
                      <Link to="/account" className="header-dropdown__item">My Account</Link>
                      <Link to="/account/orders" className="header-dropdown__item">My Orders</Link>
                      <Link to="/wishlist" className="header-dropdown__item">My Wishlist</Link>
                      <button className="header-dropdown__item" onClick={logout}>Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="header-dropdown__item header-dropdown__item--cta">Login</Link>
                      <Link to="/register" className="header-dropdown__item">New Customer? Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="header-action">
              <FiShoppingCart className="header-action__icon" size={22} />
              {cartItemCount > 0 && <span className="header-action__badge">{cartItemCount}</span>}
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
