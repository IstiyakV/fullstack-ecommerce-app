import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck, FiPackage, FiTruck, FiBox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STATUS_ICONS = {
  placed: FiBox,
  confirmed: FiCheck,
  preparing: FiPackage,
  packed: FiPackage,
  in_transit: FiTruck,
  delivery_assigned: FiTruck,
  out_for_delivery: FiTruck,
  delivered: FiCheck,
  cancelled: FiCheck,
  delivery_failed: FiCheck,
};

const STATUS_META = {
  placed:             { icon: FiBox,         color: '#f59e0b', bg: '#fef3c7', label: 'Order Placed' },
  confirmed:          { icon: FiCheck,       color: '#3b82f6', bg: '#dbeafe', label: 'Confirmed' },
  preparing:          { icon: FiPackage,     color: '#8b5cf6', bg: '#ede9fe', label: 'Preparing' },
  packed:             { icon: FiPackage,     color: '#6366f1', bg: '#e0e7ff', label: 'Packed' },
  in_transit:         { icon: FiTruck,       color: '#0ea5e9', bg: '#e0f2fe', label: 'In Transit' },
  delivery_assigned:  { icon: FiTruck,       color: '#0ea5e9', bg: '#e0f2fe', label: 'Delivery Assigned' },
  out_for_delivery:   { icon: FiTruck,       color: '#06b6d4', bg: '#cffafe', label: 'Out for Delivery' },
  delivered:          { icon: FiCheck,       color: '#10b981', bg: '#d1fae5', label: 'Delivered' },
  cancelled:          { icon: FiCheck,       color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
  delivery_failed:    { icon: FiCheck,       color: '#ef4444', bg: '#fee2e2', label: 'Delivery Failed' },
  delivery_attempt_1: { icon: FiTruck,       color: '#f59e0b', bg: '#fef3c7', label: 'Delivery Attempt 1' },
  delivery_attempt_2: { icon: FiTruck,       color: '#f59e0b', bg: '#fef3c7', label: 'Delivery Attempt 2' },
  delivery_attempt_3: { icon: FiTruck,       color: '#f59e0b', bg: '#fef3c7', label: 'Delivery Attempt 3' },
};

// Map backend status to horizontal stepper stages
const getActiveStep = (status) => {
  if (['placed', 'confirmed', 'preparing'].includes(status)) return 1;
  if (['packed'].includes(status)) return 2;
  if (['in_transit', 'delivery_assigned', 'out_for_delivery', 'delivery_attempt_1', 'delivery_attempt_2', 'delivery_attempt_3'].includes(status)) return 3;
  if (['delivered', 'delivery_failed', 'cancelled'].includes(status)) return 4;
  return 1;
};

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.post('/order-details', { user_key: user?.customer_id || user?.id, access_token: token, order_id: id })
      .then(res => {
        if (res.data.status_code === 200) {
          setOrder(res.data.data);
        } else {
          toast.error(res.data.message || 'Order not found');
          navigate('/account/orders');
        }
      })
      .catch(() => {
        toast.error('Failed to load tracking details');
        navigate('/account/orders');
      })
      .finally(() => setLoading(false));
  }, [id, user, token, navigate]);

  const copyTracking = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success('Tracking number copied!');
    }
  };

  if (loading) {
    return (
      <div className="account-panel">
        <div className="skeleton" style={{ height: '200px', marginBottom: '20px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
      </div>
    );
  }

  if (!order) return null;

  const activeStep = getActiveStep(order.order_status);
  
  // Custom timeline processing to split date and time
  const reversedTimeline = [...(order.timeline || [])].reverse();

  return (
    <div className="account-panel" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to={`/account/orders/${id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px', marginRight: '12px' }}>
          <FiArrowLeft size={18} />
        </Link>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Tracking Details</h2>
      </div>

      {/* Header Info Card */}
      <div className="card p-4 mb-4" style={{ borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiTruck size={28} color="#0284c7" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Courier Info</p>
              <p style={{ fontWeight: 600, margin: 0, color: 'var(--sm-text-primary)' }}>Delivery Partner: Shopperz Logistics</p>
            </div>
          </div>
          <div style={{ paddingLeft: '24px', borderLeft: '1px solid var(--sm-border-light)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--sm-text-muted)', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tracking Number</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontWeight: 600, color: '#0369a1', margin: 0 }}>{order.tracking_number || 'Pending'}</p>
              {order.tracking_number && (
                <button onClick={copyTracking} title="Copy" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '4px' }}>
                  <FiCopy size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Stepper */}
      <div className="card mb-4" style={{ padding: '32px 24px', borderRadius: '12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '500px', position: 'relative' }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'var(--sm-border-light)', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: '24px', left: '10%', width: `${(activeStep - 1) * 33.33}%`, height: '2px', background: 'var(--sm-primary)', zIndex: 1, transition: 'width 0.3s ease' }} />

          {[
            { step: 1, label: 'Processing', icon: FiBox },
            { step: 2, label: 'Packed', icon: FiPackage },
            { step: 3, label: 'Shipped', icon: FiTruck },
            { step: 4, label: 'Delivered', icon: FiCheck },
          ].map((s) => {
            const isActive = activeStep >= s.step;
            const isCurrent = activeStep === s.step;
            const Icon = s.icon;
            return (
              <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '25%' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: isActive ? 'var(--sm-primary)' : '#fff',
                  border: isActive ? 'none' : '2px dashed var(--sm-border-light)',
                  color: isActive ? '#fff' : 'var(--sm-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(6, 182, 212, 0.2)' : 'none',
                  marginBottom: '12px', transition: 'all 0.3s ease'
                }}>
                  <Icon size={22} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--sm-text-primary)' : 'var(--sm-text-muted)' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="card p-4" style={{ borderRadius: '12px' }}>
        <div style={{ padding: '16px 24px', maxWidth: '800px', margin: '0 auto' }}>
          {reversedTimeline.map((t, idx) => {
            const d = new Date(t.timestamp);
            const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const isLast = idx === reversedTimeline.length - 1;
            const isLatest = idx === 0;

            let bgColor = '#e2e8f0';
            let labelColor = 'var(--sm-text-muted)';
            
            if (isLatest) {
              bgColor = 'var(--sm-primary)';
              labelColor = 'var(--sm-text-primary)';
              if (t.status === 'delivered') bgColor = '#10b981';
              if (['cancelled', 'delivery_failed'].includes(t.status)) bgColor = '#ef4444';
            } else if (t.status === 'delivered') {
                bgColor = '#10b981';
            }

            return (
              <div key={idx} style={{ display: 'flex', minHeight: '80px', position: 'relative' }}>
                {/* Date & Time Column - Single Line */}
                <div style={{ width: '130px', flexShrink: 0, textAlign: 'right', paddingRight: '24px', paddingTop: '4px' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: isLatest ? 700 : 500, color: isLatest ? 'var(--sm-text-primary)' : '#94a3b8' }}>
                    {dateStr} {timeStr}
                  </div>
                </div>

                {/* Vertical Line & Dot */}
                <div style={{ position: 'relative', width: '20px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  {!isLast && (
                    <div style={{ position: 'absolute', top: '24px', bottom: '-8px', width: '2px', background: 'var(--sm-border-light)' }} />
                  )}
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', background: bgColor,
                    border: isLatest ? 'none' : '2px solid #e2e8f0', boxShadow: '0 0 0 4px #fff',
                    marginTop: '6px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isLatest && <FiCheck size={10} color="#fff" />}
                  </div>
                </div>

                {/* Content Column */}
                <div style={{ flex: 1, paddingLeft: '24px', paddingBottom: '32px', paddingTop: '4px' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: isLatest ? 600 : 500, color: labelColor, textTransform: 'capitalize' }}>
                    {t.status.replace(/_/g, ' ')}
                  </p>
                  {t.note && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {t.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
