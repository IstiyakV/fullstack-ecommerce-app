import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { encodeId } from '../utils/hashId';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return 'https://placehold.co/80x80/f5f5f5/cccccc?text=No+Image';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function Cart() {
  const { items, updateQty, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Shopping Cart — Shopperz Mart</title></Helmet>
        <div className="container">
          <div className="cart-empty">
            <FiShoppingBag size={64} color="var(--sm-text-muted)" />
            <h2>Your cart is empty</h2>
            <p className="text-muted">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg mt-4">
              Continue Shopping <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  const shipping = 50; // Default estimate
  const total = subtotal + shipping;

  return (
    <>
      <Helmet><title>{`Shopping Cart (${itemCount}) — Shopperz Mart`}</title></Helmet>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Shopping Cart ({itemCount})</span>
        </div>

        <div className="cart-layout">
          {/* Cart items */}
          <div className="cart-items">
            <div className="cart-items__header">
              <h2>Shopping Cart</h2>
              <button className="btn btn-ghost btn-sm" onClick={clearCart}>Clear All</button>
            </div>

            {items.map(item => (
              <div key={item.product_id} className="cart-item">
                <Link to={item.product_slug ? `/products/${item.product_slug}-i${encodeId(item.product_id)}.html` : `/products/item-i${encodeId(item.product_id)}.html`} className="cart-item__image">
                  <img src={resolveImage(item.featured_image)} alt={item.product_name} />
                </Link>
                <div className="cart-item__info">
                  <Link to={item.product_slug ? `/products/${item.product_slug}-i${encodeId(item.product_id)}.html` : `/products/item-i${encodeId(item.product_id)}.html`} className="cart-item__name">
                    {item.product_name}
                  </Link>
                  {item.shop_name && (
                    <span className="text-xs text-muted">Sold by: {item.shop_name}</span>
                  )}
                  <div className="cart-item__price">
                    <span className="cart-item__selling">৳{parseFloat(item.selling_price).toLocaleString()}</span>
                    {parseFloat(item.regular_price) > parseFloat(item.selling_price) && (
                      <span className="cart-item__regular">৳{parseFloat(item.regular_price).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="cart-item__qty">
                  <div className="qty-selector">
                    <button className="qty-selector__btn" onClick={() => updateQty(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <FiMinus size={14} />
                    </button>
                    <input className="qty-selector__value" value={item.quantity} readOnly />
                    <button className="qty-selector__btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
                <div className="cart-item__total">
                  ৳{(parseFloat(item.selling_price) * item.quantity).toLocaleString()}
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(item.product_id)} title="Remove">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary__row">
              <span>Subtotal ({itemCount} items)</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
              <span>Shipping (estimated)</span>
              <span>৳{shipping}</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__total">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
            <Link
              to={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
              className="btn btn-primary btn-block btn-lg mt-4"
            >
              Proceed to Checkout
            </Link>
            <Link to="/products" className="btn btn-ghost btn-block btn-sm mt-2">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
