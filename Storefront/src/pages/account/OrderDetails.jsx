import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiPackage, FiClock, FiCheckCircle, FiXCircle,
  FiTruck, FiMapPin, FiPhone, FiUser, FiExternalLink,
  FiCreditCard, FiTag, FiCalendar, FiHash, FiCopy
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return 'https://placehold.co/80x80/f8f9fa/adb5bd?text=No+Img';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

const STATUS_META = {
  placed:             { icon: FiClock,       color: '#f59e0b', bg: '#fef3c7', label: 'Order Placed' },
  confirmed:          { icon: FiCheckCircle, color: '#3b82f6', bg: '#dbeafe', label: 'Confirmed' },
  preparing:          { icon: FiPackage,     color: '#8b5cf6', bg: '#ede9fe', label: 'Preparing' },
  packed:             { icon: FiPackage,     color: '#6366f1', bg: '#e0e7ff', label: 'Packed' },
  in_transit:         { icon: FiTruck,       color: '#0ea5e9', bg: '#e0f2fe', label: 'In Transit' },
  delivery_assigned:  { icon: FiTruck,       color: '#0ea5e9', bg: '#e0f2fe', label: 'Delivery Assigned' },
  out_for_delivery:   { icon: FiTruck,       color: '#06b6d4', bg: '#cffafe', label: 'Out for Delivery' },
  delivered:          { icon: FiCheckCircle, color: '#10b981', bg: '#d1fae5', label: 'Delivered' },
  cancelled:          { icon: FiXCircle,     color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
  delivery_failed:    { icon: FiXCircle,     color: '#ef4444', bg: '#fee2e2', label: 'Delivery Failed' },
  delivery_attempt_1: { icon: FiTruck,       color: '#f59e0b', bg: '#fef3c7', label: 'Delivery Attempt 1' },
  delivery_attempt_2: { icon: FiTruck,       color: '#f59e0b', bg: '#fef3c7', label: 'Delivery Attempt 2' },
  delivery_attempt_3: { icon: FiTruck,       color: '#f59e0b', bg: '#fef3c7', label: 'Delivery Attempt 3' },
};

const statusBadgeClass = (status) => {
  const map = {
    placed: 'badge-warning', confirmed: 'badge-primary', preparing: 'badge-primary',
    packed: 'badge-primary', in_transit: 'badge-primary', delivery_assigned: 'badge-primary',
    out_for_delivery: 'badge-primary', delivered: 'badge-success',
    cancelled: 'badge-danger', delivery_failed: 'badge-danger',
  };
  return map[status] || 'badge-neutral';
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { loadOrder(); }, [id]);

  const loadOrder = () => {
    client.post('/order-details', { user_key: user?.customer_id || user?.id, access_token: token, order_id: id })
      .then(res => {
        if (res.data.status_code === 200) setOrder(res.data.data);
        else { toast.error(res.data.message || 'Order not found'); navigate('/account/orders'); }
      })
      .catch(() => { toast.error('Failed to load order'); navigate('/account/orders'); })
      .finally(() => setLoading(false));
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    setCancelling(true);
    try {
      const res = await client.post('/cancel-order', {
        user_key: user?.customer_id || user?.id, access_token: token, order_id: id,
      });
      if (res.data.status_code === 200) { toast.success(res.data.message || 'Order cancelled'); loadOrder(); }
      else toast.error(res.data.message || 'Failed to cancel order');
    } catch { toast.error('Something went wrong'); }
    setCancelling(false);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.order_id);
    toast.success('Order ID copied!');
  };

  if (loading) {
    return (
      <div className="account-panel">
        <div className="skeleton" style={{ height: '120px', marginBottom: '16px', borderRadius: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }} />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const addr = order.shipping_address || {};
  const currentStatus = STATUS_META[order.order_status] || STATUS_META.placed;
  const CurrentIcon = currentStatus.icon;
  const subtotal = parseFloat(order.total_amount) - parseFloat(order.shipping_fee || 0) + parseFloat(order.discount_amount || 0);

  return (
    <div className="account-panel" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/account/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sm-bg)', border: '1px solid var(--sm-border-light)', color: 'var(--sm-text-secondary)', transition: 'all 0.2s', textDecoration: 'none' }}>
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Order Details</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)' }}>#{order.order_id}</span>
              <button onClick={copyOrderId} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--sm-text-muted)', display: 'flex' }} title="Copy Order ID">
                <FiCopy size={11} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {order.can_cancel && (
            <button onClick={handleCancel} disabled={cancelling} style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2',
              color: '#dc2626', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'inherit', opacity: cancelling ? 0.6 : 1,
            }}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <Link to={`/account/orders/${order.order_id}/track`} style={{
            padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--sm-primary)', background: 'var(--sm-primary-bg)',
            color: 'var(--sm-primary)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            Track Package
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${currentStatus.bg}, #fff)`,
        border: `1px solid ${currentStatus.color}22`,
        borderRadius: '12px', padding: '20px 24px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: currentStatus.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <CurrentIcon size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', color: currentStatus.color, margin: 0 }}>{currentStatus.label}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)', margin: '2px 0 0' }}>
              {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)', margin: 0 }}>Total</p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--sm-primary)', margin: '2px 0 0' }}>৳{parseFloat(order.total_amount).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)', margin: 0 }}>Payment</p>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '2px 0 0', textTransform: 'uppercase' }}>{order.payment_method}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)', margin: 0 }}>Status</p>
            <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '4px' }}>{order.payment_status}</span>
          </div>
        </div>
      </div>

      {/* Tracking Banner — only show when tracking info exists */}
      {order.tracking_number && (
        <div style={{
          background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
          border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiTruck size={20} color="#0284c7" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)', margin: 0 }}>Tracking Number</p>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0369a1', margin: '2px 0 0', fontFamily: 'monospace' }}>{order.tracking_number}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {order.estimated_delivery && (
              <span style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiCalendar size={12} /> Est. {order.estimated_delivery}
              </span>
            )}
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
                background: '#0284c7', color: '#fff', fontWeight: 600, fontSize: '0.8125rem',
                textDecoration: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
              }}>
                Track Order <FiExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '16px' }}>

        {/* Left Column — Items */}
        <div style={{ background: '#fff', border: '1px solid var(--sm-border-light)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sm-border-light)', background: 'var(--sm-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)' }}>
              <FiPackage size={13} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
              Order Items ({order.items?.length || 0})
            </h3>
          </div>
          <div style={{ padding: '12px 20px' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: '14px', padding: '14px 0',
                borderBottom: idx !== order.items.length - 1 ? '1px solid var(--sm-border-light)' : 'none',
              }}>
                <img src={resolveImage(item.image)} alt={item.product_name} style={{
                  width: '72px', height: '72px', objectFit: 'contain', borderRadius: '8px',
                  background: '#f8f9fa', border: '1px solid var(--sm-border-light)', flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--sm-text-muted)', margin: '4px 0 0' }}>Sold by: {item.shop_name || 'Shopperz Mart'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--sm-primary)' }}>৳{parseFloat(item.selling_price).toLocaleString()}</span>
                    <span style={{
                      fontSize: '0.75rem', color: 'var(--sm-text-muted)',
                      background: 'var(--sm-bg)', padding: '2px 10px', borderRadius: '20px',
                    }}>Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown inside items card */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--sm-border-light)', background: 'var(--sm-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--sm-text-muted)' }}>Subtotal</span>
              <span style={{ fontSize: '0.8125rem' }}>৳{subtotal > 0 ? subtotal.toLocaleString() : parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--sm-text-muted)' }}>Shipping</span>
              <span style={{ fontSize: '0.8125rem' }}>৳{parseFloat(order.shipping_fee || 0).toLocaleString()}</span>
            </div>
            {parseFloat(order.discount_amount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#10b981' }}>Discount</span>
                <span style={{ fontSize: '0.8125rem', color: '#10b981' }}>-৳{parseFloat(order.discount_amount).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed var(--sm-border-light)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--sm-primary)' }}>৳{parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column — Address + Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Delivery Address Card */}
          <div style={{ background: '#fff', border: '1px solid var(--sm-border-light)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sm-border-light)', background: 'var(--sm-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)' }}>
                <FiMapPin size={13} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
                Delivery Address
              </h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {addr.label && (
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '0.6875rem',
                  fontWeight: 600, background: 'var(--sm-primary-bg)', color: 'var(--sm-primary)', marginBottom: '10px',
                }}>
                  {addr.label}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FiUser size={13} color="var(--sm-text-muted)" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{addr.recipient_name || 'N/A'}</span>
              </div>
              {addr.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FiPhone size={13} color="var(--sm-text-muted)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--sm-text-secondary)' }}>{addr.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                <FiMapPin size={13} color="var(--sm-text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--sm-text-secondary)', lineHeight: 1.5 }}>
                    {addr.full_address || 'Not available'}
                  </p>
                  {addr.city_name && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--sm-text-muted)' }}>
                      {addr.city_name}{addr.postal_code ? ` - ${addr.postal_code}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div style={{ background: '#fff', border: '1px solid var(--sm-border-light)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sm-border-light)', background: 'var(--sm-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)' }}>
                <FiCreditCard size={13} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
                Payment Details
              </h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--sm-text-muted)' }}>Method</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>{order.payment_method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--sm-text-muted)' }}>Status</span>
                <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.payment_status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--sm-text-muted)' }}>Shipping</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'capitalize' }}>{order.shipping_method}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline Card */}
          <div style={{ background: '#fff', border: '1px solid var(--sm-border-light)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sm-border-light)', background: 'var(--sm-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sm-text-muted)' }}>
                <FiClock size={13} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
                Order Timeline
              </h3>
            </div>
            <div style={{ padding: '20px 20px 20px 36px', position: 'relative' }}>
              {order.timeline?.map((t, idx) => {
                const meta = STATUS_META[t.status] || { icon: FiCheckCircle, color: '#6b7280', bg: '#f3f4f6' };
                const Icon = meta.icon;
                const isLast = idx === order.timeline.length - 1;
                const isFirst = idx === 0;

                return (
                  <div key={t.timeline_id || idx} style={{
                    position: 'relative',
                    paddingBottom: isLast ? 0 : '24px',
                  }}>
                    {/* Connector line */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute', left: '-18px', top: '28px', bottom: 0,
                        width: '2px', background: `linear-gradient(to bottom, ${meta.color}44, ${meta.color}11)`,
                      }} />
                    )}
                    {/* Icon dot */}
                    <div style={{
                      position: 'absolute', left: '-26px', top: '2px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: isFirst ? meta.color : '#fff',
                      border: isFirst ? 'none' : `2px solid ${meta.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isFirst ? `0 0 0 4px ${meta.color}22` : 'none',
                    }}>
                      <Icon size={10} color={isFirst ? '#fff' : meta.color} />
                    </div>
                    {/* Content */}
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: meta.color, margin: 0, textTransform: 'capitalize' }}>
                        {t.status.replace(/_/g, ' ')}
                      </p>
                      {t.note && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)', margin: '3px 0 0', lineHeight: 1.4 }}>{t.note}</p>
                      )}
                      <p style={{ fontSize: '0.625rem', color: 'var(--sm-text-muted)', margin: '4px 0 0', fontFamily: 'monospace' }}>
                        {new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 720px) {
          .account-panel > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
