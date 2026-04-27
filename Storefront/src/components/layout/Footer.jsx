import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Customer Care */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <Link to="/account">Help Center</Link>
            <Link to="/account/orders">Track Your Order</Link>
            <Link to="/products">How to Buy</Link>
            <Link to="/">Returns & Refunds</Link>
            <Link to="/">Contact Us</Link>
          </div>

          {/* Column 2: About */}
          <div className="footer-col">
            <h4>Shopperz Mart</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Careers</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms & Conditions</Link>
            <Link to="/">Blog</Link>
          </div>

          {/* Column 3: Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/products?is_new_arrivals=1">New Arrivals</Link>
            <Link to="/products?is_hot_deals=1">Hot Deals</Link>
            <Link to="/products?is_popular=1">Best Sellers</Link>
            <Link to="/products">All Products</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>

          {/* Column 4: Contact */}
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:support@shopperzmart.com" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMail size={14} /> support@shopperzmart.com
            </a>
            <a href="tel:+8801700000000" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiPhone size={14} /> +880 1700-000000
            </a>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', color: 'var(--sm-navy-400)' }}>
              <FiMapPin size={14} /> Dhaka, Bangladesh
            </span>
          </div>
        </div>

        {/* Payment & Bottom */}
        <div className="footer-bottom">
          <div className="footer-payment">
            <span>We Accept:</span>
            <span>💳 Visa</span>
            <span>💳 MasterCard</span>
            <span>📱 bKash</span>
            <span>💵 COD</span>
          </div>
          <p style={{ marginTop: '12px' }}>© {new Date().getFullYear()} Shopperz Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
