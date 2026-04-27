import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiMapPin, FiTruck, FiCreditCard, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';
const configClient = axios.create({ baseURL: '/api/v1/config', headers: { 'Content-Type': 'application/json' } });

function resolveImage(src) {
  if (!src) return 'https://placehold.co/60x60/f5f5f5/cccccc?text=No+Image';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

const STEPS = [
  { key: 'address', label: 'Address', icon: FiMapPin },
  { key: 'shipping', label: 'Shipping', icon: FiTruck },
  { key: 'review', label: 'Review', icon: FiPackage },
];

export default function Checkout() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shipping state
  const [shippingZone, setShippingZone] = useState(null);
  const [shippingCost, setShippingCost] = useState(50);

  // Order state
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  if (authLoading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login?redirect=/checkout" replace />;
  if (items.length === 0) return <Navigate to="/cart" replace />;

  useEffect(() => {
    Promise.all([
      client.post('/get-address', { user_key: user?.customer_id || user?.id, access_token: token }),
      configClient.post('/cities'),
    ]).then(([addrRes, citiesRes]) => {
      const addrs = addrRes.data.data || [];
      setAddresses(addrs);
      if (addrs.length > 0) setSelectedAddress(addrs[0]);
      setCities(citiesRes.data.data || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load shipping cost when address changes
  useEffect(() => {
    if (!selectedAddress?.city_id) return;
    configClient.post('/shipping-zone-for-city', { city_id: selectedAddress.city_id })
      .then(r => {
        const zone = r.data.data;
        setShippingZone(zone);
        setShippingCost(parseFloat(zone?.shipping_charge || 50));
      })
      .catch(() => setShippingCost(50));
  }, [selectedAddress]);

  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        selling_price: item.selling_price,
        quantity: item.quantity,
        featured_image: item.featured_image,
      }));

      const body = {
        access_token: token,
        user_key: user?.customer_id || user?.id,
        address_id: selectedAddress?.address_id || selectedAddress?.id,
        shipping_address: selectedAddress,
        payment_method: paymentMethod,
        shipping_fee: shippingCost,
        subtotal,
        total_amount: total,
        note,
        items: orderItems,
      };

      const res = await client.post('/order-save', body);
      if (res.data.status_code === 200) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/order-success', { state: { orderId: res.data.data?.order_id } });
      } else {
        toast.error(res.data.message || 'Order failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setPlacing(false);
  };

  return (
    <>
      <Helmet><title>Checkout — Shopperz Mart</title></Helmet>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/cart">Cart</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Checkout</span>
        </div>

        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`checkout-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="checkout-step__circle">
                {i < step ? <FiCheck size={16} /> : <s.icon size={16} />}
              </div>
              <span className="checkout-step__label">{s.label}</span>
              {i < STEPS.length - 1 && <div className="checkout-step__line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Main panel */}
          <div className="checkout-main">
            {/* Step 1: Address */}
            {step === 0 && (
              <div className="checkout-panel">
                <h2><FiMapPin size={20} /> Select Delivery Address</h2>
                {loading ? (
                  <div className="skeleton" style={{ height: '100px' }} />
                ) : addresses.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <p className="text-muted">No saved addresses. Please add one first.</p>
                    <Link to="/account/addresses" className="btn btn-primary btn-sm mt-3">Add Address</Link>
                  </div>
                ) : (
                  <div className="address-select-list">
                    {addresses.map(a => (
                      <label key={a.address_id || a.id} className={`address-select-card ${selectedAddress?.address_id === a.address_id ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?.address_id === a.address_id}
                          onChange={() => setSelectedAddress(a)}
                        />
                        <div>
                          <p className="font-medium">{a.recipient_name} <span className="badge badge-primary" style={{ marginLeft: '8px' }}>{a.label}</span></p>
                          <p className="text-sm">{a.phone}</p>
                          <p className="text-sm text-muted mt-1">{a.full_address}, {a.city_name}{a.postal_code ? ` - ${a.postal_code}` : ''}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="checkout-actions mt-4">
                  <Link to="/cart" className="btn btn-ghost">← Back to Cart</Link>
                  <button className="btn btn-primary" onClick={() => setStep(1)} disabled={!selectedAddress}>
                    Continue to Shipping →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping & Payment */}
            {step === 1 && (
              <div className="checkout-panel">
                <h2><FiTruck size={20} /> Shipping & Payment</h2>

                <div className="checkout-section">
                  <h3>Shipping Zone</h3>
                  <div className="shipping-info-card">
                    <p className="font-medium">{shippingZone?.zone_name || 'Standard Shipping'}</p>
                    <p className="text-sm text-muted">{shippingZone?.estimated_days || '3-5'} business days</p>
                    <p className="text-primary font-semibold">৳{shippingCost}</p>
                  </div>
                </div>

                <div className="checkout-section mt-4">
                  <h3>Payment Method</h3>
                  <div className="payment-methods">
                    <label className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <span>💵 Cash on Delivery</span>
                    </label>
                    <label className={`payment-method-card ${paymentMethod === 'bkash' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} />
                      <span>📱 bKash</span>
                    </label>
                    <label className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                      <span>💳 Credit/Debit Card</span>
                    </label>
                  </div>
                </div>

                <div className="checkout-section mt-4">
                  <h3>Order Note (optional)</h3>
                  <textarea className="form-textarea" rows={3} placeholder="Any special instructions..." value={note} onChange={e => setNote(e.target.value)} />
                </div>

                <div className="checkout-actions mt-4">
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 2 && (
              <div className="checkout-panel">
                <h2><FiPackage size={20} /> Review Your Order</h2>

                <div className="checkout-section">
                  <h3>Delivery Address</h3>
                  <div className="review-card">
                    <p className="font-medium">{selectedAddress?.recipient_name}</p>
                    <p className="text-sm">{selectedAddress?.phone}</p>
                    <p className="text-sm text-muted">{selectedAddress?.full_address}, {selectedAddress?.city_name}</p>
                  </div>
                </div>

                <div className="checkout-section mt-4">
                  <h3>Items ({itemCount})</h3>
                  <div className="review-items">
                    {items.map(item => (
                      <div key={item.product_id} className="review-item">
                        <img src={resolveImage(item.featured_image)} alt={item.product_name} />
                        <div className="review-item__info">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted">Qty: {item.quantity} × ৳{parseFloat(item.selling_price).toLocaleString()}</p>
                        </div>
                        <span className="font-semibold">৳{(parseFloat(item.selling_price) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="checkout-section mt-4">
                  <h3>Payment</h3>
                  <p className="text-sm">{paymentMethod === 'cod' ? '💵 Cash on Delivery' : paymentMethod === 'bkash' ? '📱 bKash' : '💳 Card'}</p>
                </div>

                <div className="checkout-actions mt-4">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : `Place Order — ৳${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary__row">
              <span>Subtotal ({itemCount} items)</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
              <span>Shipping</span>
              <span>৳{shippingCost}</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__total">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
